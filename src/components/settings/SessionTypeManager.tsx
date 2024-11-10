// src/components/settings/SessionTypeManager.tsx
'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { useSessionTypes } from '@/hooks/useSessionTypes'

const DEBUG = true

function logDebug(area: string, message: string, data?: any) {
  if (DEBUG) {
    console.group(`🔍 ${area}`)
    console.log(message)
    if (data) console.dir(data)
    console.groupEnd()
  }
}

type SessionType = Database['public']['Tables']['session_types']['Row']
type NewSessionType = {
  name: string
  color: string
  default_duration: number
  priority: Database['public']['Enums']['priority_level']
  is_flexible: boolean
}

const defaultNewType: NewSessionType = {
  name: '',
  color: '#4F46E5',
  default_duration: 30,
  priority: 'medium',
  is_flexible: true
}

export function SessionTypeManager() {
  const { sessionTypes, loading, error: fetchError, refetch } = useSessionTypes()
  const [newType, setNewType] = useState<NewSessionType>(defaultNewType)
  const [editingType, setEditingType] = useState<SessionType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    logDebug('SessionTypeManager', 'Submitting form', {
      editingType,
      newType
    })

    try {
      if (editingType) {
        logDebug('SessionTypeManager', 'Updating session type', {
          id: editingType.id,
          updates: newType
        })

        const { data, error: updateError } = await supabase
          .from('session_types')
          .update({
            name: newType.name,
            color: newType.color,
            default_duration: newType.default_duration,
            priority: newType.priority,
            is_flexible: newType.is_flexible
          })
          .eq('id', editingType.id)
          .select()

        if (updateError) {
          logDebug('SessionTypeManager', 'Update error', updateError)
          throw updateError
        }

        logDebug('SessionTypeManager', 'Update successful', data)
        showSuccessMessage('Session type updated successfully')
      } else {
        logDebug('SessionTypeManager', 'Creating new session type', newType)

        const { data, error: insertError } = await supabase
          .from('session_types')
          .insert([newType])
          .select()

        if (insertError) {
          logDebug('SessionTypeManager', 'Insert error', insertError)
          throw insertError
        }

        logDebug('SessionTypeManager', 'Insert successful', data)
        showSuccessMessage('Session type created successfully')
      }

      setNewType(defaultNewType)
      setEditingType(null)
      refetch() // Refresh the list
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      logDebug('SessionTypeManager', 'Operation failed', { error: e, message: errorMessage })
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (type: SessionType) => {
    setEditingType(type)
    setNewType({
      name: type.name,
      color: type.color,
      default_duration: type.default_duration,
      priority: type.priority || 'medium',
      is_flexible: type.is_flexible ?? true // Convert null to boolean
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session type?')) return
  
    try {
      const { error: deleteError } = await supabase
        .from('session_types')
        .delete()
        .eq('id', id)
  
      if (deleteError) throw deleteError
      await refetch() // Add this
      showSuccessMessage('Session type deleted successfully')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    }
  }

  const handleCancel = () => {
    setEditingType(null)
    setNewType(defaultNewType)
    setError(null)
  }

  if (fetchError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading session types: {fetchError}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 text-green-600 rounded-lg flex justify-between items-center">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">
          {editingType ? 'Edit Session Type' : 'Add New Session Type'}
        </h3>
        
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
              pattern="^#[0-9A-Fa-f]{6}$"
              title="Please enter a valid hex color code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              value={newType.default_duration}
              onChange={(e) =>
                setNewType({ ...newType, default_duration: parseInt(e.target.value) })
              }
              min="15"
              step="15"
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={newType.priority || 'medium'}
              onChange={(e) =>
                setNewType({
                  ...newType,
                  priority: e.target.value as Database['public']['Enums']['priority_level']
                })
              }
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

          <div className="col-span-2 mt-4 flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : editingType ? (
                <Pencil className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {editingType ? 'Update' : 'Add'} Session Type
            </button>

            {editingType && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Existing Session Types</h3>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
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
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}