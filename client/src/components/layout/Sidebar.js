import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import CreateMarketModal from "../market/CreateMarketModal";

export default function Sidebar({ isConnected, account }) {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  // OPTIONNEL : Si vous voulez cacher le menu Admin aux autres utilisateurs, 
  // remplacez par : const isOracle = account?.toLowerCase() === "votre_adresse_oracle".toLowerCase();
  const isOracle = isConnected; 

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-title">Menu</div>
        <nav className="sidebar-nav">
          <Link 
            to="/global/active" 
            className={`sidebar-link ${location.pathname.includes('/global') ? 'active' : ''}`}
          >
            🌐 Vue Globale
          </Link>

          {isConnected ? (
            <>
              <Link 
                to="/personal/active" 
                className={`sidebar-link ${location.pathname.includes('/personal') ? 'active' : ''}`}
              >
                👤 Mon Profil
              </Link>

              {/* SECTION ADMINISTRATION ORACLE */}
              <div style={{ margin: '20px 0 10px 15px', fontSize: '10px', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>
                ADMINISTRATION
              </div>
              <Link 
                to="/admin/oracle" 
                className={`sidebar-link ${location.pathname.includes('/admin/oracle') ? 'active' : ''}`}
                style={{ color: '#4ade80' }} // Couleur distincte pour l'admin
              >
                ⚖️ Validation Oracle
              </Link>
            </>
          ) : (
            <div className="sidebar-link-disabled">
              🔒 Profil (Connectez-vous)
            </div>
          )}
        </nav>
      </div>

      {/* FAB Bouton - Création de Marché */}
      <div className="fab-container">
        <button 
          className={`btn-create-fab ${!isConnected ? 'fab-locked' : ''}`}
          onClick={() => isConnected ? setShowModal(true) : alert("Connectez MetaMask pour créer un Bet")}
          title="Créer un nouveau marché"
        >
          {isConnected ? "+" : "🔒"}
        </button>
      </div>

      {showModal && (
        <CreateMarketModal 
          onClose={() => setShowModal(false)} 
          onRefresh={() => window.location.reload()} 
        />
      )}
    </>
  );
}