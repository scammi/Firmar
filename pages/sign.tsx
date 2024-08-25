import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, CircularProgress, Tooltip } from '@mui/material';
import { DocusealForm } from '@docuseal/react';
import Head from 'next/head';
import { formatSignatureCid } from './api/ui.utils';
import Header from './components/Header';

export default function Sign() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: '', dni: '', signatureCid: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [signatureHash, setSignatureHash] = useState('');

  useEffect(() => {
    if (router.isReady) {
      const { name, dni, signatureCid } = router.query;
      setUserData({
        name: String(name || ''),
        dni: String(dni || ''),
        signatureCid: String(signatureCid || '')
      });
    }
  }, [router.isReady, router.query]);

  const handleDocusealComplete = async (detail) => {
    setIsLoading(true);
    
    try {
      const signatureFieldValue = detail.values.find(field => field.field === "Signature Field 1")?.value;
      if (signatureFieldValue) {
        const response = await fetch(signatureFieldValue);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setSignatureHash('0x' + hashHex);
      }
    } catch (error) {
      console.error('Error processing signature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateHash = (hash, start = 6, end = -2) => {
    return hash ? `${hash.slice(0, start)}...${hash.slice(end)}` : '';
  };

  return (
    <>
      <Header/>
      <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
        <Head>
          <title>Sign Document - Soul DID</title>
        </Head>
        <Typography variant="h4" gutterBottom align="center">
          Sign Document
        </Typography>
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
          <DocusealForm
            src="https://docuseal.co/d/HyANjgot2ow9dn"
            email="signer@example.com"
            signature={'https://chargedparticles.infura-ipfs.io/ipfs/' + userData.signatureCid}
            onComplete={handleDocusealComplete}
          />
        </Paper>
        {signatureHash && (
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>Document Signature Hash</Typography>
            <Tooltip title={signatureHash} placement="top" arrow>
              <Typography 
                variant='h5'
                sx={{ 
                  wordBreak: 'break-word', 
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {truncateHash(signatureHash, 10, 4)}
              </Typography>
            </Tooltip>
          </Paper>
        )}
      </Box>
    </>
  );
}