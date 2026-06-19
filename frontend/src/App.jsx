import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Search from './pages/Search'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/register">Register</Link>
        <Link to="/search">Search</Link>
        {user && <span className="logged-in-as">Logged in as {user.username}</span>}
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