import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Search,
  Download,
  File,
  FileType,
  AlertCircle,
  X,
  Eye,
  BarChart3,
  CheckSquare,
  Square,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Documents.css";

function Documents() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("Tous");
  const [error, setError] = useState("");

  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const allowedExtensions = ["txt", "docx", "pdf"];

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 octet";

    const units = ["octets", "Ko", "Mo", "Go"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  };

  // ==========================================
  // COUNT WORDS
  // ==========================================
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;

    return text.trim().split(/\s+/).length;
  };

  // ==========================================
  // IMPORT DOCUMENTS
  // ==========================================
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");

    const newDocuments = [];

    for (const file of files) {
      const extension = file.name.split(".").pop().toLowerCase();

      // Vérification format
      if (!allowedExtensions.includes(extension)) {
        setError(
          `Le fichier "${file.name}" n'est pas accepté. Formats autorisés : TXT, DOCX et PDF.`
        );
        continue;
      }

      // Vérification taille
      if (file.size === 0) {
        setError(`Le fichier "${file.name}" est vide.`);
        continue;
      }

      // Limite frontend : 10 MB
      if (file.size > 10 * 1024 * 1024) {
        setError(
          `Le fichier "${file.name}" dépasse la taille maximale de 10 Mo.`
        );
        continue;
      }

      // Vérification doublon
      const alreadyExists = documents.some(
        (doc) => doc.name.toLowerCase() === file.name.toLowerCase()
      );

      const alreadyAdded = newDocuments.some(
        (doc) => doc.name.toLowerCase() === file.name.toLowerCase()
      );

      if (alreadyExists || alreadyAdded) {
        setError(`Le document "${file.name}" existe déjà.`);
        continue;
      }

      let content = "";
      let words = 0;

      // Lecture TXT
      if (extension === "txt") {
        try {
          content = await file.text();
          words = countWords(content);

          if (!content.trim()) {
            setError(`Le fichier "${file.name}" ne contient aucun texte.`);
            continue;
          }
        } catch (err) {
          setError(`Impossible de lire le fichier "${file.name}".`);
          continue;
        }
      }

      // DOCX / PDF
      if (extension === "docx" || extension === "pdf") {
        content = "";
        words = 0;
      }

      const newDocument = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        words,
        date: new Date().toLocaleDateString("fr-FR"),
        type: extension.toUpperCase(),
        file,
        content,
        textExtracted: extension === "TXT",
        status: extension === "TXT" ? "Prêt" : "À extraire",
      };

      newDocuments.push(newDocument);
    }

    if (newDocuments.length > 0) {
      setDocuments((prev) => [...prev, ...newDocuments]);
    }

    // Reset input
    event.target.value = "";
  };

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================
  const handleDelete = (id) => {
    const document = documents.find((doc) => doc.id === id);

    if (!document) return;

    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer "${document.name}" ?`
    );

    if (!confirmDelete) return;

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));

    setSelectedDocuments((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );

    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
      setPreviewContent("");
      setShowPreview(false);
    }
  };

  // ==========================================
  // DOWNLOAD DOCUMENT
  // ==========================================
  const handleDownload = (document) => {
    if (!document.file) return;

    const url = URL.createObjectURL(document.file);

    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.name;

    window.document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // PREVIEW DOCUMENT
  // ==========================================
  const handlePreview = async (document) => {
    setSelectedDocument(document);
    setShowPreview(true);
    setPreviewContent("");

    if (document.type === "TXT") {
      try {
        const text = await document.file.text();
        setPreviewContent(text);
      } catch (err) {
        setPreviewContent("Impossible de prévisualiser ce document.");
      }
    } else if (document.type === "PDF") {
      setPreviewContent(
        "La prévisualisation du contenu PDF sera disponible avec le module d'extraction PDF."
      );
    } else if (document.type === "DOCX") {
      setPreviewContent(
        "La prévisualisation du contenu DOCX sera disponible avec le module d'extraction DOCX."
      );
    }
  };

  // ==========================================
  // CLOSE PREVIEW
  // ==========================================
  const closePreview = () => {
    setShowPreview(false);
    setSelectedDocument(null);
    setPreviewContent("");
  };

  // ==========================================
  // SELECT / UNSELECT DOCUMENT
  // ==========================================
  const toggleDocumentSelection = (id) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((documentId) => documentId !== id);
      }

      return [...prev, id];
    });
  };

  // ==========================================
  // SELECT ALL
  // ==========================================
  const toggleSelectAll = () => {
    if (filteredDocuments.length === 0) return;

    const allVisibleSelected = filteredDocuments.every((doc) =>
      selectedDocuments.includes(doc.id)
    );

    if (allVisibleSelected) {
      setSelectedDocuments((prev) =>
        prev.filter(
          (id) => !filteredDocuments.some((doc) => doc.id === id)
        )
      );
    } else {
      setSelectedDocuments((prev) => {
        const ids = filteredDocuments.map((doc) => doc.id);

        return [...new Set([...prev, ...ids])];
      });
    }
  };

  // ==========================================
  // ANALYSE ONE DOCUMENT
  // ==========================================
  const handleAnalyse = (document) => {
    navigate("/analyse", {
      state: {
        documentId: document.id,
        documentName: document.name,
        selectedDocuments: [document.id],
      },
    });
  };

  // ==========================================
  // ANALYSE SELECTED DOCUMENTS
  // ==========================================
  const handleAnalyseSelected = () => {
    if (selectedDocuments.length < 2) {
      setError(
        "Sélectionnez au moins deux documents pour effectuer une comparaison."
      );
      return;
    }

    const selectedDocs = documents.filter((doc) =>
      selectedDocuments.includes(doc.id)
    );

    navigate("/analyse", {
      state: {
        selectedDocuments: selectedDocs.map((doc) => doc.id),
        documents: selectedDocs,
      },
    });
  };

  // ==========================================
  // FILTER DOCUMENTS
  // ==========================================
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFormat =
      formatFilter === "Tous" || document.type === formatFilter;

    return matchesSearch && matchesFormat;
  });

  // ==========================================
  // FILE ICON
  // ==========================================
  const getFileIcon = (type) => {
    if (type === "PDF") return <FileType size={22} />;
    if (type === "DOCX") return <FileText size={22} />;

    return <File size={22} />;
  };

  // ==========================================
  // STATS
  // ==========================================
  const totalDocuments = documents.length;

  const txtCount = documents.filter((doc) => doc.type === "TXT").length;

  const docxCount = documents.filter((doc) => doc.type === "DOCX").length;

  const pdfCount = documents.filter((doc) => doc.type === "PDF").length;

  const analysableCount = documents.filter(
    (doc) => doc.type === "TXT"
  ).length;

  const allVisibleSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((doc) => selectedDocuments.includes(doc.id));

  return (
    <div className="documents-layout">
      <Sidebar />

      <main className="documents-content">
        {/* =====================================
            HEADER
        ===================================== */}
        <div className="documents-header">
          <div>
            <h1>Documents</h1>

            <p>
              Importez, consultez et gérez vos documents avant l'analyse.
            </p>
          </div>

          <div className="documents-header-actions">
            <button
              className="import-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Importer un document
            </button>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".txt,.docx,.pdf"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* =====================================
            ERROR
        ===================================== */}
        {error && (
          <div className="documents-error">
            <AlertCircle size={20} />

            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* =====================================
            STATISTICS
        ===================================== */}
        <div className="documents-stats">
          <div className="document-stat-card">
            <div className="stat-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Total documents</span>
              <strong>{totalDocuments}</strong>
            </div>
          </div>

          <div className="document-stat-card">
            <div className="stat-icon">
              <File size={22} />
            </div>

            <div>
              <span>Formats acceptés</span>
              <strong>3</strong>
              <small>TXT · DOCX · PDF</small>
            </div>
          </div>

          <div className="document-stat-card">
            <div className="stat-icon">
              <BarChart3 size={22} />
            </div>

            <div>
              <span>Documents analysables</span>
              <strong>{analysableCount}</strong>
            </div>
          </div>

          <div className="document-stat-card">
            <div className="stat-icon">
              <FileType size={22} />
            </div>

            <div>
              <span>Répartition</span>
              <strong>{txtCount + docxCount + pdfCount}</strong>
              <small>
                TXT {txtCount} · DOCX {docxCount} · PDF {pdfCount}
              </small>
            </div>
          </div>
        </div>

        {/* =====================================
            DOCUMENT CARD
        ===================================== */}
        <section className="documents-card">
          {/* TOP BAR */}
          <div className="documents-toolbar">
            <div className="documents-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="documents-filter">
              <Filter size={17} />

              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
              >
                <option value="Tous">Tous les formats</option>
                <option value="TXT">TXT</option>
                <option value="DOCX">DOCX</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
          </div>

          {/* SELECTION BAR */}
          {selectedDocuments.length > 0 && (
            <div className="selection-bar">
              <div>
                <strong>{selectedDocuments.length}</strong>{" "}
                document(s) sélectionné(s)
              </div>

              <button
                className="analyse-selected-button"
                onClick={handleAnalyseSelected}
              >
                <BarChart3 size={18} />
                Comparer les documents
              </button>
            </div>
          )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}
          {documents.length === 0 ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <Upload size={34} />
              </div>

              <h3>Aucun document</h3>

              <p>
                Importez vos documents TXT, DOCX ou PDF pour commencer.
              </p>

              <button
                className="empty-import-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Importer un document
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <Search size={34} />
              </div>

              <h3>Aucun résultat</h3>

              <p>
                Aucun document ne correspond à votre recherche ou à votre
                filtre.
              </p>
            </div>
          ) : (
            /* =====================================
               TABLE
            ===================================== */
            <div className="documents-table-wrapper">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th className="select-column">
                      <button
                        className="select-all-button"
                        onClick={toggleSelectAll}
                        title="Sélectionner tout"
                      >
                        {allVisibleSelected ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>

                    <th>Document</th>
                    <th>Format</th>
                    <th>Taille</th>
                    <th>Nombre de mots</th>
                    <th>Date d'importation</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => {
                    const isSelected = selectedDocuments.includes(
                      document.id
                    );

                    return (
                      <tr
                        key={document.id}
                        className={isSelected ? "selected-row" : ""}
                      >
                        {/* CHECKBOX */}
                        <td className="select-column">
                          <button
                            className="select-document-button"
                            onClick={() =>
                              toggleDocumentSelection(document.id)
                            }
                            title={
                              isSelected
                                ? "Désélectionner"
                                : "Sélectionner"
                            }
                          >
                            {isSelected ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>

                        {/* DOCUMENT */}
                        <td>
                          <div className="document-name-cell">
                            <div className="document-file-icon">
                              {getFileIcon(document.type)}
                            </div>

                            <div>
                              <strong>{document.name}</strong>

                              <span>
                                {document.type === "TXT"
                                  ? "Texte disponible"
                                  : "Extraction nécessaire"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* FORMAT */}
                        <td>
                          <span
                            className={`format-badge format-${document.type.toLowerCase()}`}
                          >
                            {document.type}
                          </span>
                        </td>

                        {/* SIZE */}
                        <td>{document.size}</td>

                        {/* WORDS */}
                        <td>
                          {document.words > 0
                            ? document.words.toLocaleString("fr-FR")
                            : "—"}
                        </td>

                        {/* DATE */}
                        <td>{document.date}</td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`status-badge ${
                              document.status === "Prêt"
                                ? "status-ready"
                                : "status-pending"
                            }`}
                          >
                            {document.status}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="document-actions">
                            <button
                              className="action-button preview"
                              onClick={() => handlePreview(document)}
                              title="Prévisualiser"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="action-button analyse"
                              onClick={() => handleAnalyse(document)}
                              title="Analyser"
                            >
                              <BarChart3 size={17} />
                            </button>

                            <button
                              className="action-button download"
                              onClick={() => handleDownload(document)}
                              title="Télécharger"
                            >
                              <Download size={17} />
                            </button>

                            <button
                              className="action-button delete"
                              onClick={() => handleDelete(document.id)}
                              title="Supprimer"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================
            INFO
        ===================================== */}
        <div className="documents-info">
          <AlertCircle size={18} />

          <div>
            <strong>Formats acceptés</strong>

            <p>
              TXT, DOCX et PDF · Taille maximale : 10 Mo par document.
            </p>
          </div>
        </div>
      </main>

      {/* =====================================
          PREVIEW MODAL
      ===================================== */}
      {showPreview && selectedDocument && (
        <div className="preview-overlay" onClick={closePreview}>
          <div
            className="preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="preview-header">
              <div>
                <div className="preview-title">
                  {getFileIcon(selectedDocument.type)}

                  <div>
                    <h2>{selectedDocument.name}</h2>

                    <span>
                      {selectedDocument.type} · {selectedDocument.size}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="preview-close"
                onClick={closePreview}
                title="Fermer"
              >
                <X size={21} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="preview-content">
              {selectedDocument.type === "TXT" ? (
                <pre>{previewContent}</pre>
              ) : (
                <div className="preview-unavailable">
                  <div className="preview-file-icon">
                    {getFileIcon(selectedDocument.type)}
                  </div>

                  <h3>Prévisualisation disponible prochainement</h3>

                  <p>
                    Le contenu du fichier {selectedDocument.type} nécessite
                    un module d'extraction de texte.
                  </p>

                  <small>
                    Pour le moment, vous pouvez conserver le document et
                    préparer son analyse.
                  </small>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="preview-footer">
              <button
                className="preview-download"
                onClick={() => handleDownload(selectedDocument)}
              >
                <Download size={18} />
                Télécharger
              </button>

              <button
                className="preview-analyse"
                onClick={() => handleAnalyse(selectedDocument)}
              >
                <BarChart3 size={18} />
                Préparer l'analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;