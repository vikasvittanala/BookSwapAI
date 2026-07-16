import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Swaps({ user }) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [activeTab, setActiveTab] = useState('incoming')
  const [loading, setLoading] = useState(true)
  const [expandedRequest, setExpandedRequest] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) fetchSwaps()
  }, [user])

  const fetchSwaps = async () => {
    try {
      const res = await axios.get(`${API_URL}/swaps/${user.id}`)
      setIncoming(res.data.incoming)
      setOutgoing(res.data.outgoing)
    } catch (err) {
      console.error('Failed to fetch swaps:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/swaps/${requestId}`, { status })
      await fetchSwaps()
      setExpandedRequest(null)
      setMessage(status === 'accepted' ? 'Swap accepted! Check Telegram details below.' : 'Swap rejected.')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to update swap')
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-burgundy bg-burgundy/10 px-4 py-2 rounded inline-block">
          Register or log in to view your swaps.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">YOUR SWAPS</p>
      <h1 className="font-display text-4xl font-semibold text-burgundy mb-2 leading-tight">
        Swap requests.
      </h1>
      <p className="text-charcoal/70 text-sm mb-8">
        Manage your incoming and outgoing book swap requests.
      </p>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-6 bg-charcoal/5 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${activeTab === 'incoming' ? 'bg-white text-burgundy shadow-sm' : 'text-charcoal/60'}`}
        >
          Incoming {incoming.length > 0 && `(${incoming.length})`}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${activeTab === 'outgoing' ? 'bg-white text-burgundy shadow-sm' : 'text-charcoal/60'}`}
        >
          Outgoing {outgoing.length > 0 && `(${outgoing.length})`}
        </button>
      </div>

      {message && (
        <p className="mb-6 text-sm text-teal-dark bg-teal/10 px-4 py-2 rounded inline-block">{message}</p>
      )}

      {loading && <p className="text-charcoal/50 text-sm">Loading swaps...</p>}

      {/* Incoming requests */}
      {activeTab === 'incoming' && !loading && (
        <div className="space-y-4">
          {incoming.length === 0 && (
            <p className="text-charcoal/50 text-sm">No incoming swap requests yet.</p>
          )}
          {incoming.map((request) => (
            <div key={request.id} className="bg-white border border-charcoal/20 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-widest text-teal font-medium">INCOMING REQUEST</p>
                  <span className="text-xs bg-charcoal/10 text-charcoal/60 px-2 py-0.5 rounded-full capitalize">
                    {request.status}
                  </span>
                </div>

                <p className="text-sm text-charcoal/70 mb-3">
                  <span className="font-medium text-charcoal">{request.requester?.username}</span> wants to swap:
                </p>

                {/* Swap visual */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-charcoal/65 tracking-wide font-medium mb-1">THEY OFFER</p>
                    {request.offered_books?.map((book, i) => (
                      <div key={i} className="bg-cream border border-charcoal/15 rounded-lg p-3 flex gap-3 items-center">
                        {book.thumbnail && (
                            <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="font-display text-base font-semibold leading-snug">{book.title}</p>
                            <p className="text-sm text-charcoal/60 truncate">{book.author}</p>
                        </div>
                        </div>
                    ))}
                  </div>
                  <span className="text-charcoal/50 text-2xl">⟷</span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-charcoal/65 tracking-wide font-medium mb-1">FOR YOUR</p>
                    {request.requested_books?.map((book, i) => (
                      <div key={i} className="bg-cream border border-charcoal/15 rounded-lg p-3 flex gap-3 items-center">
                        {book.thumbnail && (
                            <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="font-display text-base font-semibold leading-snug">{book.title}</p>
                            <p className="text-xs text-charcoal/60 truncate">{book.author}</p>
                        </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* View sender's full collection toggle */}
                {request.status === 'pending' && (
                  <button
                    onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    className="mt-3 text-xs text-teal hover:text-teal-dark font-medium"
                  >
                    {expandedRequest === request.id ? '− Hide' : '+ View'} {request.requester?.username}'s full collection
                  </button>
                )}
              </div>

              {/* Sender's full book collection */}
              {expandedRequest === request.id && (
                <SenderCollection userId={request.requester_id} />
              )}

              {/* Accept / Reject */}
              {request.status === 'pending' && (
                <div className="border-t border-charcoal/10 px-4 py-3 flex gap-3 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'rejected')}
                    className="text-sm font-medium text-charcoal/50 hover:text-burgundy px-4 py-1.5"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'accepted')}
                    className="bg-teal text-cream text-sm font-medium px-5 py-1.5 rounded hover:bg-teal-dark transition-colors"
                  >
                    Accept swap
                  </button>
                </div>
              )}

              {/* Telegram reveal on acceptance */}
              {request.status === 'accepted' && (
                <div className="border-t border-teal/20 bg-teal/5 px-4 py-3">
                  <p className="text-xs text-teal font-medium tracking-wide mb-1">SWAP ACCEPTED — ARRANGE MEETUP</p>
                  <p className="text-sm text-charcoal">
                    {request.requester?.username}'s Telegram: <span className="font-medium">{request.requester?.telegram_handle}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Outgoing requests */}
      {activeTab === 'outgoing' && !loading && (
        <div className="space-y-4">
          {outgoing.length === 0 && (
            <p className="text-charcoal/50 text-sm">You haven't sent any swap requests yet.</p>
          )}
          {outgoing.map((request) => (
            <div key={request.id} className="bg-white border border-charcoal/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest text-teal font-medium">OUTGOING REQUEST</p>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium
                  ${request.status === 'accepted' ? 'bg-teal/10 text-teal-dark' :
                    request.status === 'rejected' ? 'bg-burgundy/10 text-burgundy' :
                    'bg-charcoal/10 text-charcoal/60'}`}>
                  {request.status}
                </span>
              </div>

              <p className="text-sm text-charcoal/70 mb-3">
                Swap request sent to <span className="font-medium text-charcoal">{request.receiver?.username}</span>
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-charcoal/65 tracking-wide font-medium mb-1">YOU OFFERED</p>
                  {request.offered_books?.map((book, i) => (
                    <div key={i} className="bg-cream border border-charcoal/15 rounded p-3 flex gap-3 items-center">
                        {book.thumbnail && (
                            <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="font-display text-base font-semibold leading-snug">{book.title}</p>
                            <p className="text-sm text-charcoal/60 truncate">{book.author}</p>
                        </div>
                        </div>
                  ))}
                </div>
                <span className="text-charcoal/50 text-2xl">⟷</span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-charcoal/65 tracking-wide font-medium mb-1">FOR THEIR</p>
                  {request.requested_books?.map((book, i) => (
                    <div key={i} className="bg-cream border border-charcoal/15 rounded p-3 flex gap-3 items-center">
                        {book.thumbnail && (
                            <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="font-display text-base font-semibold leading-snug">{book.title}</p>
                            <p className="text-sm text-charcoal/60 truncate">{book.author}</p>
                        </div>
                        </div>
                  ))}
                </div>
              </div>

              {/* Telegram reveal on acceptance */}
              {request.status === 'accepted' && (
                <div className="border-t border-teal/20 bg-teal/5 mt-3 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                  <p className="text-xs text-teal font-medium tracking-wide mb-1">SWAP ACCEPTED — ARRANGE MEETUP</p>
                  <p className="text-sm text-charcoal">
                    {request.receiver?.username}'s Telegram: <span className="font-medium">{request.receiver?.telegram_handle}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sub-component to fetch and display a sender's full book collection
function SenderCollection({ userId }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/${userId}/books`)
        setBooks(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [userId])

  return (
    <div className="border-t border-charcoal/10 bg-cream/60 px-4 py-3">
      <p className="text-xs text-charcoal/50 tracking-wide mb-2">FULL COLLECTION</p>
      {loading && <p className="text-xs text-charcoal/40">Loading...</p>}
      <div className="grid grid-cols-2 gap-2">
        {books.map((book, i) => (
          <div key={i} className="bg-white border border-charcoal/15 rounded p-2 flex gap-2">
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title} className="w-8 h-11 object-cover rounded" />
            )}
            <div className="min-w-0">
              <p className="font-display text-xs font-medium truncate">{book.title}</p>
              <p className="text-charcoal/50 text-xs truncate">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Swaps