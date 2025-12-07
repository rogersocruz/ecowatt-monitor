// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, Alert, Container } from '@mui/material';
import { Bolt as BoltIcon, TrendingUp as TrendIcon, CalendarToday as CalendarIcon, Money as MoneyIcon } from '@mui/icons-material';

const TARIFA = 0.85; // R$ 0,85 por kWh

// --- Funções Auxiliares de Data ---

// Calcula o início e fim do ciclo com base na regra do dia 21
const getBillingCycle = (now = new Date()) => {
  const currentDay = now.getDate();
  
  // Data de Início do Ciclo ATUAL
  let cycleStart = new Date(now);
  if (currentDay < 21) {
    // Se hoje é dia 5, o ciclo começou dia 21 do mês passado
    cycleStart.setMonth(cycleStart.getMonth() - 1);
  }
  cycleStart.setDate(21);
  cycleStart.setHours(0, 0, 0, 0);

  // Data de Término do Ciclo ATUAL (21 do próximo mês)
  let cycleEnd = new Date(cycleStart);
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);

  // Data de Início do Ciclo ANTERIOR (para comparação)
  let prevCycleStart = new Date(cycleStart);
  prevCycleStart.setMonth(prevCycleStart.getMonth() - 1);

  return { cycleStart, cycleEnd, prevCycleStart };
};

// --- Componentes Visuais (Mantidos) ---

const SummaryCard = ({ title, value, color = 'text.primary', bgcolor = '#f0f0f0', icon, secondaryValue }) => (
  <Card sx={{ height: 160, backgroundColor: bgcolor, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
        {icon && React.cloneElement(icon, { sx: { mr: 1, fontSize: 32, color: color } })}
        <Typography variant="h3" sx={{ color: color, fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      {secondaryValue && <Typography variant="caption" align="center" color="text.secondary">{secondaryValue}</Typography>}
    </CardContent>
  </Card>
);

const DisjuntorCard = ({ name, totalKwh, lastMonthKwh }) => (
  <Card variant="outlined" sx={{ mb: 2, minHeight: 280, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
    <CardContent sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>{name}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">Este Mês (desde dia 21):</Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalKwh.toFixed(2)} kWh</Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Mês Passado:</Typography>
        <Typography variant="body2">{lastMonthKwh.toFixed(2)} kWh</Typography>
      </Box>
    </CardContent>
    <Box sx={{ backgroundColor: 'grey.300', p: 1.5, mt: 'auto' }}>
      <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
        R$ {(totalKwh * TARIFA).toFixed(2)}
      </Typography>
    </Box>
  </Card>
);

// --- Lógica Principal ---

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processarDados = useCallback((logs) => {
    // 1. Definir as janelas de tempo
    const { cycleStart, cycleEnd, prevCycleStart } = getBillingCycle();
    
    // Estruturas de Acumulação
    const devices = {};
    let somaMesAtual = 0;
    let somaMesAnterior = 0;

    // 2. Ordenar cronologicamente para integração correta
    const logsSorted = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 3. Loop de Integração (Calculus: Power * Delta Time)
    logsSorted.forEach((log) => {
      const id = log.device_id;
      const time = new Date(log.timestamp);
      const powerKw = parseFloat(log.kwh);

      // Inicializa estrutura do dispositivo se não existir
      if (!devices[id]) {
        devices[id] = { 
          currentKwh: 0, 
          lastMonthKwh: 0, 
          lastTime: time, 
          name: `Disjuntor ${id}` 
        };
        // O primeiro ponto serve apenas de âncora temporal, não gera consumo (Delta T = 0)
        return; 
      }

      // Calcular Delta T em Horas
      const deltaMs = time - devices[id].lastTime;
      const deltaHours = deltaMs / (1000 * 60 * 60); // ms -> horas

      // Evitar saltos irreais (ex: sistema desligado por dias não deve gerar consumo linear)
      // Se delta for > 1 hora, assumimos que o sistema caiu ou parou, ignoramos a integração desse gap
      if (deltaHours > 1.0) {
          devices[id].lastTime = time;
          return; 
      }

      // Integração: Energia (kWh) = Potência (kW) * Tempo (h)
      const energyInc = powerKw * deltaHours;

      // 4. Aplicação da Regra de Negócio (Janelas de Tempo)
      if (time >= cycleStart && time < cycleEnd) {
        // PERTENCE AO CICLO ATUAL
        devices[id].currentKwh += energyInc;
        somaMesAtual += energyInc;
      } else if (time >= prevCycleStart && time < cycleStart) {
        // PERTENCE AO CICLO ANTERIOR
        devices[id].lastMonthKwh += energyInc;
        somaMesAnterior += energyInc;
      }

      // Atualiza o lastTime para o próximo loop
      devices[id].lastTime = time;
    });

    // 5. Cálculos Finais de Interface
    const diffPercent = somaMesAnterior > 0 
      ? ((somaMesAtual - somaMesAnterior) / somaMesAnterior) * 100 
      : 0;
    
    // Dias restantes no ciclo
    const daysPassed = Math.floor((new Date() - cycleStart) / (1000 * 60 * 60 * 24));
    const totalDaysCycle = Math.floor((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDaysCycle - daysPassed);

    // Identificar vilão
    const vilao = Object.values(devices).sort((a, b) => b.currentKwh - a.currentKwh)[0];

    return {
      cicloTxt: `${cycleStart.toLocaleDateString('pt-BR')} a ${cycleEnd.toLocaleDateString('pt-BR')}`,
      somaMes: somaMesAtual,
      somaUltimoMes: somaMesAnterior,
      relativo: diffPercent,
      daysRemaining,
      vilaoName: vilao ? vilao.name : '---',
      dispositivos: devices
    };

  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/raw-telemetry');
        if (!res.ok) throw new Error('API Error');
        const logs = await res.json();
        
        const result = processarDados(logs);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s Refresh
    return () => clearInterval(interval);
  }, [processarDados]);

  if (loading && !data) return <Container sx={{mt: 10, textAlign: 'center'}}><CircularProgress /></Container>;
  if (error && !data) return <Container sx={{mt: 5}}><Alert severity="error">{error}</Alert></Container>;

  const relativeColor = data.relativo >= 0 ? 'error.main' : 'success.main';
  const signal = data.relativo >= 0 ? '+' : '';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>🚀 Monitoramento (Ciclo Dia 21)</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Vigência: {data.cicloTxt}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Consumo Mês Atual" 
            value={`${data.somaMes.toFixed(2)} kWh`} 
            color="primary.main" 
            bgcolor="#e3f2fd"
            icon={<BoltIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Comparativo Mês Anterior" 
            value={`${signal}${data.relativo.toFixed(1)}%`} 
            color={relativeColor}
            secondaryValue={`Mês Passado: ${data.somaUltimoMes.toFixed(2)} kWh`} 
            bgcolor="#fff3e0"
            icon={<TrendIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Dias Restantes" 
            value={`${data.daysRemaining} dias`} 
            color="warning.main" 
            secondaryValue={`Vilão: ${data.vilaoName}`}
            bgcolor="#f3e5f5"
            icon={<CalendarIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Fatura Estimada" 
            value={`R$ ${(data.somaMes * TARIFA).toFixed(2)}`} 
            color="success.main" 
            bgcolor="#e8f5e9"
            icon={<MoneyIcon />}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Detalhamento por Disjuntor</Typography>
      <Grid container spacing={2}>
        {Object.keys(data.dispositivos).map(id => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <DisjuntorCard 
              name={data.dispositivos[id].name}
              totalKwh={data.dispositivos[id].currentKwh}
              lastMonthKwh={data.dispositivos[id].lastMonthKwh}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;