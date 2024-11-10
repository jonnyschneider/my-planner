// src/components/schedule/ScheduleView.tsx
'use client'

import { getNext4Days } from '@/lib/dateUtils'
import { DaySchedule } from './DaySchedule'

export function ScheduleView() {
  const days = getNext4Days()

  return (
    <div className="relative">
      {/* Time labels column */}
      <div className="w-16 absolute -left-16 top-0 bottom-0" />
      
      {/* Schedule grid */}
      <div className="grid grid-cols-4 gap-4 pl-16">
        {days.map((date) => (
          <DaySchedule key={date.toISOString()} date={date} />
        ))}
      </div>
    </div>
  )
}