import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  // Édition claire par défaut ; encre sur papier le soir
  const [darkMode, setDarkMode] = useState(false)

  const edition = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>

      {/* =====================================================
          MANCHETTE
      ===================================================== */}
      <header className="home-header">

        <div className="masthead-top">
          <span>Spécial analyse documentaire</span>
          <span className="masthead-ornament">✦</span>
          <span>{edition}</span>
        </div>

        <h1 className="masthead-logo">
          TextSim
        </h1>

        <div className="masthead-bottom">
          <span>Comparer — Détecter — Publier</span>
        </div>

        <nav className="home-nav">

          <a href="#features">Nos rubriques</a>
          <a href="#how-it-works">Le principe</a>
          <a href="#about">Le bureau</a>

          <button
            type="button"
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="material-symbols-outlined">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
            {darkMode ? 'Édition claire' : 'Édition du soir'}
          </button>

          <button
            type="button"
            className="admin-btn"
            onClick={() => navigate('/login')}
          >
            Connexion
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

        </nav>

      </header>


      {/* =====================================================
          À LA UNE
      ===================================================== */}
      <main className="home-main">

        <section className="lead">

          <p className="lead-kicker">À la une</p>

          <h2 className="lead-title">
            L'analyse des textes,
            <br />
            mise à nu.
          </h2>

          <p className="lead-byline">
            Rédaction TextSim — rubrique documents
          </p>

          <p className="lead-text">
            Trois formats : TXT, DOCX, PDF. Un moteur fondé sur les n-grammes. Une
            méthode qui compare vos documents entre eux, mesure les similitudes
            terme à terme et signale, sans détour, les passages copiés.
          </p>

          <div className="lead-actions">

            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/login')}
            >
              Commencer l'analyse
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <a
              href="#how-it-works"
              className="secondary-btn"
            >
              Lire le principe
            </a>

          </div>

        </section>


        {/* RELEVÉS */}
        <aside className="lead-facts" aria-label="Chiffres clés">

          <p className="facts-title">Le relevé</p>

          <div className="fact">
            <strong>3+</strong>
            <span>Formats analysés</span>
          </div>

          <div className="fact">
            <strong>N-gram</strong>
            <span>Moteur de détection</span>
          </div>

          <div className="fact">
            <strong>100%</strong>
            <span>Analyse automatisée</span>
          </div>

          <div className="fact">
            <strong>0</strong>
            <span>Donnée hors de vos mains</span>
          </div>

        </aside>


        {/* =====================================================
            NOS RUBRIQUES
        ===================================================== */}
        <section id="features" className="features-section">

          <div className="section-heading">

            <span className="heading-kicker">Nos rubriques</span>

            <h2>
              Six métiers du texte
            </h2>

            <p>
              Ce que le journal sait faire : importer, comparer, mesurer,
              régler, détailler, conserver.
            </p>

          </div>

          <div className="features-grid">

            <article className="feature-card">
              <span className="feature-num">01</span>
              <div className="feature-content">
                <h3>Importation de documents</h3>
                <p>
                  TXT, DOCX et PDF sont recueillis et préparés
                  pour la comparaison.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <span className="feature-num">02</span>
              <div className="feature-content">
                <h3>Analyse intelligente</h3>
                <p>
                  Le contenu est comparé automatiquement,
                  les similitudes relevées.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <span className="feature-num">03</span>
              <div className="feature-content">
                <h3>Score de similarité</h3>
                <p>
                  Un pourcentage clair, sans jargon ni
                  fioritures.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <span className="feature-num">04</span>
              <div className="feature-content">
                <h3>Paramètres personnalisables</h3>
                <p>
                  Seuil d'alerte, taille des n-grammes :
                  la rédaction règle sa ligne.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <span className="feature-num">05</span>
              <div className="feature-content">
                <h3>Résultats détaillés</h3>
                <p>
                  Statistiques et passages relevés,
                  présentés en toute transparence.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <span className="feature-num">06</span>
              <div className="feature-content">
                <h3>Historique des analyses</h3>
                <p>
                  Chaque édition est archivée, consultable
                  à tout moment.
                </p>
              </div>
            </article>

          </div>

        </section>


        {/* =====================================================
            LE PRINCIPE
        ===================================================== */}
        <section id="how-it-works" className="how-section">

          <div className="section-heading">

            <span className="heading-kicker">Le principe</span>

            <h2>
              Trois étapes, comme un bon article
            </h2>

            <p>
              Recueillir, confronter, publier le bilan.
            </p>

          </div>

          <div className="steps-container">

            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Importer</h3>
              <p>
                Sélectionnez les documents à
                confronter.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Analyser</h3>
              <p>
                TextSim compare les textes et relève
                les passages communs.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Consulter</h3>
              <p>
                Le score et le détail des similitudes
                sont mis sous vos yeux.
              </p>
            </article>

          </div>

        </section>


        {/* =====================================================
            LE BUREAU / CTA
        ===================================================== */}
        <section id="about" className="cta-section">

          <div className="cta-content">

            <p className="cta-label">Le bureau vous attend</p>

            <h2>
              Prêt à publier votre analyse&nbsp;?
            </h2>

            <p className="cta-text">
              Ouvrez un compte ou poursuivez une session existante.
            </p>

            <button
              type="button"
              className="cta-btn"
              onClick={() => navigate('/login')}
            >
              Se connecter
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          COLOPHON
      ===================================================== */}
      <footer className="home-footer">

        <div className="footer-main">

          <div className="footer-brand">
            <strong>TextSim</strong>
            <p>Feuille de comparaison textuelle — fondée en 2026</p>
          </div>

          <div className="footer-links">

            <a href="#features">Nos rubriques</a>
            <a href="#how-it-works">Le principe</a>
            <a href="#about">Le bureau</a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>© 2026 TextSim — Tous droits réservés.</span>
          <span>Imprimé sur du papier sans faille.</span>

        </div>

      </footer>

    </div>
  )
}

export default Home