import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PWABadge from './components/PWARegistration'
import './App.css'

// Lazy load the heaviest route - HabitTracker contains all the main app logic
const HabitTracker = lazy(() => import('./components/habits/HabitTracker'))
const SignIn = lazy(() => import('./components/auth/SignIn'))
const SignUp = lazy(() => import('./components/auth/SignUp'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <HabitTracker />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<SignIn />} />
            </Routes>
          </Suspense>
          <PWABadge />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App