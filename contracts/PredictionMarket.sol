// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PredictionMarket {
    using ECDSA for bytes32;

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
        uint8 choice;
        bool exists;
    }

    address public oracleAddress;
    Market[] public markets;
    mapping(uint256 => mapping(address => Bet)) public userBets;
    uint256 public nextMarketId;

    constructor(address _oracleAddress) {
        oracleAddress = _oracleAddress;
    }

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

        if (userBet.amount > 0) {
            require(userBet.choice == _choice, "Vous avez deja parie sur l'autre option");
        } else {
            userBet.choice = _choice;
            userBet.exists = true;
        }

        userBet.amount += msg.value;
        
        if (_choice == 0) m.poolA += msg.value;
        else m.poolB += msg.value;
    }

    function resolveMarket(uint256 _marketId, uint8 _outcome, bytes memory _signature) external {
        Market storage m = markets[_marketId];
        require(block.timestamp >= m.endTime, "Evenement non termine");
        require(m.stage != Stage.Resolved, "Marche deja resolu");

        bytes32 messageHash = keccak256(abi.encodePacked(address(this), _marketId, _outcome));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        address signer = ethSignedMessageHash.recover(_signature);
        require(signer == oracleAddress, "Signature invalide");

        m.winningOutcome = _outcome;
        m.stage = Stage.Resolved;
    }

    function claimGain(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(m.stage == Stage.Resolved, "Marche non resolu");
        
        Bet storage userBet = userBets[_marketId][msg.sender];
        require(userBet.amount > 0, "Aucun pari trouve");
        require(userBet.choice == m.winningOutcome, "Vous n'avez pas gagne");

        uint256 winningPool = (m.winningOutcome == 0) ? m.poolA : m.poolB;
        uint256 losingPool = (m.winningOutcome == 0) ? m.poolB : m.poolA;
        
        uint256 reward = userBet.amount + (userBet.amount * losingPool / winningPool);
        
        userBet.amount = 0; 
        payable(msg.sender).transfer(reward);
    }

    function getMarkets() external view returns (Market[] memory) {
        return markets;
    }
}