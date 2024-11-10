import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type SessionType = Database['public']['Tables']['session_types']['Row']

export function useSessionTypes() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSessionTypes() {
      try {
        const { data, error } = await supabase
          .from('session_types')
          .select('*')
          .order('priority')

        if (error) throw error
        setSessionTypes(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSessionTypes()
  }, [])

  return { sessionTypes, loading, error }
}