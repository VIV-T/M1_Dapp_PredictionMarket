import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { initWeb3 } from "../../utils/web3";

export default function MarketCard({ market, refresh, account }) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  // État pour stocker la signature saisie
  const [oracleSignature, setOracleSignature] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const fromWeiSafe = (val) => {
    try { return Web3.utils.fromWei(val.toString(), "ether"); } catch { return "0"; }
  };

  const poolA = parseFloat(fromWeiSafe(market.poolA));
  const poolB = parseFloat(fromWeiSafe(market.poolB));
  const total = poolA + poolB;
  const percentA = total > 0 ? (poolA / total) * 100 : 50;

  const timeLeft = Number(market.endTime) - now;
  const isExpired = timeLeft <= 0;
  const isResolved = parseInt(market.stage) === 2;
  const winningOutcome = parseInt(market.winningOutcome);
  const userChoice = parseInt(market.userStakeChoice);
  const hasStaked = market.userStake && market.userStake !== "0";
  const isWinner = isResolved && hasStaked && userChoice === winningOutcome;

  const colorA = "#3b82f6"; 
  const colorB = "#ec4899"; 

  const handleBetAction = async (choice) => {
    if (!account) return alert("Veuillez connecter MetaMask.");
    try {
      const { predictionMarket, web3 } = await initWeb3();
      const amount = prompt("Montant à parier (ETH) :");
      if (!amount) return;
      await predictionMarket.methods.placeBet(market.id, choice).send({
        from: account,
        value: web3.utils.toWei(amount, "ether")
      });
      refresh();
    } catch (e) { console.error(e); }
  };

  // MODIFICATION : Accepte la signature en plus de l'outcome
  const handleResolve = async (outcome) => {
    if (!oracleSignature) return alert("Veuillez coller la signature de l'oracle.");
    try {
      const { predictionMarket } = await initWeb3();
      // On envoie l'ID, le résultat choisi et la signature
      await predictionMarket.methods
        .resolveMarket(market.id, outcome, oracleSignature)
        .send({ from: account });
      
      setOracleSignature(""); // Reset après succès
      refresh();
    } catch (e) { 
      console.error(e);
      alert("Erreur : La signature est probablement invalide ou vous n'êtes pas l'oracle.");
    }
  };

  const handleClaim = async () => {
    console.log("Tentative de claim pour le marché ID:", market.id); // Vérifiez que cet ID est le bon
    try {
      const { predictionMarket } = await initWeb3();
      await predictionMarket.methods.claimGain(market.id).send({ from: account });
      refresh();
    } catch (e) { alert("Erreur lors du claim"); }
  };

  return (
    <div className={`market-card ${isExpired && !isResolved ? "border-pending" : ""}`}>
  {/* Header de la Card : Statut et Timer */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
    <span style={{ color: isResolved ? '#4ade80' : isExpired ? '#f59e0b' : '#60a5fa' }}>
      {isResolved ? "● Terminé" : isExpired ? "● En attente Oracle" : "● En cours"}
    </span>
    {!isResolved && !isExpired && (
      <span className="timer-text" style={{ color: timeLeft < 300 ? '#ef4444' : '#ccc' }}>
        {formatTime(timeLeft)}
      </span>
    )}
  </div>

  <h3 className="market-card-title">{market.title}</h3>

  {/* AFFICHAGE DE LA MISE PERSONNELLE */}
  {hasStaked && (
    <div style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      padding: '10px', 
      borderRadius: '8px', 
      marginBottom: '15px',
      borderLeft: `4px solid ${userChoice === 0 ? colorA : colorB}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Votre mise</div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>
          {fromWeiSafe(market.userStake)} ETH
        </div>
      </div>
      <div style={{ 
        fontSize: '11px', 
        padding: '4px 8px', 
        borderRadius: '4px', 
        backgroundColor: userChoice === 0 ? `${colorA}33` : `${colorB}33`,
        color: userChoice === 0 ? colorA : colorB,
        fontWeight: 'bold'
      }}>
        {userChoice === 0 ? market.optionA : market.optionB}
      </div>
    </div>
  )}

  {/* BARRE DE POURCENTAGE ET PROGRESSION */}
  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
    <span style={{ color: colorA }}>{market.optionA}: {percentA.toFixed(1)}%</span>
    <span style={{ color: colorB }}>{(100 - percentA).toFixed(1)}%: {market.optionB}</span>
  </div>

  <div className="progress-container" style={{ height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
    <div className="progress-fill" style={{ width: `${percentA}%`, backgroundColor: colorA, transition: 'width 0.5s' }} />
    <div className="progress-fill" style={{ width: `${100 - percentA}%`, backgroundColor: colorB, transition: 'width 0.5s' }} />
  </div>

  <div style={{ marginTop: '24px' }}>
    {/* MODE : EN COURS (Boutons de Pari) */}
    {!isExpired && !isResolved && (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-bet" style={{ backgroundColor: colorA, flex: 1 }} onClick={() => handleBetAction(0)} disabled={hasStaked && userChoice !== 0}>
          Parier {market.optionA}
        </button>
        <button className="btn-bet" style={{ backgroundColor: colorB, flex: 1 }} onClick={() => handleBetAction(1)} disabled={hasStaked && userChoice !== 1}>
          Parier {market.optionB}
        </button>
      </div>
    )}

    {/* MODE : PENDING (Attente de l'Oracle) */}
    {isExpired && !isResolved && (
      <div style={{ 
        textAlign: 'center', 
        padding: '15px', 
        borderRadius: '8px', 
        background: 'rgba(245, 158, 11, 0.1)', 
        border: '1px dashed #f59e0b' 
      }}>
        <div style={{ fontSize: '18px', marginBottom: '5px' }}>⏳</div>
        <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>
          En attente de la résolution...
        </div>
        <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
          L'oracle valide actuellement le résultat final.
        </div>
      </div>
    )}

    {/* MODE : RÉSOLU (Vainqueur et Claim) */}
    {isResolved && (
      <div className="resolved-banner" style={{ borderColor: winningOutcome === 0 ? colorA : colorB, background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid' }}>
        <div style={{ color: '#ccc', fontSize: '12px', letterSpacing: '1px' }}>VAINQUEUR</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', margin: '5px 0' }}>
          {winningOutcome === 0 ? market.optionA : market.optionB}
        </div>
        
        {isWinner ? (
          <button className="btn-primary" style={{ marginTop: '10px', width: '100%', backgroundColor: '#fbbf24', color: 'black', fontWeight: 'bold' }} onClick={handleClaim}>
            💰 RÉCUPÉRER MES GAINS
          </button>
        ) : hasStaked ? (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>
            Dommage ! Vous aviez parié sur le mauvais résultat.
          </div>
        ) : null}
      </div>
    )}
  </div>
</div>
  );
}