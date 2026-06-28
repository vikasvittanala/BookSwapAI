import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Register({ user, setUser }) {
  const [form, setForm] = useState({ username: '', email: '', telegram_handle: '' })
  const [shelfFile, setShelfFile] = useState(null)
  const [manualBook, setManualBook] = useState({ title: '', author: '' })
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('register')
  const [loginEmail, setLoginEmail] = useState('')

  useEffect(() => {
    if (user) fetchMyBooks()
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
      setMessage(`Account created. Welcome, ${res.data.username}.`)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Registration failed')
    }
  }

  const handleLogin = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/login`, {
        params: { email: loginEmail }
      })
      setUser(res.data)
      setMessage(`Welcome back, ${res.data.username}.`)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Login failed')
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

  const handleDeleteBook = async (bookId) => {
  try {
    await axios.delete(`${API_URL}/books/${bookId}`, {
      params: { user_id: user.id }
    })
    await fetchMyBooks()
  } catch (err) {
    setMessage(err.response?.data?.detail || 'Could not remove book')
  }
}

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {!user ? (
        <div className="max-w-md mx-auto">
          <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">BOOKSWAP AI · SINGAPORE</p>
          <h1 className="font-display text-4xl font-semibold text-burgundy mb-2 leading-tight">
            Your shelf, someone else's next read.
          </h1>
          <p className="text-charcoal/70 text-sm mb-6">
            Create an account to start swapping books with readers near you.
          </p>

          <div className="flex gap-1 mb-4 bg-charcoal/5 p-1 rounded-lg w-fit">
            <button
              onClick={() => setMode('register')}
              className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${mode === 'register' ? 'bg-white text-burgundy shadow-sm' : 'text-charcoal/60'}`}
            >
              Register
            </button>
            <button
              onClick={() => setMode('login')}
              className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${mode === 'login' ? 'bg-white text-burgundy shadow-sm' : 'text-charcoal/60'}`}
            >
              Log in
            </button>
          </div>

          {mode === 'register' ? (
            <div className="bg-white border border-charcoal/20 rounded-lg p-6 space-y-3">
              <input
                className="w-full border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                className="w-full border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Telegram handle (optional)"
                value={form.telegram_handle}
                onChange={(e) => setForm({ ...form, telegram_handle: e.target.value })}
              />
              <button
                onClick={handleRegister}
                className="w-full bg-burgundy text-cream font-medium text-sm py-2.5 rounded hover:bg-burgundy-dark transition-colors"
              >
                Create account
              </button>
            </div>
          ) : (
            <div className="bg-white border border-charcoal/20 rounded-lg p-6 space-y-3">
              <input
                className="w-full border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <button
                onClick={handleLogin}
                className="w-full bg-teal text-cream font-medium text-sm py-2.5 rounded hover:bg-teal-dark transition-colors"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div>
            <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">YOUR SHELF</p>
            <h1 className="font-display text-3xl font-semibold text-burgundy">
              Welcome back, {user.username}.
            </h1>
          </div>

          <div className="bg-white border border-charcoal/20 rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-1">Scan your bookshelf</h2>
            <p className="text-charcoal/60 text-sm mb-4">One-time scan — AI detects your books automatically.</p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setShelfFile(e.target.files[0])}
                className="text-sm flex-1"
              />
              <button
                onClick={handleShelfUpload}
                disabled={loading}
                className="bg-teal text-cream font-medium text-sm px-4 py-2 rounded hover:bg-teal-dark transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Scanning...' : 'Scan shelf'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-charcoal/20 rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-1">Add a book manually</h2>
            <p className="text-charcoal/60 text-sm mb-4">Have books not on your shelf right now? Add it directly.</p>
            <div className="flex items-center gap-3">
              <input
                className="flex-1 border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Book title"
                value={manualBook.title}
                onChange={(e) => setManualBook({ ...manualBook, title: e.target.value })}
              />
              <input
                className="flex-1 border border-charcoal/25 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal"
                placeholder="Author (optional)"
                value={manualBook.author}
                onChange={(e) => setManualBook({ ...manualBook, author: e.target.value })}
              />
              <button
                onClick={handleManualAdd}
                className="bg-charcoal text-cream font-medium text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Add book
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Your books ({myBooks.length})</h2>
            <div className="grid grid-cols-2 gap-4">
              {myBooks.map((book, i) => (
                <div key={i} className="bg-white border border-charcoal/20 rounded-lg p-4 flex gap-3 relative">
                  {book.thumbnail && (
                    <img src={book.thumbnail} alt={book.title} className="w-12 h-18 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm leading-snug">{book.title}</p>
                    <p className="text-charcoal/60 text-xs mt-1">{book.author}</p>
                    {!book.is_available && (
                      <span className="inline-block mt-1 text-[10px] font-medium tracking-wide text-burgundy bg-burgundy/10 px-2 py-0.5 rounded-full">
                        SWAPPED
                      </span>
                    )}
                  </div>
                  {book.is_available && (
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-charcoal/40 hover:text-burgundy text-xs font-medium self-start"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-6 text-sm text-teal-dark bg-teal/10 px-4 py-2 rounded inline-block">{message}</p>
      )}
    </div>
  )
}

export default Register