import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import UserDataForm, { UserFormValues } from "./components/UserForm";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Backdrop, Box, Button, CircularProgress, Grid, Paper, Step, StepLabel, Stepper, Typography, useMediaQuery, useTheme } from "@mui/material";
import Head from 'next/head';

const callRenaperAuth = async (formData: UserFormValues, userAddress: string) => {
  try {
    const accessToken = await getAccessToken(); // You need to implement this function
    const response = await fetch('/api/renaperAuth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        nombre: formData.name,
        dni: formData.idNumber,
        address: userAddress
      }),
    });

    const result = await response.json();

    console.log(result);

    return result;
  } catch (error) {
    console.error('Error calling renaperAuth:', error);
  }
};

export default function DashboardPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeStep, setValidStep] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormValues>();
  const [cameraReady, setCameraReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);


  useEffect(() => {
    if (activeStep === 1 && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setCameraReady(true);
            };
          }
        })
        .catch(err => console.error("Error accessing webcam:", err));
    }
  }, [activeStep])


  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      // console.log(imageDataUrl)
      setImageSrc(imageDataUrl);
    }
  };

  const steps = [
    'Datos',
    'Renaper',
  ];

  const handleUserDataSubmit = (data: UserFormValues) => {
    console.log('User data:', data);
    setFormData(data);
    setValidStep(1);
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      if (!formData || !user?.wallet) return;

      const result = await callRenaperAuth(formData, user.wallet.address);
      
      if (result.success) {
        setAuthStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setAuthStatus('error');
      }
  } catch (error) {
      setAuthStatus('error');
      console.error('Authentication failed:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); 
    }
  };

  if (!ready || !authenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Grid container justifyContent="center" style={{ minHeight: '100vh' }}>
      <Head>
        <title>Authentication - Soul DID</title>
      </Head>

      <Grid item xs={12} sm={10} md={8} lg={6}>
        <Box sx={{ width: '100%', padding: isMobile ? 2 : 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={4}>
            {activeStep === 0 && (
              <UserDataForm onSubmit={handleUserDataSubmit} />
            )}
            
            {activeStep === 1 && (
              <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h5" gutterBottom>
                  Webcam Capture
                </Typography>
                {!cameraReady && (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress />
                  </Box>
                )}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '75%', // 4:3 aspect ratio
                    overflow: 'hidden',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: cameraReady ? 'block' : 'none',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={captureImage}
                  disabled={!cameraReady}
                  fullWidth
                >
                  Take Picture
                </Button>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Paper> 
            )}

            {imageSrc && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Captured Image
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    paddingTop: '75%', // 4:3 aspect ratio
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <img 
                    src={imageSrc} 
                    alt="Captured" 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleAuthenticate}
                  disabled={isLoading || authStatus !== 'idle'}
                  fullWidth
                >
                  {isLoading ? 'Authenticating...' : 'Authenticate'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Grid>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        {authStatus === 'success' && (
          <CheckCircleOutlineIcon color="success" style={{ fontSize: 60 }} />
        )}
        {authStatus === 'error' && (
          <ErrorOutlineIcon color="error" style={{ fontSize: 60 }} />
        )}
        {authStatus === 'idle' && (
          <CircularProgress color="inherit" />
        )}
      </Backdrop>
    </Grid>
  );
}
