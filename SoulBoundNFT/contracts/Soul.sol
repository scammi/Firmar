// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC5192.sol";

contract Soul is IERC5192, ERC721, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  error NotAuthorized();
  error BondedToken();
  error AlreadyOwnsSoul();

  mapping (uint256 => bool) public lockedTokens;
  mapping (address => uint256) public addressToTokenId;

  constructor() ERC721("Soul DID", "SBT") {}

   function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721, ERC721URIStorage)
    returns (bool)
  {
    return
      interfaceId == type(IERC5192).interfaceId ||
      interfaceId == type(ERC721URIStorage).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function safeMint(address to, string memory uri) public returns(uint256) {
    if (addressToTokenId[to] != 0) {
      revert AlreadyOwnsSoul();
    }

    _tokenIdCounter.increment();

    uint256 tokenId = _tokenIdCounter.current();

    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);

    addressToTokenId[to] = tokenId;

    return tokenId;
  }

  function lockMint(address to, string memory uri) public returns(uint256) {
    uint256 tokenId = safeMint(to, uri);
    lockToken(tokenId);
    emit Locked(tokenId);

    return tokenId;
  }

  function lockToken(uint256 tokenId) public {
    onlyTokenOwner(tokenId);   
    lockedTokens[tokenId] = true;
    emit Locked(tokenId);
  }

  function unlockToken(uint256 tokenId) private {
    lockedTokens[tokenId] = false;
    emit Unlocked(tokenId);
  }

  function locked(uint256 tokenId) 
    external 
    view 
    override(IERC5192) 
    returns (bool) 
  {
    return lockedTokens[tokenId];
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function getMetadataByAddress(address userAddress) public view returns (string memory) {
    uint256 tokenId = addressToTokenId[userAddress];
    require(tokenId != 0, "Address does not own a Soul token");
    return tokenURI(tokenId);
  }

  function burn(uint256 tokenId) public {
    onlyTokenOwner(tokenId); 
    address owner = ownerOf(tokenId);
    delete addressToTokenId[owner];

    _burn(tokenId);
  }


  function onlyTokenOwner(uint256 tokenId) view internal{
    if (ownerOf(tokenId) != msg.sender && msg.sender != owner()) {
     revert NotAuthorized();
    }
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) 
    internal
    virtual 
    override(ERC721)
  {
    if (lockedTokens[tokenId] == true) {
      revert BondedToken();
    }
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    unlockToken(tokenId);
    super._burn(tokenId);
  }
}
