import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Register from './pages/Register'
import Search from './pages/Search'
import Swaps from './pages/Swaps'
import './App.css'

function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to || (to === '/register' && location.pathname === '/')

  return (
    <Link to={to} className="relative flex items-center gap-1.5 text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
      {children}
      <span
        className={`w-1.5 h-1.5 rounded-full bg-teal transition-all duration-300 ease-out ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      />
    </Link>
  )
}

function AppContent() {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    setUser(null)
    setShowLogoutConfirm(false)
    navigate('/register')
  }

  return (
    <>
      <nav className="border-b border-charcoal/15 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/register" className="flex items-center">
            <img
              src="/bookswapai logo horizontal.png"
              alt="BookSwap AI"
              className="h-22 w-auto -my-7"
            />
          </Link>
          <div className="flex items-center gap-6">
            <NavLink to="/register">My shelf</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/swaps">Swaps</NavLink>
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-teal-dark bg-teal/10 px-3 py-1 rounded-full">
                  {user.username}
                </span>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-xs font-medium text-charcoal/40 hover:text-burgundy transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 px-4">
          <div className="bg-cream rounded-lg w-full max-w-sm shadow-xl p-6">
            <h2 className="font-display text-lg font-semibold text-burgundy mb-2">Log out?</h2>
            <p className="text-charcoal/70 text-sm mb-6">
              You'll need to log back in to access your shelf.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-sm font-medium text-charcoal/60 hover:text-charcoal px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-burgundy text-cream text-sm font-medium px-5 py-2 rounded hover:bg-burgundy-dark transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/register" element={<Register user={user} setUser={setUser} />} />
        <Route path="/search" element={<Search user={user} />} />
        <Route path="/swaps" element={<Swaps user={user} />} />
        <Route path="/" element={<Register user={user} setUser={setUser} />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App