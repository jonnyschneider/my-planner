// src/components/schedule/CreateSessionDialog.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { useSessionTypes } from '@/hooks/useSessionTypes'
import { supabase } from '@/lib/supabase'
import { Clock, Loader2 } from 'lucide-react'

const DEBUG = true

function logDebug(area: string, message: string, data?: any) {
  if (DEBUG) {
    console.group(`🔍 ${area}`)
    console.log(message)
    if (data) console.dir(data)
    console.groupEnd()
  }
}

interface CreateSessionProps {
  date: Date
  startTime: string
  isOpen: boolean
  onClose: () => void
  onSessionCreated: () => void
}

export function CreateSessionDialog({
  date,
  startTime,
  isOpen,
  onClose,
  onSessionCreated
}: CreateSessionProps) {
  const { sessionTypes, loading: loadingTypes, refetch } = useSessionTypes()
  const [selectedType, setSelectedType] = useState('')
  const [duration, setDuration] = useState(30)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize the formatted date to avoid recalculation during render
  const formattedDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date])

  useEffect(() => {
    if (isOpen) {
      logDebug('CreateSessionDialog', 'Dialog opened, fetching session types')
      refetch()
    }
  }, [isOpen, refetch])

  useEffect(() => {
    logDebug('CreateSessionDialog', 'Session types updated', { 
      count: sessionTypes.length,
      types: sessionTypes 
    })
  }, [sessionTypes])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      logDebug('CreateSessionDialog', 'Resetting form state')
      setSelectedType('')
      setDuration(30)
      setTitle('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      const sessionType = sessionTypes.find(type => type.id === selectedType)
      if (!sessionType) {
        logDebug('CreateSessionDialog', 'No session type selected', { selectedType })
        setError('Please select a session type')
        return
      }

      logDebug('CreateSessionDialog', 'Creating session', {
        sessionType,
        startTime,
        duration,
        title,
        formattedDate
      })

      // Create dates in the event handler, not during render
      const startDateTime = new Date(`${formattedDate}T${startTime}`)
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

      const { data, error: supabaseError } = await supabase
        .from('sessions')
        .insert({
          title: title || sessionType.name,
          session_type_id: sessionType.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          priority: sessionType.priority,
          is_flexible: sessionType.is_flexible
        })
        .select()

      if (supabaseError) {
        logDebug('CreateSessionDialog', 'Supabase error', supabaseError)
        throw supabaseError
      }

      logDebug('CreateSessionDialog', 'Session created successfully', data)
      onSessionCreated()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
      logDebug('CreateSessionDialog', 'Error creating session', { error, errorMessage })
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Memoize the session type options to avoid recreation during render
  const sessionTypeOptions = useMemo(() => {
    return sessionTypes.map((type) => (
      <option key={type.id} value={type.id}>
        {type.name}
      </option>
    ))
  }, [sessionTypes])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create New Session</h2>
        {loadingTypes ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="session-type">
                Session Type
              </label>
              <select
                id="session-type"
                value={selectedType}
                onChange={(e) => {
                  const typeId = e.target.value;
                  logDebug('CreateSessionDialog', 'Session type selected', { typeId })
                  setSelectedType(typeId);
                  const selectedSessionType = sessionTypes.find(type => type.id === typeId);
                  if (selectedSessionType) {
                    setDuration(selectedSessionType.default_duration);
                  }
                }}
                className="w-full border rounded-md p-2"
                required
                disabled={submitting}
              >
                <option value="">Select a type...</option>
                {sessionTypeOptions}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="session-title">
                Title (optional)
              </label>
              <input
                id="session-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-md p-2"
                placeholder="Custom title"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="session-duration">
                Duration (minutes)
              </label>
              <input
                id="session-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="15"
                step="15"
                className="w-full border rounded-md p-2"
                required
                disabled={submitting}
              />
            </div>

            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Starts at {startTime}</span>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}