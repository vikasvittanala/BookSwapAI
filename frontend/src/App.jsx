import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
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

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
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
              <span className="text-xs font-medium text-teal-dark bg-teal/10 px-3 py-1 rounded-full">
                {user.username}
              </span>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/register" element={<Register user={user} setUser={setUser} />} />
        <Route path="/search" element={<Search user={user} />} />
        <Route path="/swaps" element={<Swaps user={user} />} />
        <Route path="/" element={<Register user={user} setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
