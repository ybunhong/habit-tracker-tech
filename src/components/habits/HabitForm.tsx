import { useState, useEffect } from 'react'

interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  target_frequency: number
  frequency_type: string
  created_at: string
  updated_at: string
}

interface HabitFormProps {
  habit?: Habit | null
  onSubmit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

const HabitForm = ({ habit, onSubmit, onClose }: HabitFormProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetFrequency, setTargetFrequency] = useState(1)
  const [frequencyType, setFrequencyType] = useState('daily')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
      setTargetFrequency(habit.target_frequency)
      setFrequencyType(habit.frequency_type)
    }
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await onSubmit({
      name,
      description,
      target_frequency: targetFrequency,
      frequency_type: frequencyType,
    })

    if (!result.success) {
      setError(result.error || 'Failed to save habit')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{habit ? 'Edit Habit' : 'Add New Habit'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Habit Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Morning Exercise"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your habit..."
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frequency">Target Frequency</label>
              <input
                id="frequency"
                type="number"
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(parseInt(e.target.value) || 1)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="frequencyType">Frequency Type</label>
              <select
                id="frequencyType"
                value={frequencyType}
                onChange={(e) => setFrequencyType(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving' : habit ? 'Update' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HabitForm