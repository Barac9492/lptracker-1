import { NextResponse } from 'next/server'
import { db, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing',
  }

  // Test Supabase connection
  try {
    // Test database connection
    const count = await db.lp.count()
    checks.lpCount = count
    checks.database = 'OK'
    checks.supabaseClient = 'Connected'
  } catch (error: any) {
    checks.supabaseClient = 'Failed'
    checks.database = 'ERROR'
    checks.error = error.message
    checks.errorCode = error.code
    checks.errorDetails = error.details || null
    checks.errorHint = error.hint || null
  }

  const allOk = checks.database === 'OK' && checks.supabaseClient === 'Connected'

  return NextResponse.json(checks, {
    status: allOk ? 200 : 500
  })
}
