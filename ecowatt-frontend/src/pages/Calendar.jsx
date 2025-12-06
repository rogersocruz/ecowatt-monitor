// ecowatt-frontend/src/pages/Calendar.jsx
import React from 'react';
import { Typography, Box, Alert } from '@mui/material';

const Calendar = () => {
  // RF03/RF05: Componente de Calendário e Perfil de Carga (Onde o CRUD NÃO DEVE ESTAR)
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📅 Calendário e Perfil de Carga
      </Typography>
      <Alert severity="info" sx={{ my: 2 }}>
        *Em Desenvolvimento:* Este componente irá mostrar a visualização detalhada do consumo diário/horário e comparações de perfis de carga ao longo do ciclo (RF03/RF05).
      </Alert>
      <Typography>
        Funcionalidade: Visualização do histórico de consumo por dia e hora, e análise de picos de carga.
      </Typography>
    </Box>
  );
};

export default Calendar;