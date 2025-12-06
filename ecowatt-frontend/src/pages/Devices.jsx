// ecowatt-frontend/src/pages/Devices.jsx
import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';

const crudOperations = [
  'CRIAR Disjuntor',
  'LER Disjuntor',
  'ATUALIZAR Disjuntor',
  'DELETAR Disjuntor',
];

const Devices = () => {
  // RF04: Funcionalidade de Gerenciar Dispositivos/Disjuntores (CRUD)
  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        🔌 Gerenciar Dispositivos/Disjuntores (CRUD)
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Ferramenta de Cadastro, Edição e Exclusão de pontos de medição no sistema. (RF04)
      </Typography>

      <Stack spacing={3} sx={{ mt: 5 }}>
        {crudOperations.map((operation) => (
          <Button
            key={operation}
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 2 }}
            onClick={() => console.log(`Ação: ${operation}`)} 
          >
            {operation}
          </Button>
        ))}
      </Stack>
      
    </Container>
  );
};

export default Devices;