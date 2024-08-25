import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { DocusealForm } from '@docuseal/react'

import Head from 'next/head';
import { formatSignatureCid } from './api/ui.utils';
import Header from './components/Header';


export default function Sign() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: '', dni: '', signatureCid: '' });
  const [documentText, setDocumentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignDocument = async () => {
    setIsLoading(true);
    // Here you would implement the logic to sign the document
    // This could involve calling a smart contract or an API
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating an async operation
    setIsLoading(false);
    alert('Document signed successfully!');
  };
  console.log('https://chargedparticles.infura-ipfs.io/ipfs/' + userData.signatureCid)

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
          <Typography variant="h6" gutterBottom>Your Information</Typography>
          <Typography><strong>Name:</strong> {userData.name}</Typography>
          <Typography><strong>DNI:</strong> {userData.dni}</Typography>
          <Typography><strong>Signature CID:</strong> {formatSignatureCid(userData.signatureCid)}</Typography>
        </Paper>
        <Paper elevation={3} sx={{ padding: 3 }}>
        <DocusealForm
              src="https://docuseal.co/d/HyANjgot2ow9dn"
              email="signer@example.com"
              signature={'https://chargedparticles.infura-ipfs.io/ipfs/' + userData.signatureCid}
              onComplete={(detail) => {console.log(detail)}}
          />

        </Paper>
      </Box>
    </>

  );
}