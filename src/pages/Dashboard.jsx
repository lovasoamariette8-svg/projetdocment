import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './Dashboard.css'

function Dashboard() {
  const months = [
    { month: 'Mars', conforme: 72, revision: 18, plagiat: 8 },
    { month: 'Avril', conforme: 88, revision: 22, plagiat: 6 },
    { month: 'Mai', conforme: 80, revision: 26, plagiat: 9 },
    { month: 'Juin', conforme: 100, revision: 29, plagiat: 7 },
    { month: 'Juil', conforme: 93, revision: 33, plagiat: 10 },
    { month: 'Août', conforme: 108, revision: 37, plagiat: 13 },
  ]

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
              <h1>Bienvenue, Admin</h1>
              <p>
                Vous avez 52 documents en attente d'analyse. Commencez dès maintenant.
              </p>
            </div>
          </section>

          {/* STATISTIQUES */}
          <section className="statistics-grid">
            <div className="stat-card">
              <p className="stat-label">
                TOTAL DOCUMENTS
              </p>

              <h3>0</h3>
              <span className="stat-positive">
                ↗ +0% ce mois
              </span>
            </div>


            <div className="stat-card">
              <p className="stat-label">
                ANALYSÉS
              </p>

              <h3>0</h3>

              <span className="stat-positive">
                ↗ +0% ce mois
              </span>
            </div>


            <div className="stat-card">
              <p className="stat-label">
                EN ATTENTE
              </p>

              <h3>0</h3>

              <span className="stat-warning">
                ↘ 0 nouveaux
              </span>
            </div>


            <div className="stat-card plagiarism-card">
              <p className="stat-label">
                ALERTES PLAGIAT
              </p>

              <h3>0</h3>

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

                  {months.map((item) => (
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


                {/* DOCUMENT 1 */}
                <div className="table-row">

                  <strong>
                    Rapport_Final_Projet.pdf
                  </strong>

                  <span>
                    PDF
                  </span>

                  <span>
                    <span className="status conform">
                      Conforme (2%)
                    </span>
                  </span>

                  <span>
                    31/08/2026
                  </span>

                </div>


                {/* DOCUMENT 2 */}
                <div className="table-row">

                  <strong>
                    Memoire_Licence_2.docx
                  </strong>

                  <span>
                    DOCX
                  </span>

                  <span>
                    <span className="status plagiarism">
                      Plagiat (68%)
                    </span>
                  </span>

                  <span>
                    30/08/2026
                  </span>

                </div>


                {/* DOCUMENT 3 */}
                <div className="table-row">

                  <strong>
                    Analyse_Texte_V1.txt
                  </strong>

                  <span>
                    TXT
                  </span>

                  <span>
                    <span className="status review">
                      À réviser (24%)
                    </span>
                  </span>

                  <span>
                    28/08/2026
                  </span>

                </div>

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