import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
// import CameraAltIcon from '@mui/icons-material/CameraAlt';

import { Button, Grid, Paper, Typography } from "@mui/material";

async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

const callRenaperAuth = async () => {
  // if (!imageSrc) {
  //   alert('Please capture an image first');
  //   return;
  // }

  try {
    const accessToken = await getAccessToken(); // You need to implement this function
    const response = await fetch('/api/renaperAuth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      // body: JSON.stringify({ image: imageSrc }),
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error('Error calling renaperAuth:', error);
  }
};


export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
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
      setImageSrc(imageDataUrl);
    }
  };

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Grid item xs={12} md={8} lg={6}>
        <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
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
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={callRenaperAuth}
              // startIcon={<SendIcon />}
              disabled={!imageSrc}
            >
            Authenticate
          </Button>

            </div>
          )}
      </Grid>
    </Grid>


      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
              <button
                onClick={() => verifyToken().then(setVerifyResult)}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Verify token on server
              </button>

              {Boolean(verifyResult) && (
                <details className="w-full">
                  <summary className="mt-6 font-bold uppercase text-sm text-gray-600">
                    Server verify result
                  </summary>
                  <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </details>
              )}

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
