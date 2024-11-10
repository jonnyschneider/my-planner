// src/lib/dateUtils.ts
import { format, addDays, startOfDay } from 'date-fns'

export function getNext4Days(startDate: Date = new Date()) {
  return Array.from({ length: 4 }).map((_, index) => 
    startOfDay(addDays(startDate, index))
  )
}

export function formatDate(date: Date) {
  return format(date, 'EEE, MMM d') // e.g., "Mon, Jan 1"
}