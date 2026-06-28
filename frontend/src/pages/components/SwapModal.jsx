import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function SwapModal({ targetBook, currentUser, onClose, onSuccess }) {
  const [myBooks, setMyBooks] = useState([])
  const [selectedBooks, setSelectedBooks] = useState([])
  const [isMultiMode, setIsMultiMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/${currentUser.id}/books`)
        setMyBooks(res.data)
      } catch (err) {
        console.error('Failed to fetch books:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyBooks()
  }, [])

  const toggleBook = (book) => {
    setSelectedBooks(prev => {
      const exists = prev.find(b => b.id === book.id)
      if (exists) return prev.filter(b => b.id !== book.id)
      return [...prev, book]
    })
  }

  const handleSubmit = async () => {
    if (selectedBooks.length === 0) {
      setMessage('Please select at least one book to offer')
      return
    }
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/swaps`, {
        requester_id: currentUser.id,
        receiver_id: targetBook.user_id,
        offered_book_ids: selectedBooks.map(b => b.id),
        requested_book_ids: [targetBook.id]
      })
      onSuccess()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 px-4">
      <div className="bg-cream rounded-lg w-full max-w-md shadow-xl">

        <div className="border-b border-charcoal/15 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-burgundy">Request a swap</h2>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          <div>
            <p className="text-xs tracking-widest text-teal font-medium mb-2">THEY HAVE</p>
            <div className="bg-white border border-charcoal/20 rounded-lg p-3 flex gap-3 items-center">
              {targetBook.thumbnail && (
                <img src={targetBook.thumbnail} alt={targetBook.title} className="w-10 h-14 object-cover rounded" />
              )}
              <div>
                <p className="font-display font-medium text-sm">{targetBook.title}</p>
                <p className="text-charcoal/60 text-xs">{targetBook.author}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-charcoal/15" />
            <span className="text-charcoal/40 text-sm font-medium">⟷</span>
            <div className="flex-1 h-px bg-charcoal/15" />
          </div>

          <div>
            <p className="text-xs tracking-widest text-teal font-medium mb-2">
              YOU OFFER {selectedBooks.length > 1 && `(${selectedBooks.length} books)`}
            </p>

            {loading ? (
              <p className="text-charcoal/50 text-sm">Loading your books...</p>
            ) : myBooks.length === 0 ? (
              <p className="text-charcoal/50 text-sm">You have no books to offer. Add some first.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {myBooks.map((book) => {
                  const isSelected = !!selectedBooks.find(b => b.id === book.id)
                  const isDisabled = !isSelected && !isMultiMode && selectedBooks.length >= 1

                  return (
                    <div
                      key={book.id}
                      onClick={() => !isDisabled && toggleBook(book)}
                      className={`flex gap-3 items-center p-3 rounded-lg border transition-all
                        ${isSelected
                          ? 'border-burgundy bg-burgundy/5 cursor-pointer'
                          : isDisabled
                          ? 'border-charcoal/10 opacity-40 cursor-not-allowed'
                          : 'border-charcoal/20 hover:border-charcoal/40 bg-white cursor-pointer'
                        }`}
                    >
                      {book.thumbnail && (
                        <img src={book.thumbnail} alt={book.title} className="w-8 h-11 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-medium truncate">{book.title}</p>
                        <p className="text-charcoal/60 text-xs">{book.author}</p>
                      </div>
                      {isSelected && <span className="text-burgundy text-lg">✓</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {selectedBooks.length >= 1 && !isMultiMode && (
              <button
                onClick={() => setIsMultiMode(true)}
                className="mt-2 text-xs text-teal hover:text-teal-dark font-medium"
              >
                + Add another book to your offer
              </button>
            )}

            {isMultiMode && (
              <button
                onClick={() => {
                  setIsMultiMode(false)
                  setSelectedBooks(prev => prev.slice(0, 1))
                }}
                className="mt-2 text-xs text-charcoal/50 hover:text-burgundy font-medium"
              >
                − Switch back to single book swap
              </button>
            )}
          </div>

          {message && (
            <p className="text-xs text-burgundy bg-burgundy/10 px-3 py-2 rounded">{message}</p>
          )}
        </div>

        <div className="border-t border-charcoal/15 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-charcoal/60 hover:text-charcoal px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedBooks.length === 0}
            className="bg-burgundy text-cream text-sm font-medium px-5 py-2 rounded hover:bg-burgundy-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send swap request'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SwapModal