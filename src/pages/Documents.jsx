import { useRef, useState, useEffect } from "react";
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
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  FolderCheck,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api, { getErrorMessage } from "../api";
import "./Documents.css";

function Documents() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("Tous");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [moveDocument, setMoveDocument] = useState(null);
  const [moveTargets, setMoveTargets] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moving, setMoving] = useState(false);

  const [showFolders, setShowFolders] = useState(true);

  const allowedExtensions = ["txt", "docx", "pdf"];

  // ==========================================
  // CHARGEMENT DES DOCUMENTS ET DOSSIERS (backend)
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [docsRes, foldersRes] = await Promise.all([
          api.get("/documents/"),
          api.get("/folders/"),
        ]);

        setDocuments(
          docsRes.data.map((doc) => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            sizeBytes: doc.size_bytes,
            words: doc.words,
            date: doc.date,
            type: doc.type,
            status: doc.status === "ready" ? "Prêt" : "À extraire",
            textExtracted: doc.text_extracted,
            folderId: doc.folder_id,
            folderName: doc.folder_name,
          }))
        );

        setFolders(
          foldersRes.data.map((folder) => ({
            id: folder.id,
            name: folder.name,
            documentCount: folder.document_count,
          }))
        );
      } catch (err) {
        setError(
          getErrorMessage(err, "Impossible de charger les documents.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // IMPORT DOCUMENTS
  // ==========================================
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");

    const uploaded = [];

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

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        if (activeFolder) formData.append("folder_id", activeFolder);

        const { data } = await api.post("/documents/", formData);

        uploaded.push({
          id: data.id,
          name: data.name,
          size: data.size,
          sizeBytes: data.size_bytes,
          words: data.words,
          date: data.date,
          type: data.type,
          status: data.status === "ready" ? "Prêt" : "À extraire",
          textExtracted: data.text_extracted,
          folderId: activeFolder,
          folderName: activeFolder
            ? folders.find((f) => f.id === activeFolder)?.name || null
            : null,
        });
        setError("");
      } catch (err) {
        setError(getErrorMessage(err, `Impossible d'importer "${file.name}".`));
      }
    }

    if (uploaded.length > 0) {
      setDocuments((prev) => [...prev, ...uploaded]);
      setFolders((prev) =>
        activeFolder
          ? prev.map((f) =>
              f.id === activeFolder
                ? { ...f, documentCount: f.documentCount + uploaded.length }
                : f
            )
          : prev
      );
    }

    // Reset input
    event.target.value = "";
  };

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================
  const handleDelete = async (id) => {
    const document = documents.find((doc) => doc.id === id);

    if (!document) return;

    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer "${document.name}" ?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/documents/${id}/`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      setFolders((prev) =>
        document.folderId
          ? prev.map((f) =>
              f.id === document.folderId
                ? { ...f, documentCount: Math.max(0, f.documentCount - 1) }
                : f
            )
          : prev
      );

      setSelectedDocuments((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );

      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
        setPreviewContent("");
        setShowPreview(false);
      }
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le document."));
    }
  };

  // ==========================================
  // DOWNLOAD DOCUMENT
  // ==========================================
  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/documents/${document.id}/`, {
        params: { action: "download" },
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de télécharger le document."));
    }
  };

  // ==========================================
  // PREVIEW DOCUMENT
  // ==========================================
  const handlePreview = async (document) => {
    setSelectedDocument(document);
    setShowPreview(true);
    setPreviewContent("");

    try {
      const { data } = await api.get(`/documents/${document.id}/`, {
        params: { action: "preview" },
      });

      if (
        data.text_extracted &&
        data.content &&
        data.content.trim()
      ) {
        setPreviewContent(data.content);
      } else if (document.type === "TXT") {
        setPreviewContent(data.content || "Aucun texte disponible.");
      } else if (document.type === "PDF") {
        setPreviewContent(
          "La prévisualisation du contenu PDF sera disponible avec le module d'extraction PDF."
        );
      } else if (document.type === "DOCX") {
        setPreviewContent(
          "La prévisualisation du contenu DOCX sera disponible avec le module d'extraction DOCX."
        );
      }
    } catch (err) {
      setPreviewContent(
        getErrorMessage(err, "Impossible de prévisualiser ce document.")
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
  // OUVERTURE DEPUIS UNE RECHERCHE (header)
  // ==========================================
  useEffect(() => {
    const targetId = location.state?.openDocumentId;
    if (!targetId || documents.length === 0) return;

    const target = documents.find((doc) => doc.id === targetId);
    if (!target) return;

    handlePreview(target).then(() => {
      setActiveFolder(target.folderId);
    });

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, documents, navigate, location.pathname]);

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
    const matchesFolder = !activeFolder || document.folderId === activeFolder;

    const matchesSearch = document.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFormat =
      formatFilter === "Tous" || document.type === formatFilter;

    return matchesFolder && matchesSearch && matchesFormat;
  });

  // ==========================================
  // FOLDER CRUD
  // ==========================================
  const openCreateFolder = () => {
    setEditingFolder(null);
    setFolderName("");
    setFolderError("");
    setShowFolderModal(true);
  };

  const openEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderError("");
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    if (creatingFolder) return;
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderName("");
    setFolderError("");
  };

  const handleSaveFolder = async () => {
    const name = folderName.trim();

    if (!name) {
      setFolderError("Le nom du dossier est obligatoire.");
      return;
    }

    setFolderError("");

    if (
      folders.some(
        (f) =>
          f.name.toLowerCase() === name.toLowerCase() &&
          f.id !== editingFolder?.id
      )
    ) {
      setFolderError(`Un dossier nommé "${name}" existe déjà.`);
      return;
    }

    setCreatingFolder(true);

    try {
      if (editingFolder) {
        const { data } = await api.patch(`/folders/${editingFolder.id}/`, {
          name,
        });
        setFolders((prev) =>
          prev.map((f) => (f.id === data.id ? { ...f, name: data.name } : f))
        );
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.folderId === data.id
              ? { ...doc, folderName: data.name }
              : doc
          )
        );
      } else {
        const { data } = await api.post("/folders/", { name });
        setFolders((prev) => [
          ...prev,
          { id: data.id, name: data.name, documentCount: 0 },
        ]);
      }

      setShowFolderModal(false);
      setEditingFolder(null);
      setFolderName("");
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Impossible d'enregistrer le dossier."
      );
      setFolderError(message.replace(/^.*: /, ""));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folder) => {
    const hasDocuments = folder.documentCount > 0;

    const confirmMessage = hasDocuments
      ? `Le dossier "${folder.name}" contient ${
          folder.documentCount
        } document(s). Ces documents seront déplacés hors du dossier. Voulez-vous vraiment supprimer ce dossier ?`
      : `Voulez-vous vraiment supprimer le dossier "${folder.name}" ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await api.delete(`/folders/${folder.id}/`);

      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.folderId === folder.id
            ? { ...doc, folderId: null, folderName: null }
            : doc
        )
      );

      if (activeFolder === folder.id) {
        setActiveFolder(null);
        setSelectedDocuments([]);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le dossier."));
    }
  };

  const selectFolder = (id) => {
    setActiveFolder(id);
    setSearch("");
    setSelectedDocuments([]);
  };

  // ==========================================
  // MOVE DOCUMENTS TO FOLDER
  // ==========================================
  const openMoveModal = (document = null, targetIds = null) => {
    setMoveDocument(document);
    setMoveTargets(targetIds);
    setShowMoveModal(true);
  };

  const closeMoveModal = () => {
    if (moving) return;
    setShowMoveModal(false);
    setMoveDocument(null);
    setMoveTargets(null);
  };

  const handleMoveToFolder = async (folderId) => {
    if (!moveDocument && !moveTargets) return;

    setMoving(true);

    try {
      const targetFolder = folders.find((f) => f.id === folderId) || null;

      if (moveTargets) {
        await api.post("/documents/move/", {
          document_ids: moveTargets,
          folder_id: folderId,
        });

        const movedDocs = documents.filter((d) =>
          moveTargets.includes(d.id)
        );

        setDocuments((prev) =>
          prev.map((doc) =>
            moveTargets.includes(doc.id)
              ? {
                  ...doc,
                  folderId: folderId,
                  folderName: targetFolder ? targetFolder.name : null,
                }
              : doc
          )
        );

        setFolders((prev) =>
          prev.map((f) => {
            const leaving = movedDocs.filter(
              (d) => d.folderId === f.id && folderId !== f.id
            ).length;
            const entering =
              f.id === folderId
                ? movedDocs.filter((d) => d.folderId !== folderId).length
                : 0;
            return {
              ...f,
              documentCount: Math.max(0, f.documentCount - leaving + entering),
            };
          })
        );

        setSelectedDocuments([]);
      } else {
        const { data } = await api.post(`/documents/${moveDocument.id}/move/`, {
          folder_id: folderId,
        });

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === moveDocument.id
              ? {
                  ...doc,
                  folderId: data.folder_id,
                  folderName: data.folder_name,
                }
              : doc
          )
        );

        const previousFolderId = documents.find(
          (d) => d.id === moveDocument.id
        )?.folderId;

        setFolders((prev) =>
          prev.map((f) => {
            if (f.id === folderId && folderId !== previousFolderId) {
              return { ...f, documentCount: f.documentCount + 1 };
            }
            if (f.id === previousFolderId && folderId !== previousFolderId) {
              return {
                ...f,
                documentCount: Math.max(0, f.documentCount - 1),
              };
            }
            return f;
          })
        );
      }

      setShowMoveModal(false);
      setMoveDocument(null);
      setMoveTargets(null);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de déplacer le document."));
    } finally {
      setMoving(false);
    }
  };

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

  const activeFolderName = activeFolder
    ? folders.find((f) => f.id === activeFolder)?.name || null
    : null;

  return (
    <div className={`documents-layout ${showFolders ? "" : "folders-hidden"}`}>
      <Sidebar />

      {/* =====================================
          FOLDERS SIDEBAR
      ===================================== */}
      {showFolders ? (
        <aside className="folders-sidebar">
          <div className="folders-sidebar-header">
            <span>Dossiers</span>

            <div className="folders-sidebar-actions">
              <button
                className="folders-toggle-btn"
                onClick={() => setShowFolders(false)}
                title="Masquer les dossiers"
              >
                <PanelLeftClose size={15} />
              </button>

              <button
                className="folder-add-button"
                onClick={openCreateFolder}
                title="Créer un dossier"
              >
                <FolderPlus size={18} />
              </button>
            </div>
          </div>

          <button
            className={`folder-item ${activeFolder === null ? "active" : ""}`}
            onClick={() => selectFolder(null)}
          >
            <FolderOpen size={19} />
            <span className="folder-item-name">Tous les documents</span>
            <span className="folder-item-count">{documents.length}</span>
          </button>

          <div className="folders-sidebar-list">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`folder-item ${
                  activeFolder === folder.id ? "active" : ""
                }`}
                onClick={() => selectFolder(folder.id)}
              >
                <Folder size={19} />

                <span className="folder-item-name">{folder.name}</span>

                <span className="folder-item-count">
                  {folder.documentCount}
                </span>

                <div className="folder-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditFolder(folder);
                    }}
                    title="Renommer"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    className="folder-delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {folders.length === 0 && (
            <div className="folders-sidebar-empty">
              <Folder size={22} />

              <p>Aucun dossier pour le moment.</p>
            </div>
          )}
        </aside>
      ) : (
        <aside className="folders-sidebar-rail">
          <button
            className="folders-rail-toggle"
            onClick={() => setShowFolders(true)}
            title="Afficher les dossiers"
          >
            <PanelLeftOpen size={16} />
          </button>

          <span className="folders-rail-label">Dossiers</span>
        </aside>
      )}

      <main className="documents-content">
        {/* =====================================
            GLOBAL HEADER WITH SEARCH
        ===================================== */}
        <Header />

        {/* =====================================
            HEADER
        ===================================== */}
        <div className="documents-header">
          <div>
            <h1>Documents</h1>

            <p>
              {activeFolder
                ? `Dossier "${folders.find((f) => f.id === activeFolder)?.name || ""}"`
                : "Importez, consultez et gérez vos documents avant l'analyse."}
            </p>
          </div>

          <div className="documents-header-actions">
            <button
              className="folder-button"
              onClick={openCreateFolder}
            >
              <FolderPlus size={18} />
              Nouveau dossier
            </button>

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

            <div className="documents-toolbar-actions">
              <div className="documents-folder-filter">
                <Folder size={17} />

                <select
                  value={activeFolder ?? ""}
                  onChange={(e) =>
                    selectFolder(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Tous les documents</option>

                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} ({folder.documentCount})
                    </option>
                  ))}
                </select>
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
          </div>

          {/* SELECTION BAR */}
          {selectedDocuments.length > 0 && (
            <div className="selection-bar">
              <div>
                <strong>{selectedDocuments.length}</strong>{" "}
                document(s) sélectionné(s)
              </div>

              <div className="selection-bar-actions">
                <button
                  className="move-selected-button"
                  onClick={() => openMoveModal(null, selectedDocuments)}
                >
                  <FolderInput size={18} />
                  Déplacer vers un dossier
                </button>

                <button
                  className="analyse-selected-button"
                  onClick={handleAnalyseSelected}
                >
                  <BarChart3 size={18} />
                  Comparer les documents
                </button>
              </div>
            </div>
          )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}
          {loading ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <Upload size={34} />
              </div>

              <h3>Chargement...</h3>

              <p>
                Récupération de vos documents en cours.
              </p>
            </div>
          ) : documents.length === 0 ? (
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
          ) : activeFolder && filteredDocuments.length === 0 && !search ? (
            <div className="documents-empty">
              <div className="empty-icon">
                <Folder size={34} />
              </div>

              <h3>Dossier vide</h3>

              <p>
                Ce dossier ne contient aucun document. Importez un document
                ou déplacez un document existant dans ce dossier.
              </p>

              <button
                className="empty-import-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Importer dans ce dossier
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
                              className="action-button move"
                              onClick={() => openMoveModal(document)}
                              title="Déplacer vers un dossier"
                            >
                              <FolderInput size={17} />
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
            <strong>Astuce</strong>

            <p>
              Créez des dossiers pour organiser vos documents. Importez
              directement dans un dossier ou déplacez vos documents à tout
              moment. Formats acceptés : TXT, DOCX et PDF · Taille maximale
              : 10 Mo par document.
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

      {/* =====================================
          FOLDER MODAL (créer / renommer)
      ===================================== */}
      {showFolderModal && (
        <div className="preview-overlay" onClick={closeFolderModal}>
          <div
            className="folder-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="folder-modal-header">
              <div className="folder-modal-title">
                <Folder size={20} />

                <h2>
                  {editingFolder
                    ? "Renommer le dossier"
                    : "Nouveau dossier"}
                </h2>
              </div>

              <button
                className="preview-close"
                onClick={closeFolderModal}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="folder-modal-body">
              <label htmlFor="folder-name-input">Nom du dossier</label>

              <input
                id="folder-name-input"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveFolder();
                }}
                placeholder="Ex : Rapport de stage"
                autoFocus
              />

              {folderError && (
                <div className="folder-modal-error">
                  <AlertCircle size={16} />
                  {folderError}
                </div>
              )}
            </div>

            <div className="folder-modal-footer">
              <button
                className="preview-download"
                onClick={closeFolderModal}
                disabled={creatingFolder}
              >
                Annuler
              </button>

              <button
                className="preview-analyse"
                onClick={handleSaveFolder}
                disabled={creatingFolder}
              >
                <FolderCheck size={18} />
                {creatingFolder
                  ? "Enregistrement..."
                  : editingFolder
                    ? "Renommer"
                    : "Créer le dossier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          MOVE MODAL (déplacer vers un dossier)
      ===================================== */}
      {showMoveModal && (
        <div className="preview-overlay" onClick={closeMoveModal}>
          <div
            className="folder-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="folder-modal-header">
              <div className="folder-modal-title">
                <FolderInput size={20} />

                <h2>Déplacer vers un dossier</h2>
              </div>

              <button
                className="preview-close"
                onClick={closeMoveModal}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="folder-modal-body">
              <p className="folder-modal-description">
                {moveTargets
                  ? `Déplacer ${moveTargets.length} document(s) sélectionné(s)`
                  : moveDocument
                    ? `Déplacer "${moveDocument.name}"`
                    : ""}
              </p>

              <div className="move-folder-list">
                {moveDocument && (
                  <div className="move-current-folder">
                    <FolderCheck size={16} />
                    Dossier actuel :{" "}
                    <strong>
                      {moveDocument.folderName || "Hors dossier"}
                    </strong>
                  </div>
                )}

                {!moveDocument && moveTargets && (
                  <div className="move-current-folder">
                    <FolderCheck size={16} />
                    Dossier actuel :{" "}
                    <strong>{activeFolderName || "Hors dossier"}</strong>
                  </div>
                )}

                <button
                  className="move-folder-option"
                  onClick={() => handleMoveToFolder(null)}
                >
                  <FolderOpen size={18} />
                  <span>Hors dossier (racine)</span>
                </button>

                {folders
                  .filter((folder) =>
                    moveDocument
                      ? folder.id !== moveDocument.folderId
                      : moveTargets
                        ? !moveTargets.every(
                            (id) =>
                              documents.find((d) => d.id === id)?.folderId ===
                              folder.id
                          )
                        : true
                  )
                  .map((folder) => (
                    <button
                      key={folder.id}
                      className="move-folder-option"
                      onClick={() => handleMoveToFolder(folder.id)}
                    >
                      <Folder size={18} />
                      <span>{folder.name}</span>
                      <small>{folder.documentCount}</small>
                    </button>
                  ))}
              </div>
            </div>

            <div className="folder-modal-footer">
              <span className="folder-modal-hint">
                Choisissez un dossier de destination.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;