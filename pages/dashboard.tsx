import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import UserDataForm, { UserFormValues } from "./components/UserForm";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Backdrop, Box, Button, CircularProgress, Grid, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
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
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing webcam:", err));
    }
  }, [activeStep]);


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

  return (
    <Grid container>
      <Head>
        <title>Simple</title>
      </Head>

      <Grid  justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <Grid item xs={12} md={8} lg={6}>
          <Box sx={{ width: '100%' }} padding={'20px'}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {activeStep == 0 && (
            <UserDataForm onSubmit={handleUserDataSubmit} />
          )}
          {activeStep == 1 && (
            <Paper elevation={3} style={{ padding: '20px' }}>
              <Typography variant="h5" gutterBottom>
                Webcam Capture
              </Typography>
              <video
                ref={videoRef}
                autoPlay
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={captureImage}
                // startIcon={<CameraAltIcon />}
              >
                Take Picture
              </Button>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Paper> 
            )
          }
          <Box style={{ padding: '20px' }}>
            {imageSrc && (
              <div style={{ marginTop: '20px' }}>
                <Typography variant="h6" gutterBottom>
                  Captured Image
                </Typography>
                <img 
                  src={imageSrc} 
                  alt="Captured" 
                  style={{
                    width: '100%',
                    maxWidth: '640px',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />
                <Box mt={2} display="flex" alignItems="center">
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleAuthenticate}
                      disabled={isLoading || authStatus !== 'idle'}
                      style={{ marginRight: '10px' }}
                    >
                      {isLoading ? 'Authenticating...' : 'Authenticate'}
                    </Button>
                    {/* {authStatus === 'success' && (
                      <CheckCircleOutlineIcon color="success" fontSize="large" />
                    )}
                    {authStatus === 'error' && (
                      <ErrorOutlineIcon color="error" fontSize="large" />
                    )} */}
                  </Box>
              </div>
            )}
          </Box>
        </Grid>
      </Grid>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        {authStatus === 'success' && (
          <CheckCircleOutlineIcon color="success" fontSize="large" />
        )}
        {authStatus === 'error' && (
          <ErrorOutlineIcon color="error" fontSize="large" />
        )}
        {(authStatus !== 'success' &&  authStatus !== 'error') && (
          <CircularProgress color="inherit" />
        )}
      </Backdrop>
    </Grid>
  );
}
