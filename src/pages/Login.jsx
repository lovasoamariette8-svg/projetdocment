import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { getErrorMessage, ensureCsrf } from '../api'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [darkMode, setDarkMode] = useState(true)
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

  const [email, setEmail] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  // Inscription réelle via le backend
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      alert('Veuillez remplir tous les champs pour vous inscrire.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      await api.post('/auth/register/', {
        username,
        password,
        email,
      })
      sessionStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de l\'inscription.'))
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
        <h1>Bienvenue</h1>
        <p className="login-subtitle">
          Connectez-vous ou inscrivez-vous pour accéder à votre espace
        </p>

        {/* ERREUR */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* CARTE DE CONNEXION / INSCRIPTION */}
        <div className="login-card">

          <form>

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

            {/* EMAIL (inscription uniquement) */}
            {isRegisterMode && (
              <div className="form-group">
                <label htmlFor="email">
                  ADRESSE E-MAIL
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

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
            <div className="login-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* BOKOTRA SE CONNECTER */}
              <button
                type="submit"
                className="btn-login"
                onClick={isRegisterMode ? () => setIsRegisterMode(false) : handleLogin}
                disabled={loading}
              >
                <span>{isRegisterMode ? '← Retour à la connexion' : (loading ? 'Connexion...' : 'Se connecter')}</span>
                <span>→</span>
              </button>

              {/* BOKOTRA S'INSCRIRE */}
              <button
                type="button"
                className="btn-login"
                onClick={isRegisterMode ? handleRegister : () => setIsRegisterMode(true)}
                disabled={loading}
              >
                <span>{isRegisterMode ? (loading ? 'Inscription...' : 'Confirmer l\'inscription') : 'S\'inscrire'}</span>
                <span>→</span>
              </button>

              {/* BOKOTRA ANNULER */}
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