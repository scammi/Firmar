import { createPublicClient, http, createWalletClient, parseAbi, Address, encodeFunctionData, encodeAbiParameters, encodePacked } from 'viem';
import { avalanche, polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CERTIFIED_SIGNER_SCHEMA_ID, CONTRACT_ADDRESS } from '../../globals';

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

const polygonWalletClient = createWalletClient({
  account,
  chain: polygon,
  transport: http()
})

// Lock mint Contract configuration
export const lockMintContractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: lockMintAbi
};

  
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
  const abi = parseAbi([
    'function attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes), string, bytes, bytes) external payable returns (bytes32)',
  ])
  
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))

  // Construct the attestation object
  const attestation: readonly [bigint, bigint, bigint, bigint, Address, bigint, number, boolean, readonly `0x${string}`[], `0x${string}`] = [
    BigInt(CERTIFIED_SIGNER_SCHEMA_ID),
    BigInt(0), // linkedAttestationId
    currentTimestamp,
    BigInt(0), // revokeTimestamp
    account.address,
    BigInt(0), // validUntil
    0, // dataLocation
    false, // revoked
    [encodePacked(['address'], [to])], // recipients
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
  ]

  // Encode the function call
  const data = encodeFunctionData({
    abi,
    functionName: 'attest',
    args: [
      attestation,
      to, // indexingKey
      '0x', // delegateSignature (empty in this case)
      '0x'  // extraData (empty in this case)
    ],
  })

  // Get the current gas price
  const gasPrice = await polygonPublicClient.getGasPrice()

  // Construct the transaction object
  const transaction = {
    to: '0xe2C15B97F628B7Ad279D6b002cEDd414390b6D63' as Address, // Polygon SP contract
    data,
    gasPrice,
    value: BigInt(0)
  }

  const hash = await polygonWalletClient.sendTransaction(transaction)
  console.log('Transaction sent:', hash)

  return { attestationId: 1, txHash: hash}
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
