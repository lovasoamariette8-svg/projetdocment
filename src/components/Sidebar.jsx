import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      // on ignore les erreurs réseau, on déconnecte quand même côté client
    }
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <p className="masthead-kicker">Éditeur de textes comparés</p>
        <h1 className="masthead-title">TextSim</h1>
        <p className="masthead-date">N° 03 — Analyse documentaire</p>
      </div>

      <button
        className="new-document-btn"
        onClick={() => navigate("/documents")}
      >
        <span className="material-symbols-outlined">add</span>
        <span>Nouveau document</span>
      </button>

      <span className="sidebar-menu-label">Sommaire</span>

      <nav className="sidebar-menu">

        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <span className="menu-index">01</span>
          <span className="menu-label">Accueil</span>
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <span className="menu-index">02</span>
          <span className="menu-label">Documents</span>
        </NavLink>

        <NavLink
          to="/analyse"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <span className="menu-index">03</span>
          <span className="menu-label">Nouvelle analyse</span>
        </NavLink>

        <NavLink
          to="/results"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <span className="menu-index">04</span>
          <span className="menu-label">Résultats</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
        >
          <span className="menu-index">05</span>
          <span className="menu-label">Paramètres</span>
        </NavLink>

      </nav>

      <button
        className="sidebar-logout-btn"
        onClick={handleLogout}
      >
        <span className="material-symbols-outlined">logout</span>
        <span>Déconnexion</span>
      </button>

      <div className="sidebar-colophon">
        <span>Tirage quotidien</span>
        <span>TextSim &amp; Co</span>
        <span>— Prix : 2 €</span>
      </div>

    </aside>
  );
}

export default Sidebar;