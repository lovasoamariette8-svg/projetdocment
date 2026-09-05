import { useNavigate } from 'react-router-dom'
import './Header.css'

function Header() {
  const navigate = useNavigate()

  const handleLogout = () => {
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
            A
          </div>
          <span>
            Admin User
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