import { useState, useEffect } from 'react';
import { queryAttestations } from '../api/get-attestation';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useAttestations = (walletAddress: string | undefined) => {
  const [attestationData, setAttestationData] = useState<{ success: boolean; attestations: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAttestations(retries = 0) {
      if (!walletAddress) return;
      setIsLoading(true);
      try {
        const data = await queryAttestations(walletAddress);
        if (data.success && data.attestations.length > 0) {
          setAttestationData(data.attestations[0]);
          setIsLoading(false);
        } else if (retries < MAX_RETRIES) {
          console.log(`Attempt ${retries + 1}: No attestations found, retrying...`);
          setTimeout(() => fetchAttestations(retries + 1), RETRY_DELAY);
        } else {
          console.log("No attestations found after multiple attempts");
          setAttestationData({ success: true, attestations: [] });
          setIsLoading(false);
        }
      } catch (attestationError) {
        console.error("Error fetching attestation:", attestationError);
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchAttestations(retries + 1), RETRY_DELAY);
        } else {
          console.error("Failed to fetch attestations after multiple attempts");
          setAttestationData(null);
          setIsLoading(false);
        }
      }
    }

    fetchAttestations();
  }, [walletAddress]);

  return { attestationData, isLoading };
};