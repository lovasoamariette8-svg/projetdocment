import { useState } from "react";
import {
  User,
  Settings as SettingsIcon,
  FileText,
  Shield,
  Save
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import "./Parametres.css";

function Parametres() {

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  const [ngramSize, setNgramSize] = useState("3");
  const [normalisation, setNormalisation] = useState(true);
  const [seuil, setSeuil] = useState("70");

  const handleSave = (e) => {
    e.preventDefault();

    const settings = {
      nom,
      prenom,
      email,
      ngramSize,
      normalisation,
      seuil
    };

    localStorage.setItem(
      "textsimSettings",
      JSON.stringify(settings)
    );

    alert("Paramètres enregistrés avec succès !");
  };

  return (
    <div className="settings-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="settings-content">

        <div className="settings-page">

          {/* HEADER */}
          <div className="settings-header">
            <h1>Paramètres</h1>

            <p>
              Gérez votre compte et les paramètres
              de votre analyse de similarité.
            </p>
          </div>

          <form onSubmit={handleSave}>

            {/* =========================
                PROFIL
            ========================= */}

            <div className="settings-card">

              <div className="settings-title">

                <div className="settings-icon">
                  <User size={20} />
                </div>

                <div>
                  <h2>Profil utilisateur</h2>

                  <p>
                    Informations de votre compte
                  </p>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>Nom</label>

                  <input
                    type="text"
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    placeholder="Votre nom"
                  />
                </div>

                <div className="form-group">
                  <label>Prénom</label>

                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) =>
                      setPrenom(e.target.value)
                    }
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="form-group full">
                  <label>Email</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="votre@email.com"
                  />
                </div>

              </div>

            </div>


            {/* =========================
                ANALYSE
            ========================= */}

            <div className="settings-card">

              <div className="settings-title">

                <div className="settings-icon purple">
                  <SettingsIcon size={20} />
                </div>

                <div>
                  <h2>Paramètres d'analyse</h2>

                  <p>
                    Configuration de la comparaison
                    des documents
                  </p>
                </div>

              </div>


              {/* N-GRAMME */}

              <div className="setting-row">

                <div>
                  <h3>Taille du n-gramme</h3>

                  <p>
                    Taille des séquences utilisées
                    pour comparer les documents.
                  </p>
                </div>

                <select
                  value={ngramSize}
                  onChange={(e) =>
                    setNgramSize(e.target.value)
                  }
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>

              </div>


              {/* NORMALISATION */}

              <div className="setting-row">

                <div>
                  <h3>Normalisation du texte</h3>

                  <p>
                    Nettoyer le texte avant
                    la comparaison.
                  </p>
                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    checked={normalisation}
                    onChange={(e) =>
                      setNormalisation(
                        e.target.checked
                      )
                    }
                  />

                  <span></span>

                </label>

              </div>


              {/* SEUIL */}

              <div className="setting-row">

                <div>
                  <h3>Seuil d'alerte</h3>

                  <p>
                    Niveau de similarité considéré
                    comme élevé.
                  </p>
                </div>

                <div className="threshold">

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={seuil}
                    onChange={(e) =>
                      setSeuil(e.target.value)
                    }
                  />

                  <b>%</b>

                </div>

              </div>

            </div>


            {/* =========================
                FORMATS
            ========================= */}

            <div className="settings-card">

              <div className="settings-title">

                <div className="settings-icon blue">
                  <FileText size={20} />
                </div>

                <div>
                  <h2>Formats acceptés</h2>

                  <p>
                    Formats de documents autorisés
                    par l'application.
                  </p>
                </div>

              </div>

              <div className="formats">

                <div className="format">
                  <strong>TXT</strong>
                  <span>Fichier texte</span>
                  <b>✓</b>
                </div>

                <div className="format">
                  <strong>DOCX</strong>
                  <span>Document Word</span>
                  <b>✓</b>
                </div>

                <div className="format">
                  <strong>PDF</strong>
                  <span>Document PDF</span>
                  <b>✓</b>
                </div>

              </div>

            </div>


            {/* =========================
                SECURITE
            ========================= */}

            <div className="settings-card">

              <div className="settings-title">

                <div className="settings-icon green">
                  <Shield size={20} />
                </div>

                <div>
                  <h2>Sécurité</h2>

                  <p>
                    Informations relatives à
                    la sécurité du compte.
                  </p>
                </div>

              </div>

              <div className="security-box">

                <div>
                  <h3>Compte sécurisé</h3>

                  <p>
                    Votre compte est protégé par
                    le système d'authentification.
                  </p>
                </div>

              </div>

            </div>


            {/* SAVE */}

            <div className="save-container">

              <button
                type="submit"
                className="save-button"
              >
                <Save size={18} />
                Enregistrer
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default Parametres;