import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import HabitTracker from './components/habits/HabitTracker'
import PWABadge from './components/PWARegistration'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
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
          <PWABadge />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App