import { createPublicClient, http, createWalletClient, parseAbi, Address } from 'viem';
import { avalanche } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_ADDRESS = '0xA513C416f2d4774a77E2503DAca8a75F1c5A7B10';

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
  throw new Error('Missing environment variables. Please check your .env file.');
}

// ABI for lockMint function
export const lockMintAbi = parseAbi([
  'function lockMint(address to, string memory uri) public returns (uint256)'
]);

// Create Viem public client
export const publicClient = createPublicClient({
  chain: avalanche,
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
      const { request, result } = await publicClient.simulateContract({
        ...contractConfig,
        functionName: 'lockMint',
        args: [to, uri],
        account: account,
      })
  
      // Write the contract
      const hash = await walletClient.writeContract(request);
  
      console.log('Transaction sent:', hash);
  
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
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
  
  