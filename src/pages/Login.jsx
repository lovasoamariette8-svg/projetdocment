import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  const handleLogin = (e) => {
    e.preventDefault()

    if (!username || !password) {
      alert('Veuillez remplir tous les champs.')
      return
    }

    sessionStorage.setItem('isLoggedIn', 'true')

    navigate('/dashboard')
  }

  const handleCancel = () => {
    setUsername('')
    setPassword('')
  }

  return (
    <div className={`login-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>

      {/* BOUTON THÈME */}
      <button
        type="button"
        className="login-theme-btn"
        onClick={() => setDarkMode(!darkMode)}
      >
        <span className="material-symbols-outlined">
          {darkMode ? 'light_mode' : 'dark_mode'}
        </span>

        {darkMode ? 'Clair' : 'Sombre'}
      </button>


      <div className="login-container">

        {/* LOGO */}
        <div className="login-logo">
          TS
        </div>


        {/* TITRE */}
        <h1>Bienvenue</h1>

        <p className="login-subtitle">
          Connectez-vous à votre espace administrateur
        </p>


        {/* CARTE DE CONNEXION */}
        <div className="login-card">

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="username">
                ADRESSE E-MAIL
              </label>

              <input
                id="username"
                type="text"
                placeholder="admin@entreprise.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

            </div>


            {/* MOT DE PASSE */}
            <div className="form-group">

              <label htmlFor="password">
                MOT DE PASSE
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>


            {/* MOT DE PASSE OUBLIÉ */}
            <Link
              to="/forgot-password"
              className="forgot-password"
            >
              Mot de passe oublié ?
            </Link>


            {/* BOUTONS */}
            <div className="login-buttons">

              <button
                type="submit"
                className="btn-login"
              >
                <span>Se connecter</span>
                <span>→</span>
              </button>


              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Annuler
              </button>

            </div>

          </form>

        </div>


        {/* RETOUR */}
        <button
          type="button"
          className="back-website"
          onClick={() => navigate('/')}
        >
          ← Retour au site
        </button>

      </div>

    </div>
  )
}

export default Login