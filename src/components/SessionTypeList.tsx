'use client'

import React from 'react'
import { useSessionTypes } from '@/hooks/useSessionTypes'

export function SessionTypeList() {
  const { sessionTypes, loading, error } = useSessionTypes()

  if (loading) return <div>Loading session types...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid gap-4">
      {sessionTypes.map((type) => (
        <div 
          key={type.id}
          className="p-4 rounded-lg shadow"
          style={{ backgroundColor: type.color + '20' }} // Light version of the color
        >
          <h3 className="font-bold">{type.name}</h3>
          <div className="text-sm">
            <p>Duration: {type.default_duration} minutes</p>
            <p>Priority: {type.priority}</p>
            <p>{type.is_flexible ? 'Flexible timing' : 'Fixed timing'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}