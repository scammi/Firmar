import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Box, Typography } from '@mui/material';

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
  const initialValues: UserFormValues = { name: '', idNumber: '' };

  const handleSubmit = (
    values: UserFormValues,
    { setSubmitting }: FormikHelpers<UserFormValues>
  ) => {
    onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>User Information</Typography>
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
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="idNumber"
              label="ID Number"
              error={touched.idNumber && Boolean(errors.idNumber)}
              helperText={touched.idNumber && errors.idNumber}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting} 
              fullWidth
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default UserDataForm;