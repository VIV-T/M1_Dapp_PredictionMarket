import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import CreateMarketModal from "../market/CreateMarketModal";

export default function Sidebar({ isConnected }) {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-title">Menu</div>
        <nav className="sidebar-nav">
          <Link to="/global/active" className={`sidebar-link ${location.pathname.includes('/global') ? 'active' : ''}`}>
            🌐 Vue Globale
          </Link>

          {isConnected ? (
            <Link to="/personal/active" className={`sidebar-link ${location.pathname.includes('/personal') ? 'active' : ''}`}>
              👤 Mon Profil
            </Link>
          ) : (
            <div className="sidebar-link-disabled">
              🔒 Profil (Connectez-vous)
            </div>
          )}
        </nav>
      </div>

      {/* FAB Bouton - Uniquement si connecté */}
      <div className="fab-container">
        <button 
          className={`btn-create-fab ${!isConnected ? 'fab-locked' : ''}`}
          onClick={() => isConnected ? setShowModal(true) : alert("Connectez MetaMask pour créer un Bet")}
        >
          {isConnected ? "+" : "🔒"}
        </button>
      </div>

      {showModal && (
        <CreateMarketModal onClose={() => setShowModal(false)} onRefresh={() => window.location.reload()} />
      )}
    </>
  );
}