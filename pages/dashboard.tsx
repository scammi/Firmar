import React, { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { Box, Typography, CircularProgress, Grid, CardContent, Card, useMediaQuery, useTheme, Collapse, Link, Button, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
// import { createPublicClient, http, getContract } from 'viem';
// import { avalanche } from 'viem/chains';
import ExploreIcon from '@mui/icons-material/Explore';
import DescriptionIcon from '@mui/icons-material/Description';
// import { queryAttestations } from '../pages/api/get-attestation';

// Import your contract ABI
// import SoulABI from '../hardhat/artifacts/contracts/Soul.sol/Soul.json';
// import { CONTRACT_ADDRESS } from './globals';

import { formatSignatureCid } from './api/utils/ui.utils';
import Header from './components/Header';
import useNFTStatus from './components/useNFTStatus';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated,  } = usePrivy();
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { metadata, isLoading, error, userScan } = useNFTStatus();

  console.log({ metadata, isLoading, error, userScan })
  // try {
  //   const attestationData = await queryAttestations(user.wallet.address);
  //   console.log(attestationData);
  // } catch (attestationError) {
  //   console.error("Error fetching attestation:", attestationError);
  // }

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);


  const handleNavigateToSign = () => {
    if (metadata && !isLoading) {
      const queryParams = new URLSearchParams({
        name: metadata?.nombre || '',
        dni: metadata?.dni || '',
        signatureCid: metadata?.signatureCid || ''
      }).toString();
      router.push(`/sign?${queryParams}`);
    }
  };

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
    <>
      <Header />
      <Box sx={{ maxWidth: 800, margin: 'auto', padding: isMobile ? 2 : 4 }}>
        <Head>
          <title>Dashboard - Soul DID</title>
        </Head>
        {isLoading ? (
          <Box display="flex" justifyContent="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <>
            <Card elevation={3} sx={{ marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                  Your Soul Token Metadata
                </Typography>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#555' }}>Name:</TableCell>
                      <TableCell align="right">{metadata?.nombre || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#555' }}>DNI:</TableCell>
                      <TableCell align="right">{metadata?.dni || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#555' }}>Signature CID:</TableCell>
                      <TableCell align="right">{formatSignatureCid(metadata?.signatureCid)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Link href={userScan} color="secondary" sx={{ textDecoration: 'none' }}>
                    On chain actions 
                  </Link>
                  <Button
                    onClick={() => setExpanded(!expanded)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  >
                    View Signature
                  </Button>
                </Box>
                <Collapse in={expanded}>
                  <Box sx={{ mt: 2, maxWidth: '100%', height: 'auto' }}>
                    <img
                      src={'https://chargedparticles.infura-ipfs.io/ipfs/' + metadata?.signatureCid}
                      alt="Signature"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                    />
                  </Box>
                </Collapse>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" onClick={() => router.push('/explore-web3')}>
                      <ExploreIcon color="primary" sx={{ fontSize: 40, marginRight: 2 }} />
                      <Typography variant="h6">Explore Web3</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" onClick={handleNavigateToSign}>
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
    </>
  );
}