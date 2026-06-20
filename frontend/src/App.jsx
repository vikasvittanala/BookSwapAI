import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Search from './pages/Search'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <nav className="border-b border-charcoal/15 bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/register" className="font-display text-xl font-semibold text-burgundy">
            BookSwap <span className="text-teal">AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/register" className="text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
              My shelf
            </Link>
            <Link to="/search" className="text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
              Search
            </Link>
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
        <Route path="/" element={<Register user={user} setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App