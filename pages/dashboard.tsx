import React, { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { Box, Typography, CircularProgress, Grid, CardContent, Card, useMediaQuery, useTheme, Collapse, Link, Button, Table, TableBody, TableCell, TableRow, IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ExploreIcon from '@mui/icons-material/Explore';
import DescriptionIcon from '@mui/icons-material/Description';

import { formatSignatureCid } from './api/utils/ui.utils';
import Header from './components/Header';
import useNFTStatus from './components/useNFTStatus';
import { useAttestations } from './components/useAttestation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LaunchIcon from '@mui/icons-material/Launch';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [expanded, setExpanded] = useState(false);
  const [attesationHashURL, setAttesationHashURL] = useState('');
  const [attesationIdURL, setAttesationIdURL] = useState('');
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { metadata, isLoading: isNFTLoading, error, userScan: nftUserScan } = useNFTStatus();
  const { attestationData, isLoading: isAttestationLoading } = useAttestations(user?.wallet?.address);

  console.log("attestationData" , attestationData, isAttestationLoading)

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (isAttestationLoading) {
      setAttesationHashURL(`https://polygonscan.com/tx/${attestationData?.transactionHash}`)  
      setAttesationIdURL(`https://scan.sign.global/attestation/${attestationData?.id}`)  
    }
  }, [isAttestationLoading]);
 
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);


  const handleNavigateToSign = () => {
    if (metadata && !isNFTLoading) {
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
        {isNFTLoading ? (
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
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={open ? 'long-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <Typography>On chain action </Typography> <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="long-menu"
                    MenuListProps={{
                      'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleClose}>
                      <Typography component="a" href={attesationHashURL} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        Attestation hash <LaunchIcon fontSize="small" sx={{ ml: 1 }} />
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <Typography component="a" href={attesationIdURL} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        Attestation ID <LaunchIcon fontSize="small" sx={{ ml: 1 }} />
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <Typography component="a" href={nftUserScan} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        NFT On-chain <LaunchIcon fontSize="small" sx={{ ml: 1 }} />
                      </Typography>
                    </MenuItem>
                  </Menu>
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
