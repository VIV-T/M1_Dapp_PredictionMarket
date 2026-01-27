// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UMAOptimisticOracleMock {
    mapping(bytes32 => uint256) public prices;
    mapping(bytes32 => uint256) public timestamps;

    function proposePrice(
        address,
        bytes32 identifier,
        uint256 timestamp,
        bytes calldata ancillaryData
    ) external {
        uint8 outcome = abi.decode(ancillaryData, (uint8));
        prices[identifier] = outcome;
        timestamps[identifier] = timestamp;
    }

    function disputePrice(
        address,
        bytes32,
        uint256,
        bytes calldata
    ) external {}

    function getPrice(
        address,
        bytes32 identifier,
        uint256
    ) external view returns (bool, uint256, uint256) {
        return (true, prices[identifier], timestamps[identifier]);
    }
}
