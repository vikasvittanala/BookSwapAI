import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // TODO: Replace with real authenticated user ID once auth is implemented
  const userId = 'PASTE_YOUR_TEST_USER_ID_HERE'

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query, user_id: userId }
      })
      setResults(response.data.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>BookSwap AI</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Searching...</p>}

      <div className="results">
        {results.map((book) => (
          <div key={book.id} className="book-card">
            <img src={book.thumbnail} alt={book.title} />
            <div>
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <p>{book.genre}</p>
              <p>Owner: {book.users?.username} ({book.users?.location})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App