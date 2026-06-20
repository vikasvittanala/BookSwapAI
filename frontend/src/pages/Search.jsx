import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function Search({ user }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!user) {
      alert('Please register first')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query, user_id: user.id }
      })
      setResults(response.data.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="font-body text-xs tracking-widest text-teal font-medium mb-1">FIND A SWAP</p>
      <h1 className="font-display text-4xl font-semibold text-burgundy mb-2 leading-tight">
        Search the shelves.
      </h1>
      <p className="text-charcoal/70 text-sm mb-8">
        Find readers near you who own the book you're after.
      </p>

      {!user && (
        <p className="text-sm text-burgundy bg-burgundy/10 px-4 py-2 rounded inline-block mb-6">
          Register first to start searching.
        </p>
      )}

      <div className="flex items-center gap-3 mb-10">
        <input
          type="text"
          placeholder="Search for a book title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 border border-charcoal/25 rounded px-4 py-3 text-sm focus:outline-none focus:border-teal bg-white"
        />
        <button
          onClick={handleSearch}
          className="bg-burgundy text-cream font-medium text-sm px-6 py-3 rounded hover:bg-burgundy-dark transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-charcoal/60 text-sm">Searching the shelves...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-charcoal/60 text-sm">No copies of that book found nearby yet.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {results.map((book) => (
          <div key={book.id} className="bg-white border border-charcoal/20 rounded-lg p-4">
            <div className="flex gap-3">
              {book.thumbnail && (
                <img src={book.thumbnail} alt={book.title} className="w-14 h-20 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-medium text-sm leading-snug">{book.title}</p>
                  <div className="border-2 border-teal text-teal-dark font-display font-semibold text-[10px] px-1.5 py-0.5 rounded -rotate-3 tracking-wide shrink-0 whitespace-nowrap">
                    AVAILABLE
                  </div>
                </div>
                <p className="text-charcoal/60 text-xs mt-1">{book.author}</p>
                <p className="text-charcoal/50 text-xs mt-1">{book.genre}</p>
                <div className="border-t border-charcoal/10 mt-3 pt-2">
                  <p className="text-xs text-charcoal/70">
                    Owned by <span className="font-medium text-charcoal">{book.users?.username}</span>
                  </p>
                  <p className="text-xs text-charcoal/50">{book.users?.location}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search