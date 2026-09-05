
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  // Dark mode par défaut
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="home-header">

        {/* LOGO */}
        <div className="home-logo">
          <div className="home-logo-box">
            TS
          </div>

          <div className="logo-text">
            <span>TextSim</span>
            <small>Analyse de texte</small>
          </div>
        </div>


        {/* NAVIGATION */}
        <nav className="home-nav">

          <a href="#features">
            Fonctionnalités
          </a>

          <a href="#how-it-works">
            Comment ça marche
          </a>

          <a href="#about">
            À propos
          </a>

          {/* THEME */}
          <button
            type="button"
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="material-symbols-outlined">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>

            {darkMode ? 'Light' : 'Dark'}
          </button>


          {/* LOGIN */}
          <button
            type="button"
            className="admin-btn"
            onClick={() => navigate('/login')}
          >
            Connexion
            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          </button>

        </nav>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <main className="home-hero">

        {/* BADGE */}
        <div className="hero-badge">

          <span className="badge-dot"></span>

          Plateforme intelligente de détection

        </div>


        {/* TITLE */}
        <h1>

          <span className="title-white">
            Analysez vos documents,
          </span>

          <span className="title-blue">
            détectez les similitudes.
          </span>

        </h1>


        {/* DESCRIPTION */}
        <p className="hero-description">

          TextSim vous permet de comparer vos documents,
          d'identifier les similitudes textuelles et
          d'obtenir des résultats précis en quelques clics.

        </p>


        {/* BUTTONS */}
        <div className="hero-buttons">

          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate('/login')}
          >

            Commencer l'analyse

            <span className="material-symbols-outlined">
              arrow_forward
            </span>

          </button>


          <a
            href="#how-it-works"
            className="secondary-btn"
          >

            <span className="material-symbols-outlined">
              play_circle
            </span>

            Découvrir

          </a>

        </div>


        {/* HERO STATS */}
        <div className="hero-stats">

          <div className="hero-stat">
            <strong>TXT</strong>
            <span>Format supporté</span>
          </div>

          <div className="hero-stat">
            <strong>DOCX</strong>
            <span>Format supporté</span>
          </div>

          <div className="hero-stat">
            <strong>PDF</strong>
            <span>Format supporté</span>
          </div>

          <div className="hero-stat">
            <strong>100%</strong>
            <span>Analyse automatisée</span>
          </div>

        </div>

      </main>


      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section
        id="features"
        className="features-section"
      >

        <div className="section-title">

          <span>
            FONCTIONNALITÉS
          </span>

          <h2>
            Tout ce dont vous avez besoin
          </h2>

          <p>
            Une plateforme conçue pour rendre l'analyse
            de similarité simple, rapide et efficace.
          </p>

        </div>


        <div className="features-grid">

          {/* FEATURE 1 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                upload_file
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Importation de documents
              </h3>

              <p>
                Importez facilement vos fichiers
                TXT, DOCX et PDF pour les analyser.
              </p>

            </div>

          </div>


          {/* FEATURE 2 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                manage_search
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Analyse intelligente
              </h3>

              <p>
                Comparez automatiquement le contenu
                de vos documents et détectez les similitudes.
              </p>

            </div>

          </div>


          {/* FEATURE 3 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                percent
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Score de similarité
              </h3>

              <p>
                Obtenez un pourcentage clair permettant
                de mesurer le niveau de similarité.
              </p>

            </div>

          </div>


          {/* FEATURE 4 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                tune
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Paramètres personnalisables
              </h3>

              <p>
                Configurez les paramètres d'analyse
                selon vos besoins.
              </p>

            </div>

          </div>


          {/* FEATURE 5 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                analytics
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Résultats détaillés
              </h3>

              <p>
                Visualisez les résultats avec des
                statistiques faciles à comprendre.
              </p>

            </div>

          </div>


          {/* FEATURE 6 */}
          <div className="feature-card">

            <div className="feature-icon">
              <span className="material-symbols-outlined">
                history
              </span>
            </div>

            <div className="feature-content">

              <h3>
                Historique des analyses
              </h3>

              <p>
                Retrouvez facilement vos analyses
                précédentes et leurs résultats.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section
        id="how-it-works"
        className="how-section"
      >

        <div className="section-title">

          <span>
            FONCTIONNEMENT
          </span>

          <h2>
            Comment ça marche ?
          </h2>

          <p>
            Trois étapes simples pour analyser
            vos documents.
          </p>

        </div>


        <div className="steps-container">

          {/* STEP 1 */}
          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <span className="material-symbols-outlined step-icon">
              upload_file
            </span>

            <h3>
              Importer
            </h3>

            <p>
              Sélectionnez les documents que
              vous souhaitez comparer.
            </p>

          </div>


          {/* STEP 2 */}
          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <span className="material-symbols-outlined step-icon">
              manage_search
            </span>

            <h3>
              Analyser
            </h3>

            <p>
              Lancez l'analyse et laissez TextSim
              comparer automatiquement les textes.
            </p>

          </div>


          {/* STEP 3 */}
          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <span className="material-symbols-outlined step-icon">
              analytics
            </span>

            <h3>
              Consulter
            </h3>

            <p>
              Consultez le score et les détails
              des similitudes détectées.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT / CTA
      ===================================================== */}
      <section
        id="about"
        className="cta-section"
      >

        <div className="cta-content">

          <div className="cta-icon">
            <span className="material-symbols-outlined">
              compare_arrows
            </span>
          </div>

          <div>

            <span className="cta-label">
              TEXTSIM
            </span>

            <h2>
              Prêt à analyser vos documents ?
            </h2>

            <p>
              Commencez dès maintenant votre analyse
              de similarité textuelle.
            </p>

          </div>

          <button
            type="button"
            className="cta-btn"
            onClick={() => navigate('/login')}
          >

            Commencer

            <span className="material-symbols-outlined">
              arrow_forward
            </span>

          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="home-footer">

        <div className="footer-main">

          {/* LOGO */}
          <div className="footer-brand">

            <div className="footer-logo-box">
              TS
            </div>

            <div>

              <strong>
                TextSim
              </strong>

              <p>
                Détection de similarité textuelle
              </p>

            </div>

          </div>


          {/* FOOTER LINKS */}
          <div className="footer-links">

            <a href="#features">
              Fonctionnalités
            </a>

            <a href="#how-it-works">
              Fonctionnement
            </a>

            <a href="#about">
              À propos
            </a>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 TextSim. Tous droits réservés.
          </span>

          <span>
            Plateforme d'analyse textuelle
          </span>

        </div>

      </footer>

    </div>
  )
}

export default Home
