import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { initWeb3 } from "../../utils/web3";
import MarketCard from "./MarketCard";

export default function Panel({ view, account }) {
  const { status } = useParams();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBlockchainData = useCallback(async () => {
    try {
      // ÉTAPE 1 : Initialisation du contrat
      const { predictionMarket } = await initWeb3();
      
      // On récupère le nombre total de marchés créés
      const marketCount = await predictionMarket.methods.nextMarketId().call();
      const now = Math.floor(Date.now() / 1000);
      
      const loadedMarkets = [];

      // ÉTAPE 2 : Boucle de récupération des données pour chaque marché
      for (let i = 0; i < marketCount; i++) {
        const m = await predictionMarket.methods.markets(i).call();
        
        let userStake = "0";
        let userStakeChoice = null;

        // Si l'utilisateur est connecté, on récupère son pari spécifique
        if (account) {
          try {
            const bet = await predictionMarket.methods.userBets(i, account).call();
            userStake = bet.amount.toString();
            userStakeChoice = bet.choice;
          } catch (e) {
            console.error(`Erreur chargement pari marché ${i}:`, e);
          }
        }

        const endTime = Number(m.endTime);
        const stage = parseInt(m.stage); // 0: Active, 1: Pending, 2: Resolved
        const isResolved = stage === 2;
        const isExpired = now >= endTime;

        // LOGIQUE DE FILTRAGE
        let shouldShow = false;

        if (status === "active") {
          // Un marché est actif s'il n'est ni expiré ni résolu
          shouldShow = !isExpired && stage !== 2;
        } else if (status === "pending") {
          // Un marché est en attente si le temps est écoulé mais que l'oracle n'a pas signé
          shouldShow = isExpired && stage !== 2;
        } else if (status === "resolved") {
          // Le marché est résolu (victoire confirmée par signature)
          shouldShow = isResolved;
        } else if (!status) {
          // Vue globale (tous les marchés)
          shouldShow = true;
        }

        // Filtre supplémentaire pour la vue "Mes Paris"
        if (view === "PERSONAL" && (userStake === "0" || !userStake)) {
          shouldShow = false;
        }

        if (shouldShow) {
          loadedMarkets.push({ 
            ...m, 
            id: i, // ID crucial pour la signature et le claim
            userStake, 
            userStakeChoice: userStake !== "0" ? parseInt(userStakeChoice) : null 
          });
        }
      }
      
      // On inverse l'ordre pour voir les plus récents en premier
      setMarkets(loadedMarkets.reverse());
    } catch (error) {
      console.error("Erreur Panel lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  }, [status, view, account]);

  useEffect(() => {
    setLoading(true);
    loadBlockchainData();
    
    // Rafraîchissement automatique toutes les 20 secondes
    const interval = setInterval(loadBlockchainData, 20000); 
    return () => clearInterval(interval);
  }, [loadBlockchainData, account]);

  if (loading) {
    return (
      <div className="loader" style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
        Chargement des marchés...
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h2 className="panel-title" style={{ color: 'white', marginBottom: '20px' }}>
        {view === "PERSONAL" ? "Mes Paris" : "Marchés"} 
        <span style={{ fontSize: '0.6em', marginLeft: '10px', opacity: 0.6 }}>
          {status ? `(${status.toUpperCase()})` : ""}
        </span>
      </h2>
      
      {markets.length === 0 ? (
        <div className="empty-state" style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666', 
          background: '#1e1e1e', 
          borderRadius: '12px',
          border: '1px dashed #333'
        }}>
          Aucun marché trouvé dans cette catégorie.
        </div>
      ) : (
        <div className="panel-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {markets.map((m) => (
            <MarketCard 
              key={m.id} 
              market={m} 
              account={account} 
              refresh={loadBlockchainData} 
            />
          ))}
        </div>
      )}
    </div>
  );
}