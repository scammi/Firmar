import React from 'react';
import { useLogin } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  ThemeProvider, 
  createTheme,
  CssBaseline
} from '@mui/material';
import Portal from "../components/graphics/portal";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ee', // Violet color similar to the original
    },
    background: {
      default: '#e8f0fe', // Light blue similar to bg-privy-light-blue
    },
  },
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    console.log({ claims });
    return {
      props: {},
      redirect: { destination: "/auth", permanent: false },
    };
  } catch (error) {
    return { props: {} };
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/auth"),
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Login · Privy</title>
      </Head>
      <Box 
        component="main" 
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Container 
          maxWidth="sm" 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            py: 6,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Portal style={{ maxWidth: "100%", height: "auto" }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Firmar
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={login}
            sx={{ 
              mt: 4,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            Log in
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
}