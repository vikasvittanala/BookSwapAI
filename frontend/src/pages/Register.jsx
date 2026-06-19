import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Register({ user, setUser }) {
  const [form, setForm] = useState({ username: '', email: '', location: '' })
  const [shelfFile, setShelfFile] = useState(null)
  const [manualBook, setManualBook] = useState({ title: '', author: '' })
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchMyBooks()
    }
  }, [user])

  const fetchMyBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/${user.id}/books`)
      setMyBooks(res.data)
    } catch (err) {
      console.error('Failed to fetch books:', err)
    }
  }

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/users`, form)
      setUser(res.data)
      setMessage(`Account created! Welcome, ${res.data.username}`)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Registration failed')
    }
  }

  const handleShelfUpload = async () => {
    if (!shelfFile || !user) return
    setLoading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('file', shelfFile)

    try {
      const res = await axios.post(`${API_URL}/pipeline/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await fetchMyBooks()
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleManualAdd = async () => {
    if (!manualBook.title || !user) return
    try {
      const res = await axios.post(`${API_URL}/books/manual`, {
        user_id: user.id,
        title: manualBook.title,
        author: manualBook.author
      })
      await fetchMyBooks()
      setManualBook({ title: '', author: '' })
      setMessage(`Added: ${res.data.title}`)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Could not add book')
    }
  }

  return (
    <div className="container">
      <h1>BookSwap AI — Register</h1>

      {!user ? (
        <div className="form-section">
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Location (e.g. Tampines)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <button onClick={handleRegister}>Create Account</button>
        </div>
      ) : (
        <>
          <div className="form-section">
            <h2>Upload Your Bookshelf</h2>
            <p>One-time scan — AI will detect your books automatically</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setShelfFile(e.target.files[0])}
            />
            <button onClick={handleShelfUpload} disabled={loading}>
              {loading ? 'Scanning...' : 'Scan Shelf'}
            </button>
          </div>

          <div className="form-section">
            <h2>Or Add a Book Manually</h2>
            <input
              placeholder="Book title"
              value={manualBook.title}
              onChange={(e) => setManualBook({ ...manualBook, title: e.target.value })}
            />
            <input
              placeholder="Author (optional)"
              value={manualBook.author}
              onChange={(e) => setManualBook({ ...manualBook, author: e.target.value })}
            />
            <button onClick={handleManualAdd}>Add Book</button>
          </div>

          <div className="form-section">
            <h2>Your Books ({myBooks.length})</h2>
            {myBooks.map((book, i) => (
              <div key={i} className="book-card">
                {book.thumbnail && <img src={book.thumbnail} alt={book.title} />}
                <div>
                  <h3>{book.title}</h3>
                  <p>by {book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default Register