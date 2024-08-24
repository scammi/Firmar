import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Box, Typography, useMediaQuery, useTheme, Paper } from '@mui/material';

export interface UserFormValues {
  name: string;
  idNumber: string;
}

interface UserDataFormProps {
  onSubmit: (values: UserFormValues) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  idNumber: Yup.string().required('ID Number is required'),
});

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const initialValues: UserFormValues = { name: '', idNumber: '' };

  const handleSubmit = (
    values: UserFormValues,
    { setSubmitting }: FormikHelpers<UserFormValues>
  ) => {
    onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: isMobile ? 2 : 4,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: isMobile ? 3 : 4, 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          User Information
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
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
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isSubmitting} 
                fullWidth
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  fontSize: '1rem',
                  textTransform: 'none'
                }}
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default UserDataForm;