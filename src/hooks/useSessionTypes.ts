// src/hooks/useSessionTypes.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type SessionType = Database['public']['Tables']['session_types']['Row']

export function useSessionTypes() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessionTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('session_types')
        .select('*')
        .order('name')

      if (error) throw error
      setSessionTypes(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      setSessionTypes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessionTypes()
  }, [fetchSessionTypes])

  return { 
    sessionTypes, 
    loading, 
    error, 
    refetch: fetchSessionTypes 
  }
}