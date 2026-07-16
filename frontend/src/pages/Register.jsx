import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

// Rotate a small set of muted cover colors by genre so placeholders don't all look identical
const GENRE_COLORS = {
  'Fiction': ['#e6d4d9', '#800020'],
  'Self-help': ['#e8dfc4', '#800020'],
  'Psychology': ['#cfe3e3', '#006666'],
  'History': ['#e0dcc9', '#374151'],
  'Science': ['#d7e4d9', '#2f5233'],
}
const DEFAULT_COLOR = ['#e0dcc9', '#374151']

function BookCover({ book }) {
  if (book.thumbnail) {
    return (
      <img
        src={book.thumbnail}
        alt={book.title}
        className="w-full h-36 object-cover"
      />
    )
  }
  const [bg, fg] = GENRE_COLORS[book.genre] || DEFAULT_COLOR
  return (
    <div
      className="w-full h-36 flex items-center justify-center"
      style={{ background: bg }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5" opacity="0.5">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" />
        <path d="M4 19.5V22" />
      </svg>
    </div>
  )
}

function Register({ user, setUser }) {
  const [form, setForm] = useState({ username: '', email: '', telegram_handle: '' })
  const [shelfFile, setShelfFile] = useState(null)
  const [manualBook, setManualBook] = useState({ title: '', author: '' })
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('register')
  const [loginEmail, setLoginEmail] = useState('')
  const [activePanel, setActivePanel] = useState('scan') // null | 'scan' | 'manual'

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
    if (!form.username.trim() || !form.email.trim()) {
      setMessage('Username and email are required.')
      return
    }
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
      setActivePanel(null)
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
      setActivePanel(null)
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

  const availableCount = myBooks.filter(b => b.is_available).length

  return (
    <>
      {!user ? (
        <div className="flex min-h-[80vh] max-w-[1600px] mx-auto">
          {/* Left side — form */}
          <div className="flex-1 flex items-center justify-center px-12 py-12">
            <div className="w-full max-w-md">
              <img
                src="/bookswapai logo.png"
                alt="BookSwap AI"
                className="w-20 h-20 mb-0"
              />
              <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">
                BOOKSWAP AI · SINGAPORE
              </p>

              <h1 className="font-display text-4xl font-semibold text-burgundy mb-2 leading-tight">
                From someone's shelf, into your hands.
              </h1>

              <p className="text-charcoal/70 text-sm mb-6">
                Create an account to start swapping books with readers near you.
              </p>

              <div className="flex gap-1 mb-4 bg-charcoal/5 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setMode('register')}
                  className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                    mode === 'register'
                      ? 'bg-white text-burgundy shadow-sm'
                      : 'text-charcoal/60'
                  }`}
                >
                  Register
                </button>

                <button
                  onClick={() => setMode('login')}
                  className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                    mode === 'login'
                      ? 'bg-white text-burgundy shadow-sm'
                      : 'text-charcoal/60'
                  }`}
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
                    disabled={!form.username.trim() || !form.email.trim()}
                    className="w-full bg-burgundy text-cream font-medium text-sm py-2.5 rounded hover:bg-burgundy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-burgundy"
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

              {message && (
                <p className="mt-6 text-sm text-teal-dark bg-teal/10 px-4 py-2 rounded">
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Right side — bookshelf photo */}
          <div className="w-1/2 relative hidden md:block">
            <img
              src="/bookshelf hero image.jpeg"
              alt="Bookshelf"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-charcoal/10" />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">

          {/* Header row: greeting + stats */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">
                YOUR SHELF
              </p>
              <h1 className="font-display text-3xl font-semibold text-burgundy">
                Welcome back, {user.username}.
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="bg-white border border-charcoal/15 rounded-lg px-5 py-2.5 text-center min-w-[80px]">
                <p className="text-xl font-semibold text-charcoal">{myBooks.length}</p>
                <p className="text-[11px] text-charcoal/50 mt-0.5">books</p>
              </div>
              <div className="bg-white border border-charcoal/15 rounded-lg px-5 py-2.5 text-center min-w-[80px]">
                <p className="text-xl font-semibold text-teal-dark">{availableCount}</p>
                <p className="text-[11px] text-charcoal/50 mt-0.5">available</p>
              </div>
            </div>
          </div>

          {/* Compact add-books toolbar */}
          <div className="flex gap-3">
            <button
              onClick={() => setActivePanel(activePanel === 'scan' ? null : 'scan')}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-lg transition-colors ${
                activePanel === 'scan'
                  ? 'bg-burgundy-dark text-cream'
                  : 'bg-burgundy text-cream hover:bg-burgundy-dark'
              }`}
            >
              Scan a shelf
            </button>
            <button
              onClick={() => setActivePanel(activePanel === 'manual' ? null : 'manual')}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-lg border transition-colors ${
                activePanel === 'manual'
                  ? 'bg-charcoal/5 border-charcoal/30 text-charcoal'
                  : 'bg-white border-charcoal/20 text-charcoal hover:border-charcoal/40'
              }`}
            >
              Add a book manually
            </button>
          </div>

          {/* Expandable scan panel */}
          {activePanel === 'scan' && (
            <div className="bg-white border border-charcoal/20 rounded-lg p-6">
              <h2 className="font-display text-lg font-semibold mb-1">Scan your bookshelf</h2>
              <p className="text-charcoal/60 text-sm mb-4">
                One-time scan - AI detects your books automatically.
              </p>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-3 border border-charcoal/25 rounded px-3 py-2 bg-cream/50 cursor-pointer hover:border-teal transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setShelfFile(e.target.files[0])}
                    className="text-sm w-full text-charcoal/70
                      file:mr-3 file:py-1.5 file:px-3
                      file:rounded file:border-0
                      file:text-xs file:font-medium
                      file:bg-charcoal file:text-cream
                      hover:file:bg-charcoal/80
                      file:cursor-pointer file:transition-colors"
                  />
                </label>
                <button
                  onClick={handleShelfUpload}
                  disabled={loading}
                  className="bg-teal text-cream font-medium text-sm px-4 py-2 rounded hover:bg-teal-dark transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Scanning...' : 'Scan shelf'}
                </button>
              </div>
            </div>
          )}

          {/* Expandable manual-add panel */}
          {activePanel === 'manual' && (
            <div className="bg-white border border-charcoal/20 rounded-lg p-6">
              <h2 className="font-display text-lg font-semibold mb-1">Add a book manually</h2>
              <p className="text-charcoal/60 text-sm mb-4">
                Have a book not on your shelf? Add it directly.
              </p>
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
          )}

          {message && (
            <p className="text-sm text-teal-dark bg-teal/10 px-4 py-2 rounded inline-block">
              {message}
            </p>
          )}

          {/* Book grid */}
          <div>
            <h2 className="font-display text-lg font-semibold mb-4">
              Your books ({myBooks.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {myBooks.map((book) => (
                <div
                  key={book.id}
                  className={`bg-white border border-charcoal/15 rounded-xl overflow-hidden relative group ${
                    !book.is_available ? 'opacity-70' : ''
                  }`}
                >
                  {!book.is_available && (
                    <span className="absolute top-2 right-2 z-10 text-[10px] font-medium text-cream bg-burgundy px-2 py-0.5 rounded-full">
                      Swapped
                    </span>
                  )}

                  <div className={!book.is_available ? 'grayscale-[40%]' : ''}>
                    <BookCover book={book} />
                  </div>

                  <div className="p-3">
                    <p className="font-display text-sm font-medium leading-snug truncate">
                      {book.title}
                    </p>
                    <p className="text-charcoal/60 text-xs mt-1 truncate">{book.author}</p>

                    <div className="flex items-center justify-between mt-2">
                      {book.genre && (
                        <span className="text-[10px] bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full font-medium truncate">
                          {book.genre}
                        </span>
                      )}
                      {book.is_available && (
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-charcoal/40 hover:text-burgundy text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty add-slot tile */}
              <button
                onClick={() => setActivePanel('manual')}
                className="border-2 border-dashed border-charcoal/20 rounded-xl flex flex-col items-center justify-center min-h-[180px] text-charcoal/40 hover:text-charcoal/60 hover:border-charcoal/30 transition-colors"
              >
                <span className="text-2xl leading-none mb-1">+</span>
                <span className="text-xs">Add another book</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Register
