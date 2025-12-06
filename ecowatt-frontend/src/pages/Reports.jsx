// src/pages/Reports.jsx
import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Dados de Mockup (Baseado em image_29a1b5.png)
const devicesData = [
  { id: 'D01', orcamento: '23kW', ultimoMes: '25.5kW' },
  { id: 'D02', orcamento: '—', ultimoMes: '25.5kW' },
  { id: 'D03', orcamento: '23kW', ultimoMes: '25.5kW' },
  { id: 'D04', orcamento: '23kW', ultimoMes: '25.5kW' },
  { id: 'D05', orcamento: '—', ultimoMes: '25.5kW' },
  { id: 'D06', orcamento: '—', ultimoMes: '25.5kW' },
];

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📈 Metas e Orçamento (RF07)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Ciclo de Referência: 21/10/25 a 21/11/2025 (Dados Mock)
      </Typography>

      {/* Navegação de Ano (Mockup: 2024 | 2025 | 2026) */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ cursor: 'pointer', opacity: 0.5 }}>2024</Typography>
        <Typography variant="h6" color="primary" sx={{ borderBottom: '2px solid', cursor: 'pointer' }}>2025</Typography>
        <Typography variant="h6" sx={{ cursor: 'pointer', opacity: 0.5 }}>2026</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Tabela de Orçamento">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.300' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Orçamento</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Último Mês</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devicesData.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: '#f0f0f0' }}
              >
                <TableCell component="th" scope="row">{row.id}</TableCell>
                <TableCell>{row.orcamento}</TableCell>
                <TableCell>{row.ultimoMes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="body2" sx={{ mt: 3 }}>
        *A coluna "Orçamento" (Metas) é editável e a base para o RF07.
      </Typography>
    </Box>
  );
};

export default Reports; // <--- GARANTINDO O EXPORT DEFAULT AQUI