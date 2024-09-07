import { useState, useEffect } from 'react';
import { queryAttestations } from './your-attestation-query-function'; // Import your actual query function

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useAttestations = (walletAddress: string | undefined) => {
  const [attestationData, setAttestationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttestations(retries = 0) {
      if (!walletAddress) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await queryAttestations(walletAddress);
        setAttestationData(data);
      } catch (attestationError) {
        console.error("Error fetching attestation:", attestationError);
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchAttestations(retries + 1), RETRY_DELAY);
        } else {
          setError("Failed to fetch attestations after multiple attempts");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttestations();
  }, [walletAddress]);

  return { attestationData, isLoading, error };
};