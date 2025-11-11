/**
 * Supabase Client Configuration
 * Uses SUPABASE_URL and SUPABASE_ANON_KEY for connection
 * This is more reliable for serverless deployments than direct PostgreSQL connection
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Database types for TypeScript
export type LP = {
  id: string
  name: string
  contactName: string | null
  email: string | null
  geo: string | null
  strategy: string[]
  score: number
  messageAngle: string | null
  createdAt: string
  updatedAt: string
}

export type Signal = {
  id: string
  lpId: string
  summary: string
  tags: string[]
  url: string | null
  weight: number
  createdAt: string | Date | any  // Allow both string (from DB) and Date (for scoring functions)
}

export type Outreach = {
  id: string
  lpId: string
  subject: string | null
  body: string | null
  channel: string
  sentAt: string
}

// Helper functions for common operations
export const db = {
  // LP operations
  lp: {
    findMany: async (options?: { orderBy?: any; take?: number; where?: any }) => {
      let query = supabase.from('LP').select('*')

      if (options?.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }

      if (options?.take) {
        query = query.limit(options.take)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as LP[]
    },

    findUnique: async (options: { where: { id?: string; name?: string }; include?: any }) => {
      let baseQuery = supabase.from('LP').select('*')

      if (options.where.id) {
        baseQuery = baseQuery.eq('id', options.where.id)
      } else if (options.where.name) {
        baseQuery = baseQuery.eq('name', options.where.name)
      }

      const { data, error } = await baseQuery.single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

      if (!data) return null

      let result: any = data

      // Include related data if requested
      if (options.include) {
        if (options.include.signals) {
          const { data: signals } = await supabase
            .from('Signal')
            .select('*')
            .eq('lpId', result.id)
            .order('createdAt', { ascending: false })
          result.signals = (signals || []).map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt) as any,
          }))
        }

        if (options.include.outreaches) {
          const { data: outreaches } = await supabase
            .from('Outreach')
            .select('*')
            .eq('lpId', result.id)
            .order('sentAt', { ascending: false })
          result.outreaches = outreaches || []
        }
      }

      return result as LP & { signals?: Signal[]; outreaches?: Outreach[] }
    },

    create: async (options: { data: Partial<LP> }) => {
      const { data, error } = await supabase
        .from('LP')
        .insert([options.data])
        .select()
        .single()

      if (error) throw error
      return data as LP
    },

    update: async (options: { where: { id: string }; data: Partial<LP> }) => {
      const { data, error } = await supabase
        .from('LP')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single()

      if (error) throw error
      return data as LP
    },

    count: async () => {
      const { count, error } = await supabase
        .from('LP')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    },

    upsert: async (options: {
      where: { name: string }
      update: Partial<LP>
      create: Partial<LP>
    }) => {
      // Try to find existing LP
      const { data: existing } = await supabase
        .from('LP')
        .select('*')
        .eq('name', options.where.name)
        .single()

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('LP')
          .update(options.update)
          .eq('name', options.where.name)
          .select()
          .single()

        if (error) throw error
        return data as LP
      } else {
        // Create new
        const { data, error } = await supabase
          .from('LP')
          .insert([options.create])
          .select()
          .single()

        if (error) throw error
        return data as LP
      }
    },
  },

  // Signal operations
  signal: {
    findMany: async (options?: { where?: any; orderBy?: any; take?: number }) => {
      let query = supabase.from('Signal').select('*')

      if (options?.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }

      if (options?.take) {
        query = query.limit(options.take)
      }

      const { data, error } = await query
      if (error) throw error

      // Convert createdAt from string to Date for compatibility with scoring functions
      return ((data || []) as Signal[]).map((signal: Signal) => ({
        ...signal,
        createdAt: new Date(signal.createdAt) as any, // Cast to any to satisfy both string and Date types
      })) as Signal[]
    },

    create: async (options: { data: Partial<Signal> }) => {
      const { data, error } = await supabase
        .from('Signal')
        .insert([options.data])
        .select()
        .single()

      if (error) throw error
      return data as Signal
    },
  },

  // Outreach operations
  outreach: {
    findMany: async (options?: { where?: any; orderBy?: any }) => {
      let query = supabase.from('Outreach').select('*')

      if (options?.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.orderBy) {
        const [field, direction] = Object.entries(options.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }

      const { data, error } = await query
      if (error) throw error
      return data as Outreach[]
    },

    create: async (options: { data: Partial<Outreach> }) => {
      const { data, error } = await supabase
        .from('Outreach')
        .insert([options.data])
        .select()
        .single()

      if (error) throw error
      return data as Outreach
    },
  },
}
