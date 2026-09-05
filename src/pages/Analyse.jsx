import { useState } from "react";
import {
  FileText,
  Settings,
  Play,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Info,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Analyse.css";

function Analyse() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // DOCUMENTS DISPONIBLES
  // ==========================================
  // Pour le moment, données de démonstration.
  // Plus tard: récupération depuis le backend/MySQL.

  const [documents] = useState([
    {
      id: 1,
      name: "document1.txt",
      type: "TXT",
      words: 1250,
    },
    {
      id: 2,
      name: "rapport_stage.docx",
      type: "DOCX",
      words: 2340,
    },
    {
      id: 3,
      name: "memoire.pdf",
      type: "PDF",
      words: 3120,
    },
  ]);

  // ==========================================
  // DOCUMENTS SÉLECTIONNÉS
  // ==========================================

  const [selectedDocuments, setSelectedDocuments] =
    useState(
      location.state?.documentId
        ? [location.state.documentId]
        : []
    );

  // ==========================================
  // PARAMÈTRES RG11
  // ==========================================

  const [ngramSize, setNgramSize] = useState(3);

  const [normalization, setNormalization] =
    useState("lowercase");

  const [alertThreshold, setAlertThreshold] =
    useState(70);

  // ==========================================
  // ÉTAT
  // ==========================================

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // SÉLECTION DOCUMENT
  // ==========================================

  const handleDocumentSelect = (id) => {
    setError("");
    setSuccess(false);

    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (documentId) =>
            documentId !== id
        );
      }

      return [...prev, id];
    });
  };

  // ==========================================
  // SUPPRIMER UNE SÉLECTION
  // ==========================================

  const removeSelectedDocument = (id) => {
    setSelectedDocuments((prev) =>
      prev.filter(
        (documentId) =>
          documentId !== id
      )
    );
  };

  // ==========================================
  // LANCER ANALYSE
  // ==========================================

  const handleStartAnalysis = async () => {
    setError("");
    setSuccess(false);

    // ========================================
    // RG10
    // Une analyse doit porter sur
    // au moins deux documents
    // ========================================

    if (selectedDocuments.length < 2) {
      setError(
        "Veuillez sélectionner au moins deux documents pour lancer une analyse."
      );

      return;
    }

    // ========================================
    // RG11
    // Vérification paramètres
    // ========================================

    if (
      ngramSize < 1 ||
      ngramSize > 10
    ) {
      setError(
        "La taille du n-gramme doit être comprise entre 1 et 10."
      );

      return;
    }

    if (
      alertThreshold < 0 ||
      alertThreshold > 100
    ) {
      setError(
        "Le seuil d'alerte doit être compris entre 0 et 100 %."
      );

      return;
    }

    // ========================================
    // SIMULATION DE L'ENVOI BACKEND
    // ========================================

    setLoading(true);

    try {
      /*
        Plus tard, remplacer cette partie par:

        await axios.post(
          "http://localhost:5000/api/analyses",
          {
            documentIds: selectedDocuments,
            ngramSize,
            normalization,
            alertThreshold
          }
        );
      */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1200)
      );

      setSuccess(true);

      /*
        Après connexion au backend:

        navigate("/results", {
          state: {
            analysisId: response.data.id
          }
        });
      */
    } catch (err) {
      setError(
        "Une erreur est survenue lors du lancement de l'analyse."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOCUMENTS SÉLECTIONNÉS
  // ==========================================

  const selectedDocumentObjects =
    documents.filter((doc) =>
      selectedDocuments.includes(
        doc.id
      )
    );

  return (
    <div className="analyse-layout">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <Sidebar />


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="analyse-content">

        <div className="analyse-page">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="analyse-header">

            <div>

              <button
                className="back-btn"
                onClick={() =>
                  navigate("/documents")
                }
              >
                <ArrowLeft
                  size={17}
                />

                Retour aux documents
              </button>

              <h1>
                Nouvelle analyse
              </h1>

              <p>
                Comparez plusieurs documents
                afin de détecter leur similarité
                textuelle.
              </p>

            </div>

          </div>


          {/* ==================================
              ALERT ERROR
          ================================== */}

          {error && (

            <div className="analyse-alert error">

              <AlertCircle
                size={19}
              />

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  setError("")
                }
              >
                <X size={17} />
              </button>

            </div>

          )}


          {/* ==================================
              SUCCESS
          ================================== */}

          {success && (

            <div className="analyse-alert success">

              <CheckCircle
                size={19}
              />

              <div>

                <strong>
                  Analyse prête
                </strong>

                <span>
                  Les paramètres sont
                  correctement configurés.
                  Le traitement peut être
                  effectué par le backend.
                </span>

              </div>

            </div>

          )}


          {/* ==================================
              INFORMATION
          ================================== */}

          <div className="analyse-info">

            <Info size={19} />

            <div>

              <strong>
                Comment fonctionne l'analyse ?
              </strong>

              <p>
                Sélectionnez au minimum deux
                documents, puis configurez les
                paramètres de comparaison.
              </p>

            </div>

          </div>


          {/* ==================================
              DOCUMENTS
          ================================== */}

          <section className="analyse-card">

            <div className="section-header">

              <div className="section-title">

                <div className="section-icon">
                  <FileText
                    size={19}
                  />
                </div>

                <div>

                  <h2>
                    Documents à comparer
                  </h2>

                  <p>
                    Sélectionnez au moins
                    deux documents.
                  </p>

                </div>

              </div>


              <span className="selection-count">

                {selectedDocuments.length}

                {" "}sélectionné
                {selectedDocuments.length !==
                1
                  ? "s"
                  : ""}

              </span>

            </div>


            {/* DOCUMENT LIST */}

            <div className="document-selection-list">

              {documents.map(
                (doc) => {

                  const isSelected =
                    selectedDocuments.includes(
                      doc.id
                    );

                  return (

                    <button
                      key={doc.id}
                      type="button"
                      className={
                        isSelected
                          ? "analyse-document selected"
                          : "analyse-document"
                      }
                      onClick={() =>
                        handleDocumentSelect(
                          doc.id
                        )
                      }
                    >

                      <div className="analyse-document-icon">

                        <FileText
                          size={22}
                        />

                      </div>


                      <div className="analyse-document-info">

                        <strong>
                          {doc.name}
                        </strong>

                        <span>
                          {doc.type}
                          {" · "}
                          {doc.words.toLocaleString(
                            "fr-FR"
                          )}
                          {" mots"}
                        </span>

                      </div>


                      <div
                        className={
                          isSelected
                            ? "selection-check checked"
                            : "selection-check"
                        }
                      >

                        {isSelected && (
                          <CheckCircle
                            size={20}
                          />
                        )}

                      </div>

                    </button>

                  );
                }
              )}

            </div>


            {/* SELECTED DOCUMENTS */}

            {selectedDocumentObjects.length >
              0 && (

              <div className="selected-documents">

                <span>
                  Documents sélectionnés :
                </span>

                <div>

                  {selectedDocumentObjects.map(
                    (doc) => (

                      <span
                        className="selected-tag"
                        key={doc.id}
                      >

                        {doc.name}

                        <button
                          type="button"
                          onClick={() =>
                            removeSelectedDocument(
                              doc.id
                            )
                          }
                        >
                          <X size={13} />
                        </button>

                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          </section>


          {/* ==================================
              PARAMÈTRES
          ================================== */}

          <section className="analyse-card">

            <div className="section-header">

              <div className="section-title">

                <div className="section-icon">
                  <Settings
                    size={19}
                  />
                </div>

                <div>

                  <h2>
                    Paramètres de l'analyse
                  </h2>

                  <p>
                    Configurez les paramètres
                    de comparaison.
                  </p>

                </div>

              </div>

            </div>


            <div className="settings-grid">

              {/* N-GRAMME */}

              <div className="setting-item">

                <label>
                  Taille du n-gramme
                </label>

                <select
                  value={ngramSize}
                  onChange={(e) =>
                    setNgramSize(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={1}>
                    1
                  </option>

                  <option value={2}>
                    2
                  </option>

                  <option value={3}>
                    3
                  </option>

                  <option value={4}>
                    4
                  </option>

                  <option value={5}>
                    5
                  </option>

                  <option value={6}>
                    6
                  </option>

                </select>

                <small>
                  Nombre de mots utilisés
                  pour créer les n-grammes.
                </small>

              </div>


              {/* NORMALISATION */}

              <div className="setting-item">

                <label>
                  Normalisation
                </label>

                <select
                  value={normalization}
                  onChange={(e) =>
                    setNormalization(
                      e.target.value
                    )
                  }
                >

                  <option value="lowercase">
                    Minuscules
                  </option>

                  <option value="accents">
                    Suppression des accents
                  </option>

                  <option value="spaces">
                    Normalisation des espaces
                  </option>

                  <option value="full">
                    Normalisation complète
                  </option>

                </select>

                <small>
                  Prétraitement appliqué avant
                  la comparaison.
                </small>

              </div>


              {/* SEUIL */}

              <div className="setting-item threshold-setting">

                <label>
                  Seuil d'alerte
                </label>

                <div className="threshold-value">
                  {alertThreshold}%
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) =>
                    setAlertThreshold(
                      Number(e.target.value)
                    )
                  }
                />

                <div className="range-labels">
                  <span>
                    0%
                  </span>

                  <span>
                    50%
                  </span>

                  <span>
                    100%
                  </span>
                </div>

                <small>
                  Une similarité supérieure ou
                  égale à ce seuil sera signalée.
                </small>

              </div>

            </div>

          </section>


          {/* ==================================
              RÉSUMÉ
          ================================== */}

          <section className="analyse-summary">

            <div>

              <h3>
                Résumé de l'analyse
              </h3>

              <p>
                {selectedDocuments.length}
                {" "}document
                {selectedDocuments.length !==
                1
                  ? "s"
                  : ""}

                {" · "}

                n-gramme de taille{" "}
                {ngramSize}

                {" · "}

                seuil{" "}
                {alertThreshold}%

              </p>

            </div>


            <button
              className="start-analysis-btn"
              onClick={
                handleStartAnalysis
              }
              disabled={loading}
            >

              {loading ? (
                <>
                  Traitement...
                </>
              ) : (
                <>
                  <Play
                    size={18}
                  />

                  Lancer l'analyse
                </>
              )}

            </button>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Analyse;