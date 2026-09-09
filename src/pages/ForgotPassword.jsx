import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api, { getErrorMessage, ensureCsrf } from '../api'
import './Login.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetComplete, setResetComplete] = useState(false)

  // Arrivée via le lien de l'e-mail : identifiant + code pré-remplis
  useEffect(() => {
    const fromUsername = searchParams.get('username')
    const fromCode = searchParams.get('code')
    if (fromUsername && fromCode) {
      setIdentifier(fromUsername)
      setCode(fromCode.toUpperCase())
      setStep(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Étape 1 : demande de code de récupération
  const handleRequest = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!identifier) {
      alert('Veuillez renseigner votre identifiant ou votre e-mail.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      const res = await api.post('/auth/password-reset/', { username: identifier })
      setSuccess(res.data.message)
      setError('')
      setStep(2)
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la demande de récupération.'))
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 : validation du code reçu par e-mail
  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!code) {
      alert('Veuillez saisir le code reçu par e-mail.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      const res = await api.post('/auth/password-reset/verify/', {
        username: identifier,
        code: code.trim().toUpperCase(),
      })
      setVerifiedEmail(res.data.email)
      setSuccess('')
      setError('')
      setStep(3)
    } catch (err) {
      setError(getErrorMessage(err, 'Code de récupération invalide ou expiré.'))
    } finally {
      setLoading(false)
    }
  }

  // Étape 3 : nouveau mot de passe
  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword) {
      alert('Veuillez saisir un nouveau mot de passe.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await ensureCsrf()
      const res = await api.post('/auth/password-reset/confirm/', {
        username: identifier,
        code: code.trim().toUpperCase(),
        new_password: newPassword,
      })
      setSuccess(res.data.message)
      setError('')
      setResetComplete(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Échec de la réinitialisation.'))
    } finally {
      setLoading(false)
    }
  }

  const handleRequestCancel = () => {
    setIdentifier('')
    setError('')
    setSuccess('')
    setResetComplete(false)
  }

  const handleVerifyBack = () => {
    setStep(1)
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
    setVerifiedEmail('')
    setError('')
    setSuccess('')
    setResetComplete(false)
  }

  const handleResetBack = () => {
    setStep(2)
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const getSubtitle = () => {
    if (step === 1) {
      return 'Renseignez votre identifiant ou votre e-mail pour recevoir un code de récupération'
    }
    if (step === 2) {
      return 'Saisissez le code de récupération reçu par e-mail'
    }
    if (resetComplete) {
      return 'Votre mot de passe a été mis à jour'
    }
    return 'Définissez votre nouveau mot de passe'
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
        <h1>Mot de passe oublié ?</h1>
        <p className="login-subtitle">
          {getSubtitle()}
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

        {/* CARTE */}
        <div className="login-card">

          {step === 1 ? (

            <form onSubmit={handleRequest}>

              {/* IDENTIFIANT */}
              <div className="form-group">
                <label htmlFor="identifier">
                  IDENTIFIANT OU E-MAIL
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="admin ou admin@entreprise.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              {/* BOUTONS D'ACTION */}
              <div className="login-buttons">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  <span>{loading ? 'Envoi...' : 'Recevoir le code'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* VERS LA CONNEXION */}
              <Link
                to="/login"
                className="forgot-password"
              >
                Vous vous souvenez de votre mot de passe ? Se connecter
              </Link>

              {/* ANNULER */}
              <div className="login-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleRequestCancel}
                >
                  Annuler
                </button>
              </div>

            </form>

          ) : step === 2 ? (

            <form onSubmit={handleVerify}>

              {/* CODE DE RÉCUPÉRATION */}
              <div className="form-group">
                <label htmlFor="reset-code">
                  CODE DE RÉCUPÉRATION
                </label>
                <input
                  id="reset-code"
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
                  <span>{loading ? 'Vérification...' : 'Vérifier le code'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* VERS LA CONNEXION */}
              <Link
                to="/login"
                className="forgot-password"
              >
                Vous vous souvenez de votre mot de passe ? Se connecter
              </Link>

              {/* ANNULER */}
              <div className="login-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleVerifyBack}
                >
                  Retour
                </button>
              </div>

            </form>

          ) : resetComplete ? (

            <div className="login-buttons" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn-login"
                onClick={() => navigate('/login')}
              >
                <span>Se connecter</span>
                <span>→</span>
              </button>
            </div>

          ) : (

            <form onSubmit={handleReset}>

              {/* E-MAIL DU COMPTE */}
              <div className="form-group">
                <label htmlFor="reset-email">
                  E-MAIL
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="admin@entreprise.com"
                  value={verifiedEmail}
                  onChange={(e) => setVerifiedEmail(e.target.value)}
                />
              </div>

              {/* NOUVEAU MOT DE PASSE */}
              <div className="form-group">
                <label htmlFor="new-password">
                  NOUVEAU MOT DE PASSE
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* CONFIRMATION */}
              <div className="form-group">
                <label htmlFor="confirm-password">
                  CONFIRMER LE MOT DE PASSE
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* BOUTONS D'ACTION */}
              <div className="login-buttons">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  <span>{loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* ANNULER */}
              <div className="login-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleResetBack}
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

export default ForgotPassword