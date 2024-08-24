import { useState, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, getContract } from 'viem';
import { avalanche } from 'viem/chains';
import SoulABI from '../../SoulBoundNFT/artifacts/contracts/Soul.sol/Soul.json';

const CONTRACT_ADDRESS = '0x14aF69C94067c72F7B7ccc74E81a6c0FdD7b20Ad';

export function useNFTStatus() {
  const [hasNFT, setHasNFT] = useState<boolean | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = usePrivy();

  useEffect(() => {
    async function checkNFTAndFetchMetadata() {
      if (!user?.wallet?.address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const publicClient = createPublicClient({
          chain: avalanche,
          transport: http()
        });

        const contract = getContract({
          address: CONTRACT_ADDRESS,
          abi: SoulABI.abi,
          client: publicClient
        });

        let tokenURI;
        try {
          tokenURI = await publicClient.readContract({
            ...contract,
            functionName: 'getMetadataByAddress',
            args: [user.wallet.address as `0x${string}`]
          });
          setHasNFT(true);
        } catch (error) {
          console.log("User doesn't have an NFT");
          setHasNFT(false);
          setIsLoading(false);
          return;
        }

        if (tokenURI) {
          const data = JSON.parse(tokenURI);
          setMetadata(data);
        } else {
          setError("No metadata found for this address");
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setError("Failed to fetch metadata");
      } finally {
        setIsLoading(false);
      }
    }

    checkNFTAndFetchMetadata();
  }, [user?.wallet?.address]);

  return { hasNFT, metadata, isLoading, error };
}