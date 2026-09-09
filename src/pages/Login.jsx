import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { getErrorMessage, ensureCsrf } from '../api'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Connexion réelle via le backend
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      alert('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      await api.post('/auth/login/', { username, password })
      sessionStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la connexion.'))
    } finally {
      setLoading(false)
    }
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
        <h1>Bon retour</h1>
        <p className="login-subtitle">
          Connectez-vous pour accéder à votre espace
        </p>

        {/* ERREUR */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* CARTE DE CONNEXION */}
        <div className="login-card">

          <form onSubmit={handleLogin}>

            {/* NOM D'UTILISATEUR */}
            <div className="form-group">
              <label htmlFor="username">
                NOM D'UTILISATEUR
              </label>
              <input
                id="username"
                type="text"
                placeholder="admin"
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

            {/* BOUTONS D'ACTION */}
            <div className="login-buttons">
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                <span>→</span>
              </button>
            </div>

            {/* VERS L'INSCRIPTION */}
            <Link
              to="/register"
              className="forgot-password"
            >
              Vous n'avez pas de compte ? S'inscrire
            </Link>

            {/* ANNULER */}
            <div className="login-buttons">
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