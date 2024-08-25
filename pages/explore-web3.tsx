import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Head from 'next/head';
import { Box, Typography, Paper, Grid, Button, CircularProgress, TextField, Slider } from '@mui/material';
import Header from './components/Header';

export default function ExploreWeb3() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [loanAmount, setLoanAmount] = useState(0);
  const [sendAmount, setSendAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  React.useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
        <Head>
          <title>Explore Web3 - Soul DID</title>
        </Head>
        <Typography variant="h4" gutterBottom align="center">
          Explore Web3
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h6" gutterBottom>Prestado (Loan)</Typography>
              <Typography>Your green score: 75/100</Typography>
              <Typography>Maximum loan amount: 1000 USDC</Typography>
              <Typography>Interest rate: 5% APR</Typography>
              <Slider
                value={loanAmount}
                onChange={(_, newValue) => setLoanAmount(newValue as number)}
                max={1000}
                valueLabelDisplay="auto"
                sx={{ mt: 2 }}
              />
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Borrow {loanAmount} USDC
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Receive/Send</Typography>
              <TextField
                fullWidth
                label="Amount to send"
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" fullWidth>
                Send
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Buy</Typography>
              <TextField
                fullWidth
                label="Amount to buy"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="secondary" fullWidth>
                Buy
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}