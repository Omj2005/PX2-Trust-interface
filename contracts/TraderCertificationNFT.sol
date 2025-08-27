// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TraderCertificationNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    enum CertificationLevel { None, Bronze, Silver, Gold }

    struct Certification {
        address trader;
        CertificationLevel level;
    }

    mapping(address => Certification) public certifications;
    mapping(uint256 => address) public tokenIdToTrader;

    event CertificationAwarded(address indexed trader, CertificationLevel level, uint256 tokenId);

    constructor() ERC721("TraderCertificationNFT", "TCNFT") {}

    function awardCertification(address trader, CertificationLevel level) public onlyOwner {
        require(level != CertificationLevel.None, "Cannot award 'None' level");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(trader, tokenId);

        certifications[trader] = Certification(trader, level);
        tokenIdToTrader[tokenId] = trader;

        emit CertificationAwarded(trader, level, tokenId);
    }

    function getCertificationLevel(address trader) public view returns (CertificationLevel) {
        return certifications[trader].level;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.quantum-forge.com/nfts/";
    }
}
