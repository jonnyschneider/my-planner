// src/components/settings/SessionTypeManager.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import type { Database } from '@/types/supabase'

type SessionType = Database['public']['Tables']['session_types']['Row']

export function SessionTypeManager() {
  const [newType, setNewType] = useState({
    name: '',
    color: '#4F46E5',
    default_duration: 30,
    priority: 'medium' as const,
    is_flexible: true
  })

  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('session_types')
      .insert([newType])
      .select()

    if (!error && data) {
      setSessionTypes([...sessionTypes, data[0]])
      setNewType({
        name: '',
        color: '#4F46E5',
        default_duration: 30,
        priority: 'medium',
        is_flexible: true
      })
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Add New Session Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="color"
              value={newType.color}
              onChange={(e) => setNewType({ ...newType, color: e.target.value })}
              className="w-full h-10 border rounded-md p-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              value={newType.default_duration}
              onChange={(e) => setNewType({ ...newType, default_duration: parseInt(e.target.value) })}
              min="15"
              step="15"
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={newType.priority}
              onChange={(e) => setNewType({ ...newType, priority: e.target.value as any })}
              className="w-full border rounded-md p-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newType.is_flexible}
                onChange={(e) => setNewType({ ...newType, is_flexible: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Flexible Timing</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Session Type
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Existing Session Types</h3>
        <div className="grid gap-4">
          {sessionTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: `${type.color}20` }}
            >
              <div>
                <h4 className="font-medium">{type.name}</h4>
                <p className="text-sm text-gray-600">
                  {type.default_duration} minutes • {type.priority} priority
                  {type.is_flexible ? ' • Flexible' : ' • Fixed'}
                </p>
              </div>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: type.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}