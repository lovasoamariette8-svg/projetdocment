import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Utilisateur')
  const [initial, setInitial] = useState('U')

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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/')
    } catch {
      // on ignore les erreurs réseau, on déconnecte quand même côté client
    }
    sessionStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  return (
    <header className="dashboard-header">

      {/* TITLE */}
      <div className="header-title">

        <h2>Dashboard</h2>

        <p>
          Lundi, 31 Août 2026
        </p>

      </div>


      {/* ACTIONS */}
      <div className="header-actions">

        {/* SEARCH */}
        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Rechercher un document..."
          />
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


        {/* LOGOUT */}
        <button
          className="header-logout"
          onClick={handleLogout}
        >
          Déconnexion
        </button>

      </div>

    </header>
  )
}

export default Header
