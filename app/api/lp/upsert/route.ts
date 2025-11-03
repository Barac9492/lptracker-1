import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, contactName, email, geo, strategy } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const lp = await prisma.lP.upsert({
      where: { name },
      update: {
        contactName: contactName || null,
        email: email || null,
        geo: geo || null,
        strategy: Array.isArray(strategy) ? strategy : [],
      },
      create: {
        name,
        contactName: contactName || null,
        email: email || null,
        geo: geo || null,
        strategy: Array.isArray(strategy) ? strategy : [],
      },
    })

    return NextResponse.json(lp)
  } catch (error) {
    console.error('Error upserting LP:', error)
    return NextResponse.json(
      { error: 'Failed to upsert LP' },
      { status: 500 }
    )
  }
}
