import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OutreachForm } from './OutreachForm'

export const dynamic = 'force-dynamic'

export default async function LPDetailPage({ params }: { params: { id: string } }) {
  const lp = await prisma.lP.findUnique({
    where: { id: params.id },
    include: {
      signals: {
        orderBy: { createdAt: 'desc' },
      },
      outreaches: {
        orderBy: { sentAt: 'desc' },
      },
    },
  })

  if (!lp) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{lp.name}</h1>
            {lp.contactName && (
              <p className="text-lg text-gray-600">Contact: {lp.contactName}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{lp.score}</div>
            <div className="text-sm text-gray-500">Priority Score</div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900">{lp.email || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Geography</dt>
            <dd className="text-sm text-gray-900">{lp.geo || 'Not specified'}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-2">Investment Strategy</dt>
            <dd className="flex flex-wrap gap-2">
              {lp.strategy.length > 0 ? (
                lp.strategy.map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No strategy specified</span>
              )}
            </dd>
          </div>
          {lp.messageAngle && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-1">Suggested Message Angle</dt>
              <dd className="text-sm text-gray-900 italic bg-yellow-50 p-3 rounded">
                {lp.messageAngle}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Signals */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">
          Signals ({lp.signals.length})
        </h2>
        {lp.signals.length === 0 ? (
          <p className="text-gray-500">No signals recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {lp.signals.map(signal => (
              <div key={signal.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-gray-900">{signal.summary}</p>
                  <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                    {new Date(signal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {signal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {signal.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {signal.url && (
                  <a
                    href={signal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Source →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Outreach Form */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Create Outreach</h2>
        <OutreachForm lpId={lp.id} messageAngle={lp.messageAngle} />
      </section>

      {/* Past Outreaches */}
      {lp.outreaches.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">
            Past Outreaches ({lp.outreaches.length})
          </h2>
          <div className="space-y-3">
            {lp.outreaches.map(outreach => (
              <div key={outreach.id} className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {outreach.channel}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(outreach.sentAt).toLocaleString()}
                  </span>
                </div>
                {outreach.subject && (
                  <p className="text-sm font-medium text-gray-900 mb-1">{outreach.subject}</p>
                )}
                {outreach.body && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{outreach.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
