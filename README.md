# Firmar Protocol

Firmar is an innovative digital signature solution that combines the power of LIT Protocol and Sign Protocol to create a secure, verifiable, and efficient signing process.

# Commit history
This repository has branched from a privy boilterplate template.

Here you will find my first commit that regard the ETH-Global 2024 submission. 
https://github.com/scammi/Firmar/commit/83bd94d47ac943bbe4311b333bb9c3339909ca58

## Protocol Flow

1. **Key Creation (Client App)**

The client app generates a key pair locally using Privy. This ensures the user has control over their private key from the start.


2. **Certificate Request and Signature**

Client sends a certificate request with biometric data to the Backend.
Backend forwards an attestation transaction to LIT Protocol.
LIT Protocol performs a quorum-based action to sign the transaction.
Signed transaction is returned to the Backend.


3. **Attestation Broadcast and Emission**

Backend broadcasts the attestation transaction to the Sign Protocol.
Sign Protocol emits the attestation.
The attestation is returned to the Client App.


## Key Components

- Client App: User interface for key management and signature requests.
- Backend: Manages communication between client, LIT Protocol, and Sign Protocol.
- LIT Protocol: Provides decentralized key management and signing capabilities. Acts as the certified athority, replaces HSM in current systems.
- Sign Protocol: Handles the final attestation and emission of signatures.



![ValidAR Protocol Diagram](https://i.imgur.com/oEIjVPf.png)  

## Security and Privacy

- Biometric data is processed securely and not stored on-chain.
- LIT Protocol ensures that no single entity has control over the user's signing capabilities.
- Sign Protocol provides an immutable record of attestations.

## Use Cases

- Legally binding digital document signing
- Identity verification for high-security online services
- orporate governance and voting systems
- Financial transaction authorization
---

Firmar aims to bridge the gap between physical and digital identities, providing a secure and verifiable way for users to prove their identity and sign documents in the digital world.

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
