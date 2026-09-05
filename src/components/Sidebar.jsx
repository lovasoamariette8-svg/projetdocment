import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">

      {/* 
          LOGO */}
      <div className="sidebar-logo">
        <div>
          <h1>TextSim</h1>
          <p>Analyse de texte</p>
        </div>
      </div>

      {/* NOUVEAU DOCUMENT */}
      <button
        className="new-document-btn"
        onClick={() => navigate("/documents")}
      >
        <span className="material-symbols-outlined">
          add
        </span>

        <span>Nouveau document</span>
      </button>


      {/* =====================================
          MENU
      ===================================== */}
      <nav className="sidebar-menu">

        {/* ACCUEIL */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="menu-icon">
            <span className="material-symbols-outlined">
              home
            </span>
          </span>

          <span className="menu-label">
            Accueil
          </span>
        </NavLink>


        {/* DOCUMENTS */}
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="menu-icon">
            <span className="material-symbols-outlined">
              description
            </span>
          </span>

          <span className="menu-label">
            Documents
          </span>
        </NavLink>


        {/* NOUVELLE ANALYSE */}
        <NavLink
          to="/analyse"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="menu-icon">
            <span className="material-symbols-outlined">
              search
            </span>
          </span>

          <span className="menu-label">
            Nouvelle analyse
          </span>
        </NavLink>


        {/* RESULTATS */}
        <NavLink
          to="/results"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="menu-icon">
            <span className="material-symbols-outlined">
              bar_chart
            </span>
          </span>

          <span className="menu-label">
            Résultats
          </span>
        </NavLink>


        {/* PARAMETRES */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="menu-icon">
            <span className="material-symbols-outlined">
              settings
            </span>
          </span>

          <span className="menu-label">
            Paramètres
          </span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;