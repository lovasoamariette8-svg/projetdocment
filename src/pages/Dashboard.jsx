import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api, { getErrorMessage } from '../api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total_documents: 0,
    analysed: 0,
    pending: 0,
    plagiarism_alerts: 0,
    recent_documents: [],
    monthly_series: [],
  })
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('Admin')

  useEffect(() => {
    api
      .get('/dashboard/')
      .then(({ data }) => setStats(data))
      .catch((err) =>
        setError(getErrorMessage(err, 'Impossible de charger le tableau de bord.'))
      )

    api
      .get('/auth/me/')
      .then(({ data }) => {
        const u = data.user || {};
        const name = u.first_name || u.last_name || u.username || 'Admin';
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      })
      .catch(() => {})
  }, [])

  const months = (stats.monthly_series || []).map((item) => ({
    month: item.month_fr || item.month,
    conforme: item.conforme,
    revision: item.revision,
    plagiat: item.plagiat,
  }))

  // Force au moins un mois si vide pour garder le graphique vide mais visible
  const chartMonths = months.length > 0 ? months : [
    { month: 'Mars', conforme: 0, revision: 0, plagiat: 0 },
    { month: 'Avril', conforme: 0, revision: 0, plagiat: 0 },
    { month: 'Mai', conforme: 0, revision: 0, plagiat: 0 },
    { month: 'Juin', conforme: 0, revision: 0, plagiat: 0 },
    { month: 'Juil', conforme: 0, revision: 0, plagiat: 0 },
    { month: 'Août', conforme: 0, revision: 0, plagiat: 0 },
  ]

  const username = userName
  const recentDocs = stats.recent_documents || []

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="dashboard-content">

        {/* HEADER */}
        <Header />

        <div className="dashboard-body">

          {/* WELCOM */}
          <section className="welcome-card">
            <div>
              <h1>Bienvenue, {username}</h1>
              <p>
                {error
                  ? 'Impossible de charger vos statistiques pour le moment.'
                  : `Vous avez ${stats.pending} document(s) en attente d'analyse.`}
              </p>
            </div>
          </section>

          {/* STATISTIQUES */}
          <section className="statistics-grid">
            <div className="stat-card">
              <p className="stat-label">
                TOTAL DOCUMENTS
              </p>

              <h3>{stats.total_documents}</h3>
              <span className="stat-positive">
                ↗ ce mois
              </span>
            </div>


            <div className="stat-card">
              <p className="stat-label">
                ANALYSÉS
              </p>

              <h3>{stats.analysed}</h3>

              <span className="stat-positive">
                ↗ ce mois
              </span>
            </div>


            <div className="stat-card">
              <p className="stat-label">
                EN ATTENTE
              </p>

              <h3>{stats.pending}</h3>

              <span className="stat-warning">
                ↘ nouveaux
              </span>
            </div>


            <div className="stat-card plagiarism-card">
              <p className="stat-label">
                ALERTES PLAGIAT
              </p>

              <h3>{stats.plagiarism_alerts}</h3>

              <span className="stat-danger">
                À vérifier
              </span>
            </div>
          </section>


          {/*  GRAPHIQUE*/}
          <section className="chart-card">

            <div className="chart-header">

              <div>
                <h2>
                  Analyse de similarité des 6 derniers mois
                </h2>

                <p>
                  Statistiques globales des rapports
                </p>
              </div>


              <div className="chart-legend">
                <span className="legend-conforme"> Conforme</span>
                <span className="legend-revision"> À réviser</span>
                <span className="legend-plagiat">Plagiat</span>
                </div>
              </div>


            <div className="chart">

              <div className="chart-y-axis">
                <span>120</span>
                <span>90</span>
                <span>60</span>
                <span>30</span>
                <span>0</span>
              </div>


              <div className="chart-area">

                <div className="grid-line line-120"></div>
                <div className="grid-line line-90"></div>
                <div className="grid-line line-60"></div>
                <div className="grid-line line-30"></div>
                <div className="grid-line line-0"></div>


                <div className="bars-container">

                  {chartMonths.map((item) => (
                    <div
                      className="month-column"
                      key={item.month}
                    >

                      <div className="bars">

                        <div
                          className="bar conforme"
                          style={{
                            height: `${item.conforme * 1.35}px`,
                          }}
                        ></div>

                        <div
                          className="bar revision"
                          style={{
                            height: `${item.revision * 2.1}px`,
                          }}
                        ></div>

                        <div
                          className="bar plagiat"
                          style={{
                            height: `${item.plagiat * 3}px`,
                          }}
                        ></div>

                      </div>

                      <span className="month-name">
                        {item.month}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

            </div>

          </section>


          {/* =========================
              DOCUMENTS RÉCENTS
              + SÉCURITÉ
          ========================= */}
          <section className="bottom-section">

            {/* DOCUMENTS */}
            <div className="recent-documents-card">

              <div className="recent-documents-header">

                <h2>
                  Documents récents
                </h2>

                <button className="view-all-btn">
                  Voir tout
                </button>

              </div>


              <div className="documents-table">

                {/* TABLE HEADER */}
                <div className="table-row table-header">

                  <span>
                    NOM DU DOCUMENT
                  </span>

                  <span>
                    TYPE
                  </span>

                  <span>
                    STATUT
                  </span>

                  <span>
                    DATE
                  </span>

                </div>


                {/* DOCUMENTS RÉCENTS */}
                {recentDocs.length === 0 ? (
                  <div className="table-row">
                    <span>
                      Aucun document récent pour le moment.
                    </span>
                  </div>
                ) : (
                  recentDocs.map((doc) => (
                    <div
                      className="table-row"
                      key={doc.id}
                    >
                      <strong>
                        {doc.name}
                      </strong>

                      <span>
                        {doc.type}
                      </span>

                      <span>
                        <span className={`status ${doc.status === 'ready' ? 'conform' : 'review'}`}>
                          {doc.status === 'ready' ? 'Prêt' : 'À extraire'}
                        </span>
                      </span>

                      <span>
                        {doc.date}
                      </span>
                    </div>
                  ))
                )}

              </div>

            </div>


            {/* SÉCURITÉ */}
            <div className="security-card">

              <div className="security-icon">
                ✓
              </div>

              <h3>
                Sécurité Maximale
              </h3>

              <p>
                Cryptage AES-256 des
                <br />
                documents analysés.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default Dashboard