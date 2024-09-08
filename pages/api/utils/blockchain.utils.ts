import { createPublicClient, http, createWalletClient, parseAbi, Address, encodeFunctionData, encodeAbiParameters, encodePacked } from 'viem';
import { avalanche, polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CERTIFIED_SIGNER_SCHEMA_ID, CONTRACT_ADDRESS } from '../../globals';
import { LIT_CONFIG } from './lit.utils';
import { ethers, Transaction } from 'ethers';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as Address || '' ;

if (!PRIVATE_KEY) {
  throw new Error('Missing environment variables. Please check your .env file.');
}

export const lockMintAbi = parseAbi([
  'function lockMint(address to, string memory uri) public returns (uint256)'
]);

export const avaxPublicClient = createPublicClient({
  chain: avalanche,
  transport: http()
});

export const polygonPublicClient = createPublicClient({
  chain: polygon,
  transport: http()
});

export const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

export const walletClient = createWalletClient({
  account,
  chain: avalanche,
  transport: http()
});

export const polygonWalletClient = createWalletClient({
  account,
  chain: polygon,
  transport: http()
})

// Lock mint Contract configuration
export const lockMintContractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: lockMintAbi
};

// We are using low level so we can provide the raw transaction as bytes to the lit protocol for signing.
// Related:
// pages/api/utils/blockchain.utils.test.ts
// pages/components/useAttestation.tsx
export async function createCertifiedSignerAttestation(
  to: Address,
  certificate: { 
    first_name: string,
    last_name: string,
    national_document_identifier: string,
    signature_cid: string,
    did: string,
  }
): Promise<{ transaction: any, toSign: Uint8Array }> {
  const abi = parseAbi([
    'function attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes), string, bytes, bytes) external payable returns (bytes32)',
  ]);
  
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const attestation: readonly [bigint, bigint, bigint, bigint, Address, bigint, number, boolean, readonly `0x${string}`[], `0x${string}`] = [
    BigInt(CERTIFIED_SIGNER_SCHEMA_ID),
    BigInt(0),
    currentTimestamp,
    BigInt(0),
    to,
    BigInt(0),
    0,
    false,
    [encodePacked(['address'], [to])],
    encodeAbiParameters(
      [
        { type: 'string' },
        { type: 'string' },
        { type: 'string' },
        { type: 'string' },
        { type: 'string' }
      ],
      [
        certificate.first_name,
        certificate.last_name,
        certificate.national_document_identifier,
        certificate.signature_cid,
        certificate.did
      ]
    )
  ];

  const data = encodeFunctionData({
    abi,
    functionName: 'attest',
    args: [
      attestation,
      to,
      '0x',
      '0x'
    ],
  });

  const gasPrice = await polygonPublicClient.getGasPrice();

  const transaction = {
    to: '0xe2C15B97F628B7Ad279D6b002cEDd414390b6D63' as Address,
    data,
    gasPrice,
    value: BigInt(0),
    nonce: await polygonPublicClient.getTransactionCount({ address: LIT_CONFIG.PKP.ethAddress as Address}),
    gasLimit: BigInt(300000),
    chainId: 137, // Polygon Mainnet
  };

  const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.serializeTransaction(transaction)));

  return { transaction, toSign };
}

export async function combineSignatureWithTransaction(
  transaction: Transaction,
  signature: string
): Promise<string> {
  const signedTx = ethers.utils.serializeTransaction(transaction, signature);
  return signedTx;
}

export async function broadcastToPolygon(signedTransaction: string): Promise<string> {
  const hash = await polygonPublicClient.sendRawTransaction({ serializedTransaction: signedTransaction as `0x${string}` });
  return hash;
}

// Function to call lockMint
export async function callLockMint(to: Address, uri: string) {
    try {
      // Simulate the transaction
      const { request, result } = await avaxPublicClient.simulateContract({
        ...lockMintContractConfig,
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
          return { hash: receipt.transactionHash, tokenId: result };
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


