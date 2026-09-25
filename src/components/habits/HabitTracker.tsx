import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import HabitForm from './HabitForm'
import HabitList from './HabitList'
import AvatarUpload from '../AvatarUpload'
import ErrorBoundary from '../ErrorBoundary'

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

interface DailyLog {
  id: string
  habit_id: string
  log_date: string
  completed: boolean
  notes: string | null
  created_at: string
}

const HabitTracker = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState<Habit[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineQueue, setOfflineQueue] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchDailyLogs()
      fetchProfile()
    }
  }, [user, selectedDate])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineQueue()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHabits(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyLogs = async () => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('log_date', selectedDate)

      if (error) throw error
      setDailyLogs(data || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user?.id)
        .single()

      if (error) {
        // Profile might not exist yet, that's okay
        if (error.code === 'PGRST116') {
          // No rows returned
          return
        }
        throw error
      }

      if (data && data.avatar_url) {
        // Add cache-busting parameter to loaded avatar URL
        const cacheBustedUrl = data.avatar_url.includes('?') 
          ? data.avatar_url 
          : `${data.avatar_url}?t=${Date.now()}`
        setAvatarUrl(cacheBustedUrl)
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      // Don't set error state for profile fetch failures, just log it
    }
  }

  const addHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      setHabits([data, ...habits])
      setShowForm(false)
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error
      setHabits(habits.map(h => h.id === id ? data : h))
      setEditingHabit(null)
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      setHabits(habits.filter(h => h.id !== id))
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const toggleHabitCompletion = async (habitId: string) => {
    const existingLog = dailyLogs.find(log => log.habit_id === habitId)
    
    try {
      setError(null)
      
      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('daily_logs')
          .update({ completed: !existingLog.completed })
          .eq('id', existingLog.id)

        if (error) throw error
        setDailyLogs(dailyLogs.map(log => 
          log.id === existingLog.id ? { ...log, completed: !log.completed } : log
        ))
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('daily_logs')
          .insert({
            habit_id: habitId,
            log_date: selectedDate,
            completed: true,
          })
          .select()
          .single()

        if (error) throw error
        setDailyLogs([...dailyLogs, data])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  const getHabitCompletion = (habitId: string) => {
    const log = dailyLogs.find(l => l.habit_id === habitId)
    return log?.completed || false
  }

  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url)
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Habit Tracker',
      text: 'Check out my habit tracking progress',
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url)
        alert('Link copied to clipboard')
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return

    for (const item of offlineQueue) {
      try {
        if (item.type === 'addHabit') {
          await addHabit(item.data)
        } else if (item.type === 'toggleHabit') {
          await toggleHabitCompletion(item.habitId)
        }
      } catch (err) {
        console.error('Failed to sync offline item:', err)
      }
    }

    setOfflineQueue([])
  }

  const addHabitOffline = (habitData: any) => {
    if (!isOnline) {
      setOfflineQueue([...offlineQueue, { type: 'addHabit', data: habitData }])
      // Optimistic update
      const tempHabit = {
        ...habitData,
        id: `temp-${Date.now()}`,
        user_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setHabits([tempHabit, ...habits])
      return Promise.resolve({ success: true })
    }
    return addHabit(habitData)
  }

  const toggleHabitCompletionOffline = (habitId: string) => {
    if (!isOnline) {
      setOfflineQueue([...offlineQueue, { type: 'toggleHabit', habitId }])
      // Optimistic update
      setDailyLogs(dailyLogs.map(log => 
        log.habit_id === habitId 
          ? { ...log, completed: !log.completed } 
          : log
      ))
      return
    }
    toggleHabitCompletion(habitId)
  }

  return (
    <div className="habit-tracker">
      <div className={`offline-banner ${!isOnline ? 'show' : ''}`}>
        You are offline. Changes will sync when you reconnect.
      </div>
      
      <ErrorBoundary sectionName="Avatar Section">
        <AvatarUpload 
          currentAvatarUrl={avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
          onSignOut={handleSignOut}
        />
      </ErrorBoundary>

      <ErrorBoundary sectionName="Header Section">
        <header className="tracker-header">
          <h1>Habit Tracker</h1>
          <div className="header-actions">
            <label htmlFor="date-picker" className="visually-hidden">Select Date</label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
            <button onClick={handleShare} className="btn btn-secondary share-btn" aria-label="Share habit tracker">
              Share
            </button>
            <button onClick={() => setShowForm(true)} className="btn btn-primary" aria-label="Add new habit">
              Add Habit
            </button>
          </div>
        </header>
      </ErrorBoundary>

      {error && <div className="error-message">{error}</div>}

      <ErrorBoundary sectionName="Habit Form">
        {showForm && (
          <HabitForm
            habit={editingHabit}
            onSubmit={editingHabit ? (data) => updateHabit(editingHabit.id, data) : (data) => addHabitOffline(data)}
            onClose={handleFormClose}
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary sectionName="Habit List">
        {loading ? (
          <div className="loading">Loading habits</div>
        ) : (
          <HabitList
            habits={habits}
            getCompletion={getHabitCompletion}
            onToggle={toggleHabitCompletionOffline}
            onEdit={handleEdit}
            onDelete={deleteHabit}
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary sectionName="Empty State">
        {!loading && habits.length === 0 && (
          <div className="empty-state">
            <p>No habits yet. Start by adding your first habit</p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default HabitTracker