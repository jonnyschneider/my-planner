// src/components/schedule/CreateSessionDialog.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useSessionTypes } from '@/hooks/useSessionTypes'
import { supabase } from '@/lib/supabase'
import { Clock } from 'lucide-react'

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
  const { sessionTypes } = useSessionTypes()
  const [selectedType, setSelectedType] = useState('')
  const [duration, setDuration] = useState(30)
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const sessionType = sessionTypes.find(type => type.id === selectedType)
    if (!sessionType) return

    const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

    const { error } = await supabase
      .from('sessions')
      .insert({
        title: title || sessionType.name,
        session_type_id: sessionType.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        priority: sessionType.priority,
        is_flexible: sessionType.is_flexible
      })

    if (!error) {
      onSessionCreated()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create New Session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Session Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select a type...</option>
              {sessionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Custom title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="15"
              step="15"
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Starts at {startTime}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}