import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { getErrorMessage, ensureCsrf } from '../api'
import './Login.css'

function Register() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Étape 1 : envoi du code de vérification par e-mail
  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username || !email || !password) {
      alert('Veuillez remplir tous les champs pour vous inscrire.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      const res = await api.post('/auth/register/verify/', {
        username,
        email,
        password,
      })
      setSuccess(res.data.message)
      setError('')
      setStep(2)
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la demande de vérification.'))
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 : vérification du code + création du compte
  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!code) {
      alert('Veuillez saisir le code de vérification reçu par e-mail.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      await api.post('/auth/register/confirm/', {
        email,
        code: code.trim().toUpperCase(),
      })
      sessionStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Échec de la vérification du code.'))
    } finally {
      setLoading(false)
    }
  }

  // Renvoyer un nouveau code
  const handleResend = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await ensureCsrf()
      const res = await api.post('/auth/register/verify/', {
        username,
        email,
        password,
      })
      setSuccess(res.data.message)
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de l\'envoi du code.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setUsername('')
    setEmail('')
    setPassword('')
  }

  const handleBack = () => {
    setStep(1)
    setCode('')
    setError('')
    setSuccess('')
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
        <h1>Créer un compte</h1>
        <p className="login-subtitle">
          {step === 1
            ? 'Inscrivez-vous pour accéder à votre espace'
            : 'Saisissez le code de vérification reçu par e-mail pour activer votre compte'}
        </p>

        {/* ERREUR */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* SUCCÈS */}
        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        {/* CARTE D'INSCRIPTION */}
        <div className="login-card">

          {step === 1 ? (

            <form onSubmit={handleRequestCode}>

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

              {/* ADRESSE E-MAIL */}
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

              {/* BOUTONS D'ACTION */}
              <div className="login-buttons">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  <span>{loading ? 'Envoi du code...' : 'S\'inscrire'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* VERS LA CONNEXION */}
              <Link
                to="/login"
                className="forgot-password"
              >
                Déjà inscrit ? Se connecter
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

          ) : (

            <form onSubmit={handleConfirm}>

              {/* CODE DE VÉRIFICATION */}
              <div className="form-group">
                <label htmlFor="verify-code">
                  CODE DE VÉRIFICATION
                </label>
                <input
                  id="verify-code"
                  type="text"
                  placeholder="ex. A7K2P9"
                  maxLength="6"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>

              {/* BOUTONS D'ACTION */}
              <div className="login-buttons">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  <span>{loading ? 'Vérification...' : 'Vérifier et créer le compte'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* RENVOYER LE CODE */}
              <div className="login-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Renvoyer le code
                </button>
              </div>

              {/* ANNULER */}
              <div className="login-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleBack}
                >
                  Retour
                </button>
              </div>

            </form>

          )}

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

export default Register