import { useState } from 'react'

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

interface HabitListProps {
  habits: Habit[]
  getCompletion: (habitId: string) => boolean
  onToggle: (habitId: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => Promise<{ success: boolean; error?: string }>
}

const HabitList = ({ habits, getCompletion, onToggle, onEdit, onDelete }: HabitListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit? This will also delete all associated logs.')) {
      setDeletingId(id)
      const result = await onDelete(id)
      if (!result.success) {
        alert('Failed to delete habit: ' + result.error)
      }
      setDeletingId(null)
    }
  }

  if (habits.length === 0) {
    return null
  }

  return (
    <div className="habit-list">
      {habits.map((habit) => {
        const isCompleted = getCompletion(habit.id)
        const isDeleting = deletingId === habit.id

        return (
          <div key={habit.id} className={`habit-card ${isCompleted ? 'completed' : ''}`}>
            <div className="habit-main">
              <button
                onClick={() => onToggle(habit.id)}
                className={`checkbox ${isCompleted ? 'checked' : ''}`}
                aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isCompleted && <span className="checkmark">✓</span>}
              </button>
              <div className="habit-info">
                <h3 className={isCompleted ? 'completed-text' : ''}>{habit.name}</h3>
                {habit.description && <p className="habit-description">{habit.description}</p>}
                <div className="habit-meta">
                  <span className="frequency">
                    {habit.target_frequency}x {habit.frequency_type}
                  </span>
                </div>
              </div>
            </div>
            <div className="habit-actions">
              <button
                onClick={() => onEdit(habit)}
                className="btn-icon"
                aria-label="Edit habit"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(habit.id)}
                className="btn-icon btn-danger"
                aria-label="Delete habit"
                disabled={isDeleting}
              >
                {isDeleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HabitList