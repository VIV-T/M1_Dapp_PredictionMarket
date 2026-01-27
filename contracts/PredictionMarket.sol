// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    enum Stage { Active, Pending, Resolved }

    struct Market {
        uint256 id;
        string title;
        string optionA;
        string optionB;
        uint256 endTime;
        uint256 poolA;
        uint256 poolB;
        Stage stage;
        uint8 winningOutcome;
        address creator;
    }

    struct Bet {
        uint256 amount;
        uint8 choice; // 0 ou 1
        bool exists;
    }

    Market[] public markets;
    mapping(uint256 => mapping(address => Bet)) public userBets;
    uint256 public nextMarketId;

    function createMarket(
        string memory _title, 
        string memory _opA, 
        string memory _opB, 
        uint256 _durationSeconds
    ) external {
        require(_durationSeconds > 0, "Duree invalide");
        
        markets.push(Market({
            id: nextMarketId,
            title: _title,
            optionA: _opA,
            optionB: _opB,
            endTime: block.timestamp + _durationSeconds,
            poolA: 0,
            poolB: 0,
            stage: Stage.Active,
            winningOutcome: 0,
            creator: msg.sender
        }));
        nextMarketId++;
    }

    function placeBet(uint256 _marketId, uint8 _choice) external payable {
        Market storage m = markets[_marketId];
        require(block.timestamp < m.endTime, "Pari termine");
        require(msg.value > 0, "Montant insuffisant");
        require(_choice == 0 || _choice == 1, "Choix invalide");

        Bet storage userBet = userBets[_marketId][msg.sender];

        // LOGIQUE DE RESTRICTION
        if (userBet.amount > 0) {
            // Si l'utilisateur a deja mise, il DOIT choisir la meme option
            require(userBet.choice == _choice, "Vous avez deja parie sur l'autre option");
        } else {
            // Premier pari : on enregistre son choix
            userBet.choice = _choice;
        }

        userBet.amount += msg.value;
        
        if (_choice == 0) m.poolA += msg.value;
        else m.poolB += msg.value;
    }

    function resolveMarket(uint256 _marketId, uint8 _outcome) external {
        Market storage m = markets[_marketId];
        require(block.timestamp >= m.endTime, "Evenement non termine");
        m.winningOutcome = _outcome;
        m.stage = Stage.Resolved;
    }

    function getMarkets() external view returns (Market[] memory) {
        return markets;
    }

    // --- NOUVELLE FONCTION DE RETRAIT ---
    function claimGain(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        
        require(m.stage == Stage.Resolved, "Marche non resolu");
        
        Bet storage userBet = userBets[_marketId][msg.sender];
        require(userBet.amount > 0, "Aucun pari trouve");
        require(userBet.choice == m.winningOutcome, "Vous n'avez pas gagne");

        uint256 winningPool = (m.winningOutcome == 0) ? m.poolA : m.poolB;
        require(winningPool > 0, "Aucune mise sur le gagnant");
        uint256 losingPool = (m.winningOutcome == 0) ? m.poolB : m.poolA;

        // Formule Polymarket : Mise + Part proportionnelle du pool perdant
        // Gain = MiseUser + (MiseUser / TotalMisesGagnantes) * TotalMisesPerdantes
        uint256 reward = userBet.amount + (userBet.amount * losingPool / winningPool);

        userBet.amount = 0; // Sécurité anti-réentrance : on vide avant d'envoyer
        
        payable(msg.sender).transfer(reward);
    }
}