import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  Settings2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Results.css";

function Results() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const results = [
    {
      id: 1,
      document1: "document1.txt",
      document2: "rapport_stage.docx",
      similarity: 82,
      commonNgrams: 420,
      totalNgramsDoc1: 510,
      totalNgramsDoc2: 620,
      date: "01/09/2026",
      analysisId: "AN-001",

      /* NOUVEAUX INFORMATIONS */
      ngramSize: 3,
      normalization: "Oui",
      threshold: 70,
      method: "N-gram",
      matches: 24,

      matchingPassages: [
        {
          id: 1,
          document1: "document1.txt",
          document2: "rapport_stage.docx",
          similarity: 91,
          text1:
            "L'analyse des données permet d'identifier les principales tendances du document.",
          text2:
            "L'analyse des données permet d'identifier les tendances principales du rapport.",
        },
        {
          id: 2,
          document1: "document1.txt",
          document2: "rapport_stage.docx",
          similarity: 84,
          text1:
            "Cette méthode permet de comparer efficacement les contenus textuels.",
          text2:
            "Cette méthode permet une comparaison efficace des contenus textuels.",
        },
        {
          id: 3,
          document1: "document1.txt",
          document2: "rapport_stage.docx",
          similarity: 76,
          text1:
            "Les résultats obtenus sont ensuite présentés sous forme de statistiques.",
          text2:
            "Les résultats sont présentés ensuite sous forme de statistiques.",
        },
      ],
    },

    {
      id: 2,
      document1: "document1.txt",
      document2: "memoire.pdf",
      similarity: 38,
      commonNgrams: 180,
      totalNgramsDoc1: 510,
      totalNgramsDoc2: 760,
      date: "01/09/2026",
      analysisId: "AN-001",

      /* NOUVEAUX INFORMATIONS */
      ngramSize: 3,
      normalization: "Oui",
      threshold: 70,
      method: "N-gram",
      matches: 9,

      matchingPassages: [
        {
          id: 1,
          document1: "document1.txt",
          document2: "memoire.pdf",
          similarity: 52,
          text1:
            "La comparaison des documents permet de mesurer leur niveau de similarité.",
          text2:
            "La comparaison permet de mesurer le niveau de similarité entre les documents.",
        },
        {
          id: 2,
          document1: "document1.txt",
          document2: "memoire.pdf",
          similarity: 43,
          text1:
            "Les données sont ensuite analysées afin de produire un résultat.",
          text2:
            "Les données sont analysées afin de produire les résultats.",
        },
      ],
    },

    {
      id: 3,
      document1: "rapport_stage.docx",
      document2: "memoire.pdf",
      similarity: 67,
      commonNgrams: 350,
      totalNgramsDoc1: 620,
      totalNgramsDoc2: 760,
      date: "02/09/2026",
      analysisId: "AN-002",

      /* NOUVEAUX INFORMATIONS */
      ngramSize: 4,
      normalization: "Oui",
      threshold: 70,
      method: "N-gram",
      matches: 18,

      matchingPassages: [
        {
          id: 1,
          document1: "rapport_stage.docx",
          document2: "memoire.pdf",
          similarity: 74,
          text1:
            "Le système permet d'automatiser le traitement et l'analyse des documents.",
          text2:
            "Le système permet d'automatiser l'analyse et le traitement des documents.",
        },
        {
          id: 2,
          document1: "rapport_stage.docx",
          document2: "memoire.pdf",
          similarity: 68,
          text1:
            "Les résultats obtenus permettent de mieux comprendre les performances.",
          text2:
            "Les résultats permettent de comprendre les performances du système.",
        },
      ],
    },
  ];

  /* ==========================================
     STATUS
  ========================================== */

  const getStatus = (similarity) => {
    if (similarity >= 70) {
      return {
        label: "Plagiat",
        className: "plagiat",
      };
    }

    if (similarity >= 40) {
      return {
        label: "Révision",
        className: "revision",
      };
    }

    return {
      label: "Conforme",
      className: "conforme",
    };
  };


  /* ==========================================
     SEARCH
  ========================================== */

  const filteredResults = results.filter((result) => {
    const searchText = search.toLowerCase();

    return (
      result.document1.toLowerCase().includes(searchText) ||
      result.document2.toLowerCase().includes(searchText)
    );
  });


  /* ==========================================
     DETAILS
  ========================================== */

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedResult(null);
  };


  /* ==========================================
     STATISTICS
  ========================================== */

  const totalComparisons = results.length;

  const plagiarismCount = results.filter(
    (result) => result.similarity >= 70
  ).length;

  const revisionCount = results.filter(
    (result) =>
      result.similarity >= 40 &&
      result.similarity < 70
  ).length;

  const conformCount = results.filter(
    (result) => result.similarity < 40
  ).length;


  /* ==========================================
     EXPORT
  ========================================== */

  const handleExport = () => {
    if (!selectedResult) return;

    const status = getStatus(
      selectedResult.similarity
    );

    const content = `
TEXTSIM - RÉSULTAT D'ANALYSE

========================================

Identification
----------------------------------------
Analyse : ${selectedResult.analysisId}
Date : ${selectedResult.date}

Documents
----------------------------------------
Document 1 : ${selectedResult.document1}
Document 2 : ${selectedResult.document2}

Résultat
----------------------------------------
Similarité : ${selectedResult.similarity}%
Statut : ${status.label}
N-grammes communs : ${selectedResult.commonNgrams}
Correspondances : ${selectedResult.matches}

Paramètres
----------------------------------------
Méthode : ${selectedResult.method}
Taille N-gram : ${selectedResult.ngramSize}
Normalisation : ${selectedResult.normalization}
Seuil : ${selectedResult.threshold}%

========================================
TextSim - Détection de Similarité Textuelle
    `;

    const blob = new Blob(
      [content],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `TextSim_${selectedResult.analysisId}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  return (
    <div className="results-layout">

      <Sidebar />


      <main className="results-content">

        <div className="results-page">


          {/* ==========================================
              HEADER
          ========================================== */}

          <header className="results-header">

            <button
              className="results-back-btn"
              onClick={() => navigate("/analyse")}
            >
              <ArrowLeft size={16} />

              Retour d’analyse
            </button>


            <h1>
              Résultats
            </h1>


            <p>
              Consultez et analysez les résultats de vos
              comparaisons de documents.
            </p>

          </header>


          {/* ==========================================
              STATISTIQUES
          ========================================== */}

          <section className="results-stats">

            <div className="result-stat-card">

              <div className="result-stat-content">

                <span className="result-stat-label">
                  Comparaisons
                </span>

                <strong className="result-stat-value">
                  {totalComparisons}
                </strong>

              </div>

            </div>


            <div className="result-stat-card">

              <div className="result-stat-content">

                <span className="result-stat-label">
                  Plagiats détectés
                </span>

                <strong className="result-stat-value danger">
                  {plagiarismCount}
                </strong>

              </div>

            </div>


            <div className="result-stat-card">

              <div className="result-stat-content">

                <span className="result-stat-label">
                  À réviser
                </span>

                <strong className="result-stat-value warning">
                  {revisionCount}
                </strong>

              </div>

            </div>


            <div className="result-stat-card">

              <div className="result-stat-content">

                <span className="result-stat-label">
                  Conformes
                </span>

                <strong className="result-stat-value success">
                  {conformCount}
                </strong>

              </div>

            </div>

          </section>


          {/* ==========================================
              HISTORIQUE
          ========================================== */}

          <section className="results-card">

            <div className="results-card-header">

              <div>

                <h2>
                  Historique des résultats
                </h2>

                <p>
                  Liste des comparaisons effectuées.
                </p>

              </div>


              <div className="results-search">

                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

            </div>


            <div className="results-table-wrapper">

              {filteredResults.length === 0 ? (

                <div className="results-empty">

                  <h3>
                    Aucun résultat trouvé
                  </h3>

                  <p>
                    Aucun document ne correspond à votre recherche.
                  </p>

                </div>

              ) : (

                <table className="results-table">

                  <thead>

                    <tr>

                      <th>
                        Document 1
                      </th>

                      <th>
                        Document 2
                      </th>

                      <th>
                        Similarité
                      </th>

                      <th>
                        N-grammes communs
                      </th>

                      <th>
                        Statut
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredResults.map((result) => {

                      const status =
                        getStatus(result.similarity);

                      return (

                        <tr key={result.id}>


                          {/* DOCUMENT 1 */}

                          <td>

                            <div className="result-document">

                              <span className="document-file">
                                DOC
                              </span>

                              <span>
                                {result.document1}
                              </span>

                            </div>

                          </td>


                          {/* DOCUMENT 2 */}

                          <td>

                            <div className="result-document">

                              <span className="document-file">
                                DOC
                              </span>

                              <span>
                                {result.document2}
                              </span>

                            </div>

                          </td>


                          {/* SIMILARITE */}

                          <td>

                            <div className="similarity-wrapper">

                              <div className="similarity-value">
                                {result.similarity}%
                              </div>

                              <div className="similarity-bar">

                                <span
                                  style={{
                                    width:
                                      `${result.similarity}%`,
                                  }}
                                  className={
                                    status.className
                                  }
                                ></span>

                              </div>

                            </div>

                          </td>


                          {/* N-GRAMMES */}

                          <td>

                            <span className="ngrams-value">
                              {result.commonNgrams}
                            </span>

                          </td>


                          {/* STATUT */}

                          <td>

                            <span
                              className={
                                `result-status ${status.className}`
                              }
                            >
                              {status.label}
                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            <span className="result-date">
                              {result.date}
                            </span>

                          </td>


                          {/* ACTION */}

                          <td>

                            <button
                              className="details-btn"
                              onClick={() =>
                                handleViewDetails(result)
                              }
                            >
                              Détails
                            </button>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              )}

            </div>

          </section>

        </div>

      </main>


      {/* ==========================================
          MODAL DETAILS
      ========================================== */}

      {showDetails && selectedResult && (

        <div
          className="result-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="result-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ======================================
                MODAL HEADER
            ====================================== */}

            <div className="result-modal-header">

              <div>

                <h2>
                  Détails du résultat
                </h2>

                <p>
                  Analyse {selectedResult.analysisId}
                </p>

              </div>


              <button
                className="modal-close-btn"
                onClick={closeDetails}
              >
                Fermer
              </button>

            </div>


            {/* ======================================
                IDENTIFICATION
            ====================================== */}

            <div className="modal-analysis-info">

              <div className="modal-analysis-item">

                <span>
                  ID ANALYSE
                </span>

                <strong>
                  {selectedResult.analysisId}
                </strong>

              </div>


              <div className="modal-analysis-item">

                <span>
                  DATE
                </span>

                <strong>
                  {selectedResult.date}
                </strong>

              </div>

            </div>


            {/* ======================================
                DOCUMENTS
            ====================================== */}

            <div className="modal-documents">

              <div className="modal-document">

                <span className="modal-document-label">
                  DOCUMENT 1
                </span>

                <div className="modal-document-title">

                  <FileText size={17} />

                  <strong>
                    {selectedResult.document1}
                  </strong>

                </div>

              </div>


              <div className="modal-vs">
                VS
              </div>


              <div className="modal-document">

                <span className="modal-document-label">
                  DOCUMENT 2
                </span>

                <div className="modal-document-title">

                  <FileText size={17} />

                  <strong>
                    {selectedResult.document2}
                  </strong>

                </div>

              </div>

            </div>


            {/* ======================================
                SIMILARITE
            ====================================== */}

            <div className="modal-similarity">

              <div className="modal-similarity-header">

                <span>
                  Taux de similarité
                </span>

                <strong>
                  {selectedResult.similarity}%
                </strong>

              </div>


              <div className="modal-progress">

                <span
                  style={{
                    width:
                      `${selectedResult.similarity}%`,
                  }}
                  className={
                    getStatus(
                      selectedResult.similarity
                    ).className
                  }
                ></span>

              </div>

            </div>


            {/* ======================================
                DETAILS STATISTIQUES
            ====================================== */}

            <div className="modal-section-title">

              <BarChart3 size={16} />

              <span>
                Statistiques de comparaison
              </span>

            </div>


            <div className="modal-details-grid">

              <div className="modal-detail-item">

                <span>
                  N-grammes communs
                </span>

                <strong>
                  {selectedResult.commonNgrams}
                </strong>

              </div>


              <div className="modal-detail-item">

                <span>
                  Correspondances détectées
                </span>

                <strong>
                  {selectedResult.matches}
                </strong>

              </div>


              <div className="modal-detail-item">

                <span>
                  Total N-grammes Document 1
                </span>

                <strong>
                  {selectedResult.totalNgramsDoc1}
                </strong>

              </div>


              <div className="modal-detail-item">

                <span>
                  Total N-grammes Document 2
                </span>

                <strong>
                  {selectedResult.totalNgramsDoc2}
                </strong>

              </div>

            </div>


            {/* ======================================
                PARAMETRES
            ====================================== */}

            <div className="modal-section-title">

              <Settings2 size={16} />

              <span>
                Paramètres utilisés
              </span>

            </div>


            <div className="modal-settings-grid">

              <div className="modal-setting-item">

                <span>
                  Méthode
                </span>

                <strong>
                  {selectedResult.method}
                </strong>

              </div>


              <div className="modal-setting-item">

                <span>
                  Taille N-gram
                </span>

                <strong>
                  {selectedResult.ngramSize}
                </strong>

              </div>


              <div className="modal-setting-item">

                <span>
                  Normalisation
                </span>

                <strong>
                  {selectedResult.normalization}
                </strong>

              </div>


              <div className="modal-setting-item">

                <span>
                  Seuil de similarité
                </span>

                <strong>
                  {selectedResult.threshold}%
                </strong>

              </div>

            </div>


            {/* ======================================
                CORRESPONDANCES
            ====================================== */}

            <div className="modal-section-title">

              <Copy size={16} />

              <span>
                Correspondances détectées
              </span>

            </div>


            <div className="matching-passages">

              {selectedResult.matchingPassages.map(
                (passage) => (

                  <div
                    className="matching-passage"
                    key={passage.id}
                  >

                    <div className="matching-passage-header">

                      <div>

                        <span>
                          Correspondance {passage.id}
                        </span>

                      </div>

                      <strong>
                        {passage.similarity}%
                      </strong>

                    </div>


                    <div className="matching-documents">

                      <div className="matching-document">

                        <span>
                          {passage.document1}
                        </span>

                        <p>
                          {passage.text1}
                        </p>

                      </div>


                      <div className="matching-document">

                        <span>
                          {passage.document2}
                        </span>

                        <p>
                          {passage.text2}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* ======================================
                STATUT
            ====================================== */}

            <div className="modal-status">

              <span>
                Statut
              </span>

              <strong
                className={
                  getStatus(
                    selectedResult.similarity
                  ).className
                }
              >

                <CheckCircle2 size={14} />

                {
                  getStatus(
                    selectedResult.similarity
                  ).label
                }

              </strong>

            </div>


            {/* ======================================
                FOOTER ACTIONS
            ====================================== */}

            <div className="result-modal-footer">

              <button
                className="modal-export-btn"
                onClick={handleExport}
              >

                <Download size={15} />

                Exporter le résultat

              </button>


              <button
                className="modal-close-main-btn"
                onClick={closeDetails}
              >
                Fermer
              </button>

            </div>


          </div>

        </div>

      )}

    </div>
  );
}

export default Results;