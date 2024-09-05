import { createPublicClient, http, createWalletClient, parseAbi, Address } from 'viem';
import { avalanche, polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CERTIFIED_SIGNER_SCHEMA_ID, CONTRACT_ADDRESS } from '../../globals';
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
} from '@ethsign/sp-sdk';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as Address || '' ;

if (!PRIVATE_KEY) {
  throw new Error('Missing environment variables. Please check your .env file.');
}

// ABI for lockMint function
export const lockMintAbi = parseAbi([
  'function lockMint(address to, string memory uri) public returns (uint256)'
]);

// Create Viem public client
export const avaxPublicClient = createPublicClient({
  chain: avalanche,
  transport: http()
});

export const polygonPublicClient = createPublicClient({
  chain: polygon,
  transport: http()
});

// Create account from private key
export const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

// Create wallet client
export const walletClient = createWalletClient({
  account,
  chain: avalanche,
  transport: http()
});

// Contract configuration
export const contractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: lockMintAbi
};

// Function to call lockMint
export async function callLockMint(to: Address, uri: string) {
    try {
      // Simulate the transaction
      const { request, result } = await avaxPublicClient.simulateContract({
        ...contractConfig,
        functionName: 'lockMint',
        args: [to, uri],
        account: account,
      })
      debugger;
      // Write the contract
      const hash = await walletClient.writeContract(request);
  
      console.log('Transaction sent:', hash);
  
      // Wait for the transaction to be mined
      const receipt = await avaxPublicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction mined:', receipt.transactionHash);
  
      // Check if the transaction was successful
      if (receipt.status === 'success') {
        console.log('Transaction successful');
        
        if (result > 0) {
          return { hash: receipt.transactionHash, result };
        } else {
          console.warn('Unable to extract tokenId from transaction logs');
          return { hash: receipt.transactionHash, tokenId: null };
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error in callLockMint:', error);
      throw error;
    }
}
  
export async function createCertifiedSignerAttestation(
  to: Address,
  certificate: { 
    first_name: string,
    last_name: string,
    national_document_identifier: string,
    signature_cid: string,
    did: string,
  }
) {
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.polygon,
    account: 
  });

  const attestationInfo = await client.createAttestation({
    schemaId: CERTIFIED_SIGNER_SCHEMA_ID,
    data: certificate,
    indexingValue: to,
    recipients: [to]
  });

  return attestationInfo;
}