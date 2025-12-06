import React from 'react';
import { Container, Typography } from '@mui/material'; // Usando MUI como planejado

const Login = () => {
  // RF02: Login será desenvolvido aqui
  return (
    <Container component="main" maxWidth="xs">
      <Typography component="h1" variant="h5" sx={{ mt: 8 }}>
        🔒 Login EcoWatt Monitor
      </Typography>
      {/* Formulário de login virá aqui */}
    </Container>
  );
};

export default Login;