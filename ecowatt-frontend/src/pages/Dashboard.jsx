// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, Alert, Container } from '@mui/material';
import { Bolt as BoltIcon, TrendingUp as TrendIcon, CalendarToday as CalendarIcon, Money as MoneyIcon } from '@mui/icons-material';

// --- Componentes ---

// Componente para o Card de Resumo no Topo
const SummaryCard = ({ title, value, color = 'text.primary', bgcolor = '#f0f0f0', icon, secondaryValue }) => (
  <Card sx={{ height: 160, backgroundColor: bgcolor, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
        {icon && React.cloneElement(icon, { sx: { mr: 1, fontSize: 32, color: color } })}
        <Typography variant="h3" sx={{ color: color, fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      {secondaryValue && (
        <Typography variant="caption" align="center" color="text.secondary">
          {secondaryValue}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Componente para o Card de Detalhe do Disjuntor na parte inferior
const DisjuntorCard = ({ id, name, consumoMes, mediaMes, mediaDia, preco }) => (
  <Card variant="outlined" sx={{ mb: 2, height: 280, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" color="primary.main">{name.split(' - ')[0]}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{name.split(' - ')[1]}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ textAlign: 'left', p: 1 }}>
        <Typography variant="caption" display="block">Consumo Mês:</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{consumoMes}</Typography>
        <Typography variant="caption" display="block">Média Mês (total):</Typography>
        <Typography variant="body1">{mediaMes}</Typography>
        <Typography variant="caption" display="block">Média Dia:</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>{mediaDia}</Typography>
      </Box>
    </CardContent>
    <Box sx={{ backgroundColor: 'grey.300', p: 1 }}>
      <Typography variant="h6" color="error.main">{preco}</Typography>
    </Box>
  </Card>
);

// --- Componente Principal ---

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Assume que o backend está em localhost:3000
        const response = await fetch('http://localhost:3000/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da API. Código: ' + response.status);
        }
        
        const result = await response.json();
        setData(result);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados de telemetria...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">
          Erro ao carregar Dashboard. Certifique-se que o Docker Compose (Backend/DB) está rodando e populado (API: /admin/seed-db). 
          Detalhes: {error}
        </Alert>
      </Container>
    );
  }
  
  const { 
    ciclo, 
    somaMes, 
    somaUltimoMes, 
    relativo, 
    diasRestantes, 
    disjuntorMaisGasta, 
    precoReais, 
    disjuntores 
  } = data;

  // Determinar cor da variação percentual
  const relativeColor = relativo.startsWith('+') ? 'error.main' : 'success.main';
  const somaUltimoMesText = `Σ(Soma) Último Mês: ${somaUltimoMes}`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🚀 EcoWatt Dashboard
      </Typography>
      
      {/* Ciclo de Medição */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Ciclo de Medição: {ciclo} 
      </Typography>

      {/* Grid de Resumo Superior */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Coluna 1: Consumo Mês (Grande) */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Σ(Soma) Mês" 
            value={somaMes} 
            color="primary.main" 
            bgcolor="#f0ffef"
          />
        </Grid>

        {/* Coluna 2: Relativo ao Último Mês e Consumo Último Mês */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Variação Último Ciclo" 
            value={relativo} 
            color={relativeColor} 
            icon={<TrendIcon />}
            secondaryValue={somaUltimoMesText}
            bgcolor="#f0f0f0"
          />
        </Grid>

        {/* Coluna 3: Dias Restantes e Disjuntor que mais gasta */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Dias até fim do ciclo de medição" 
            value={diasRestantes} 
            color="warning.main" 
            icon={<CalendarIcon />}
            bgcolor="#f0f0f0"
          />
          <Card sx={{ height: 60, backgroundColor: '#f0f0f0', mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent>
               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Mais Consumo: {disjuntorMaisGasta.split(' - ')[0]}
                </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna 4: Preço em Reais (R$) */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Custo Estimado (R$)" 
            value={`R$ ${precoReais}`} 
            color="error.main" 
            icon={<MoneyIcon />}
            bgcolor="#f0efef"
          />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 2 }}>
        Medições Individuais (Dispositivos)
      </Typography>

      {/* Grid de Detalhes dos Disjuntores (D1 a D6) */}
      <Grid container spacing={2}>
        {disjuntores.map((d, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}> 
            <DisjuntorCard {...d} />
          </Grid>
        ))}
      </Grid>
      
    </Box>
  );
};

export default Dashboard;