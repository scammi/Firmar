import React, { useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { Box, Button, TextField, Typography, CircularProgress, Container, Paper } from '@mui/material';
import { CloudUpload, Edit } from '@mui/icons-material';
import { DocusealForm } from '@docuseal/react';

export default function FileUploadAndSign() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const { user, signMessage } = usePrivy();

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile.name);
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        // Implement your file upload logic here
        // For example, you could use FormData to send the file to your server

        console.log('Uploading file:', file);

        // Simulating upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsUploading(false);
    };

    const handleSign = async () => {
        if (!file || !user) return;
        setIsSigning(true);
        try {
            const signature = await signMessage(file.name);
            console.log('File signed:', file.name);
            console.log('Signature:', signature);
            // Here you would typically send the signature to your server
        } catch (error) {
            console.error('Signing failed:', error);
        }
        setIsSigning(false);
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Upload and Sign File
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <input
                        accept="*/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            fullWidth
                        >
                            Choose File
                        </Button>
                    </label>
                </Box>
                {fileName && (
                    <TextField
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={fileName}
                        InputProps={{ readOnly: true }}
                    />
                )}
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        fullWidth
                    >
                        {isUploading ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSign}
                        disabled={!file || !user || isSigning}
                        startIcon={<Edit />}
                        fullWidth
                    >
                        {isSigning ? <CircularProgress size={24} /> : 'Sign'}
                    </Button>
                </Box>
                <DocusealForm
                    src="https://docuseal.co/d/LEVGR9rhZYf86M"
                    email="signer@example.com"
                    signature="https://signaturely.com/wp-content/uploads/2020/04/oprah-winfrey-signature-signaturely.png"
                />
            </Paper>
        </Container>
    );
}