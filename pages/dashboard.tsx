import React, { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { Box, Typography, CircularProgress, Paper, Grid, CardContent, Card, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { createPublicClient, http, getContract } from 'viem';
import { avalanche } from 'viem/chains';
import ExploreIcon from '@mui/icons-material/Explore';
import DescriptionIcon from '@mui/icons-material/Description';


// Import your contract ABI
import SoulABI from '../SoulBoundNFT/artifacts/contracts/Soul.sol/Soul.json';
const CONTRACT_ADDRESS = '0x14aF69C94067c72F7B7ccc74E81a6c0FdD7b20Ad';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function fetchMetadata() {
      if (!user?.wallet?.address) return;

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

        const tokenURI = await publicClient.readContract({
          ...contract,
          functionName: 'getMetadataByAddress',
          args: [user.wallet.address as `0x${string}`]
        });

        if (tokenURI) {
          const data = await JSON.parse(tokenURI);
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

    if (user?.wallet?.address) {
      fetchMetadata();
    }
  }, [user?.wallet?.address]);

  if (!ready || !authenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: isMobile ? 2 : 4 }}>
      <Head>
        <title>Dashboard - Soul DID</title>
      </Head>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <>
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Typography variant="h6" gutterBottom>Your Soul Token Metadata</Typography>
            <Typography><strong>Name:</strong> {metadata?.nombre || 'N/A'}</Typography>
            {/* <Typography><strong>Last Name:</strong> {metadata?.apellido || 'N/A'}</Typography> */}
            <Typography><strong>DNI:</strong> {metadata?.dni || 'N/A'}</Typography>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ExploreIcon color="primary" sx={{ fontSize: 40, marginRight: 2 }} />
                    <Typography variant="h6">Explore Web3</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <DescriptionIcon color="primary" sx={{ fontSize: 40, marginRight: 2 }} />
                    <Typography variant="h6">Sign Documents</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

}