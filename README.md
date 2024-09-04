# ValidAR Protocol

ValidAR is an innovative protocol designed to create verifiable digital identities using biometric data and blockchain technology. The protocol consists of three main components: Client App, Renaper (a mock biometric verification service), and Backend.

## Protocol Flow

1. **Biometric Signature Creation**
   - User uploads a selfie to RENAPER (government API) through the Client App.
   - RENAPER processes the biometric data and creates a unique key pair for signatures.
   - Note: In this implementation, RENAPER is mocked as a service and would require actual registration in a real-world scenario.

2. **DID and NFT Creation**
   - The Client App initiates the mintDID() process with the Backend.
   - Backend mints and grants a Soul-bound NFT (non-transferable) to the user.
   - This NFT serves as the user's Decentralized Identifier (DID) on the blockchain.

3. **Verifiable Signature Capability**
   - Upon successful DID creation, the user becomes a Certified Signer. (ethr-did)
   - The user can now provide verifiable signatures for various purposes.


![ValidAR Protocol Diagram](https://i.imgur.com/CI6JRnV.png)  

## Deployment
https://snowtrace.io/token/0x14aF69C94067c72F7B7ccc74E81a6c0FdD7b20Ad

## Key Features

- **Biometric-based Key Pair**: Utilizes facial recognition for creating unique cryptographic identities.
- **Soul-bound NFT**: Non-transferable NFT that acts as a blockchain-based digital identity.
- **Verifiable Signatures**: Enables users to create cryptographically verifiable signatures.

## Security and Privacy

- The protocol ensures that biometric data is processed securely and is not stored directly on the blockchain.
- The use of Soul-bound NFTs prevents identity theft or unauthorized transfers.

## Use Cases

- Digital document signing
- Identity verification for online services
- Secure voting systems
- Anti-fraud measures in financial transactions
---

ValidAR aims to bridge the gap between physical and digital identities, providing a secure and verifiable way for users to prove their identity and sign documents in the digital world.
## Setup

1. Install the necessary dependencies`.
```sh
pnpm i 
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file.
```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local
```

## Building locally

In your project directory, run `pnpm dev`. You can now visit http://localhost:3000 to see our dapp!