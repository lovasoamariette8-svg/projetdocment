import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import api from '../api'
import './Header.css'

function highlightText(text, term) {
  if (!term) return text

  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function Header({ showTitle = false }) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Utilisateur')
  const [initial, setInitial] = useState('U')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    api
      .get('/auth/me/')
      .then(({ data }) => {
        const u = data.user || {}
        const name = u.first_name || u.last_name || u.username || 'Utilisateur'
        setUserName(name)
        setInitial(name.charAt(0).toUpperCase())
      })
      .catch(() => {})
  }, [])

  const runSearch = async (term) => {
    if (!term.trim() || term.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setSearching(true)
    setSearchError('')

    try {
      const { data } = await api.get('/documents/search/', {
        params: { q: term.trim() },
      })
      setResults(data)
      setShowResults(true)
    } catch (err) {
      setSearchError(
        err.response?.data?.detail || 'Impossible d’effectuer la recherche.'
      )
      setResults([])
      setShowResults(true)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setQuery(value)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 350)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      clearTimeout(debounceRef.current)
      runSearch(query)
    }
  }

  const closeResults = () => {
    setShowResults(false)
    setSearchError('')
  }

  const handleOpenResult = (document) => {
    closeResults()
    setQuery('')
    navigate('/documents', { state: { openDocumentId: document.id } })
  }

  const statusLabel = (status) => (status === 'ready' ? 'Prêt' : 'À extraire')

  return (
    <header className="dashboard-header">

      {/* TITLE (Dashboard uniquement) */}
      {showTitle && (
        <div className="header-title">

          <h2>Dashboard</h2>

          <p>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

        </div>
      )}


      {/* ACTIONS */}
      <div className="header-actions">

        {/* SEARCH */}
        <div className="search-wrap">

          <div className="search-box">

            <Search
              size={15}
              className="search-box-icon"
            />

            <input
              type="text"
              placeholder="Rechercher dans le contenu..."
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              aria-label="Rechercher dans le contenu des documents"
            />
          </div>

          {/* RÉSULTATS DE RECHERCHE */}
          {showResults && (
            <div className="search-results-panel">

              <div className="search-results-head">
                <span>
                  {searching
                    ? 'Recherche…'
                    : `${results.length} résultat(s) pour « ${query.trim()} »`}
                </span>

                <button
                  className="search-results-close"
                  onClick={closeResults}
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>

              {searchError && (
                <div className="search-results-error">
                  {searchError}
                </div>
              )}

              {!searching && !searchError && results.length === 0 && (
                <div className="search-results-empty">
                  Aucun document ne contient ce terme.
                </div>
              )}

              {!searching &&
                !searchError &&
                results.length > 0 && (
                  <ul className="search-results-list">
                    {results.map((document) => (
                      <li key={document.id}>
                        <button
                          className="search-result-item"
                          onClick={() => handleOpenResult(document)}
                        >
                          <span className="search-result-type">
                            {document.type}
                          </span>

                          <span className="search-result-body">
                            <span className="search-result-name">
                              {document.name}
                            </span>

                            <span className="search-result-meta">
                              {document.size} · {document.date} ·{' '}
                              {statusLabel(document.status)}
                            </span>

                            <span className="search-result-snippet">
                              {highlightText(
                                document.snippet,
                                query.trim()
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          )}
        </div>


        {/* USER */}
        <div className="user-badge">
          <div className="user-avatar">
            {initial}
          </div>
          <span>
            {userName}
          </span>

        </div>

      </div>

    </header>
  )
}

export default Header