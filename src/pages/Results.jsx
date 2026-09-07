import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  Settings2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api, { getErrorMessage } from "../api";
import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // MAPPING DES RÉSULTATS (backend)
  // ==========================================
  const mapComparison = (c) => {
    const passages = (c.passages || []).map((p) => ({
      id: p.order,
      document1: c.document1,
      document2: c.document2,
      similarity: p.similarity,
      text1: p.text1,
      text2: p.text2,
    }));

    return {
      id: c.id,
      document1: c.document1,
      document2: c.document2,
      similarity: c.similarity,
      status: c.status,
      commonNgrams: c.common_ngrams,
      totalNgramsDoc1: c.total_ngrams_doc1,
      totalNgramsDoc2: c.total_ngrams_doc2,
      date: c.date,
      analysisId: c.analysis_id,
      ngramSize: c.ngram_size,
      normalization: c.normalization,
      threshold: c.threshold,
      method: c.method,
      matches: c.matches,
      matchingPassages: passages,
    };
  };

  // ==========================================
  // CHARGEMENT DES RÉSULTATS (backend)
  // ==========================================
  useEffect(() => {
    const analysisId = location.state?.analysisId;

    const load = async () => {
      setLoading(true);
      try {
        if (analysisId) {
          const { data } = await api.get(`/analyses/${analysisId}/`);
          setResults((data.comparisons || []).map(mapComparison));
        } else {
          const { data } = await api.get("/analyses/list/");
          const all = [];
          for (const analysis of data) {
            all.push(...(analysis.comparisons || []).map(mapComparison));
          }
          setResults(all);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Impossible de charger les résultats."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location.state?.analysisId]);

  /* ==========================================
     STATUS
  ========================================== */

  const getStatus = (result) => {
    const status = result?.status;

    if (status === "plagiat") {
      return {
        label: "Plagiat",
        className: "plagiat",
      };
    }

    if (status === "revision") {
      return {
        label: "Révision",
        className: "revision",
      };
    }

    if (status === "conforme") {
      return {
        label: "Conforme",
        className: "conforme",
      };
    }

    const similarity = result?.similarity;

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
    (result) => result.status === "plagiat"
  ).length;

  const revisionCount = results.filter(
    (result) => result.status === "revision"
  ).length;

  const conformCount = results.filter(
    (result) => result.status === "conforme"
  ).length;


  /* ==========================================
     EXPORT
  ========================================== */

  const handleExport = () => {
    if (!selectedResult) return;

    const status = getStatus(
      selectedResult
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

        <Header />

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

              {loading ? (

                <div className="results-empty">

                  <h3>
                    Chargement...
                  </h3>

                  <p>
                    Récupération de vos résultats en cours.
                  </p>

                </div>

              ) : error ? (

                <div className="results-empty">

                  <h3>
                    Erreur
                  </h3>

                  <p>
                    {error}
                  </p>

                </div>

              ) : filteredResults.length === 0 ? (

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
                        getStatus(result);

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
                      selectedResult
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
                    selectedResult
                  ).className
                }
              >

                <CheckCircle2 size={14} />

                {
                  getStatus(
                    selectedResult
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