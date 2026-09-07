import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  const handleRegister = (e) => {
    e.preventDefault()

    if (!username || !password || !confirmPassword) {
      alert('Veuillez remplir tous les champs.')
      return
    }

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    // Compte créé -> connexion automatique
    sessionStorage.setItem('isLoggedIn', 'true')

    navigate('/dashboard')
  }

  const handleCancel = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
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
          Inscrivez-vous pour accéder à votre espace administrateur
        </p>


        {/* CARTE D'INSCRIPTION */}
        <div className="login-card">

          <form onSubmit={handleRegister}>

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


            {/* CONFIRMER MOT DE PASSE */}
            <div className="form-group">

              <label htmlFor="confirmPassword">
                CONFIRMER LE MOT DE PASSE
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

            </div>


            {/* BOUTONS */}
            <div className="login-buttons">

              <button
                type="submit"
                className="btn-login"
              >
                <span>S'inscrire</span>
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


            {/* DÉJÀ UN COMPTE */}
            <div className="create-account">

              <span>
                Vous avez déjà un compte ?
              </span>

              <Link
                to="/login"
                className="register-link"
              >
                Se connecter
              </Link>

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

export default Register