import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { Box, Button, Grid, Paper, Typography } from "@mui/material";

const callRenaperAuth = async () => {
  try {
    const accessToken = await getAccessToken(); // You need to implement this function
    const response = await fetch('/api/renaperAuth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error('Error calling renaperAuth:', error);
  }
};

export default function DashboardPage() {
  const [activeStep, setValidStep] = useState(1);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

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
  }, []);


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

  const ActiveTab = () => {
    switch (activeStep) {
      case 0: return <>Form</>;
      case 1: return <VideoFeed/>;
      default: return <></>;
    }
  }

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
                <Box paddingTop={'20px'}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={callRenaperAuth}
                    // startIcon={<SendIcon />}
                    disabled={!imageSrc}
                  >
                  Authenticate
                  </Button>
                </Box>
              </div>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
