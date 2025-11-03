import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
  }

  // Test Prisma client
  try {
    await prisma.$connect()
    checks.prismaClient = 'Connected'

    // Try a simple query
    const count = await prisma.lP.count()
    checks.lpCount = count
    checks.database = 'OK'
  } catch (error: any) {
    checks.prismaClient = 'Failed'
    checks.database = 'ERROR'
    checks.error = error.message
    checks.errorCode = error.code
  } finally {
    await prisma.$disconnect()
  }

  const allOk = checks.database === 'OK' && checks.prismaClient === 'Connected'

  return NextResponse.json(checks, {
    status: allOk ? 200 : 500
  })
}
