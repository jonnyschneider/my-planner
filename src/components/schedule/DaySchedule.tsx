// src/components/schedule/DaySchedule.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/dateUtils'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { CreateSessionDialog } from './CreateSessionDialog'

type Session = Database['public']['Tables']['sessions']['Row'] & {
  session_type: Database['public']['Tables']['session_types']['Row'] | null
}

export function DaySchedule({ date }: { date: Date }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchSessions = useCallback(async () => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data } = await supabase
      .from('sessions')
      .select('*, session_type:session_types(*)')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time')

    setSessions(data || [])
  }, [date])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const timeBlocks = Array.from({ length: 30 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6
    const minutes = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  })

  const handleTimeBlockClick = (time: string) => {
    setSelectedTime(time)
    setIsDialogOpen(true)
  }

  const getSessionStyle = (session: Session) => {
    const startTime = new Date(session.start_time)
    const endTime = new Date(session.end_time)
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes() - 6 * 60
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    
    return {
      top: `${startMinutes}px`,
      height: `${duration}px`,
      backgroundColor: session.session_type?.color || '#E5E7EB'
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[800px] bg-white rounded-lg shadow">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold">{formatDate(date)}</h3>
      </div>
      <div className="flex-1 p-2 relative">
        {timeBlocks.map((time) => (
          <div
            key={time}
            className="h-[50px] border-b border-gray-100 relative group cursor-pointer"
            onClick={() => handleTimeBlockClick(time)}
          >
            <span className="absolute -left-16 top-0 text-xs text-gray-500">
              {time}
            </span>
          </div>
        ))}
        
        {/* Render sessions */}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="absolute left-0 right-0 mx-2 rounded p-2 text-sm overflow-hidden"
            style={getSessionStyle(session)}
          >
            <div className="font-medium text-white">
              {session.title}
            </div>
          </div>
        ))}
      </div>

      {isDialogOpen && selectedTime && (
        <CreateSessionDialog
          date={date}
          startTime={selectedTime}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSessionCreated={fetchSessions}
        />
      )}
    </div>
  )
}