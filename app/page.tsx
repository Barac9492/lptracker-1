import { prisma } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Get top 3 LPs by score
  const topLPs = await prisma.lP.findMany({
    orderBy: { score: 'desc' },
    take: 3,
  })

  // Get latest 50 LPs
  const recentLPs = await prisma.lP.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">LP Intelligence Dashboard</h1>
        <p className="text-gray-600">Track signals and prioritize outreach</p>
      </div>

      {/* Top 3 LPs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Top Priority LPs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topLPs.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No LPs yet. <Link href="/upload" className="text-blue-600 hover:underline">Upload CSV</Link> to get started.
            </div>
          ) : (
            topLPs.map((lp: typeof topLPs[0], index: number) => (
              <Link key={lp.id} href={`/lp/${lp.id}`} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl font-bold text-blue-600">#{index + 1}</span>
                  <span className="text-2xl font-bold text-gray-900">{lp.score}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{lp.name}</h3>
                {lp.contactName && (
                  <p className="text-sm text-gray-600 mb-2">Contact: {lp.contactName}</p>
                )}
                {lp.geo && (
                  <p className="text-sm text-gray-500 mb-2">{lp.geo}</p>
                )}
                {lp.strategy.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lp.strategy.map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {lp.messageAngle && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Suggested Angle:</p>
                    <p className="text-sm text-gray-600 italic">{lp.messageAngle}</p>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Recent LPs Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All LPs ({recentLPs.length})</h2>
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Contact</th>
                <th>Geo</th>
                <th>Strategy</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLPs.map((lp: typeof recentLPs[0]) => (
                <tr key={lp.id} className="hover:bg-gray-50">
                  <td>
                    <Link href={`/lp/${lp.id}`} className="text-blue-600 hover:underline font-medium">
                      {lp.name}
                    </Link>
                  </td>
                  <td>
                    <span className="font-semibold">{lp.score}</span>
                  </td>
                  <td className="text-gray-600">{lp.contactName || '-'}</td>
                  <td className="text-gray-600">{lp.geo || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {lp.strategy.slice(0, 2).map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {s}
                        </span>
                      ))}
                      {lp.strategy.length > 2 && (
                        <span className="text-xs text-gray-500">+{lp.strategy.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(lp.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
