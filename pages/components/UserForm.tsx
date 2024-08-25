import React, { useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Box, Typography, useMediaQuery, useTheme, Paper, Input } from '@mui/material';
import Header from './Header';

export interface UserFormValues {
  name: string;
  idNumber: string;
  signatureCid: string;
}

interface UserDataFormProps {
  onSubmit: (values: UserFormValues) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  idNumber: Yup.string().required('ID Number is required'),
  signatureCid: Yup.string().required('Signature is required'),
});

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const initialValues: UserFormValues = { name: '', idNumber: '', signatureCid: '' };
  const [isUploading, setIsUploading] = useState(false);

  const uploadSignatureToIPFS = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await fetch('/api/ipfs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: reader.result }),
          });
  
          const data = await response.json();
  
          if (data.success) {
            console.log('Signature uploaded to IPFS. CID:', data.cid);
            resolve(data.cid);
          } else {
            reject(new Error(data.error || 'Error uploading to IPFS'));
          }
        } catch (error) {
          console.error('Error calling IPFS upload endpoint:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const handleSubmit = async (
    values: UserFormValues,
    { setSubmitting }: FormikHelpers<UserFormValues>
  ) => {
    try {
      onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: isMobile ? 2 : 4,
          backgroundColor: theme.palette.background.default
        }}
      >

        <Paper 
          elevation={3} 
          sx={{ 
            // backgroundColor: '#a8d8ea',
            padding: isMobile ? 3 : 4, 
            width: '100%',  
            maxWidth: 400,
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Welcome !
          </Typography>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="name"
                  label="Full Name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="idNumber"
                  label="ID Number"
                  error={touched.idNumber && Boolean(errors.idNumber)}
                  helperText={touched.idNumber && errors.idNumber}
                  sx={{ mb: 3 }}
                />
                <Input
                  type="file"
                  inputProps={{ accept: 'image/jpeg' }}
                  onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      try {
                        console.log('>>>>>>')
                        const cid = await uploadSignatureToIPFS(file);
                        console.log(cid)
                        setFieldValue('signatureCid', cid);
                      } catch (error) {
                        console.error('Error uploading signature:', error);
                        // Handle error (e.g., show error message to user)
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  sx={{ mb: 2 }}
                />
                
                {errors.signatureCid && touched.signatureCid && (
                  <Typography color="error">{errors.signatureCid}</Typography>
                )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                    }}
                  >
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    
    </>
  );
};

export default UserDataForm;