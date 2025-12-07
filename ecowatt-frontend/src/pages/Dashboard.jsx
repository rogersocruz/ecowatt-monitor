// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, Alert, Container, Tooltip } from '@mui/material';
import { 
  Bolt as BoltIcon, 
  TrendingUp as TrendUpIcon, 
  TrendingDown as TrendDownIcon, // Novo ícone para economia
  CalendarToday as CalendarIcon, 
  Money as MoneyIcon, 
  Speed as SpeedIcon, 
  Circle as CircleIcon 
} from '@mui/icons-material';

const TARIFA = 0.85; // R$ 0,85 por kWh

// --- 1. Funções Auxiliares de Data ---
const getBillingCycle = (now = new Date()) => {
  const currentDay = now.getDate();
  
  let cycleStart = new Date(now);
  if (currentDay < 21) {
    cycleStart.setMonth(cycleStart.getMonth() - 1);
  }
  cycleStart.setDate(21);
  cycleStart.setHours(0, 0, 0, 0);

  let cycleEnd = new Date(cycleStart);
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);

  let prevCycleStart = new Date(cycleStart);
  prevCycleStart.setMonth(prevCycleStart.getMonth() - 1);

  return { cycleStart, cycleEnd, prevCycleStart };
};

// --- 2. Componentes Visuais ---

const SummaryCard = ({ title, value, color = 'text.primary', bgcolor = '#f0f0f0', icon, secondaryValue }) => (
  <Card sx={{ height: 160, backgroundColor: bgcolor, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 2 }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
        {icon && React.cloneElement(icon, { sx: { mr: 1, fontSize: 36, color: color } })}
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      {secondaryValue && <Typography variant="caption" align="center" color="text.secondary" display="block">{secondaryValue}</Typography>}
    </CardContent>
  </Card>
);

const DisjuntorCard = ({ name, totalKwh, dailyAvg, lastReading, projectedMonth, isOnline, debugInfo }) => (
  <Card variant="outlined" sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center', borderColor: isOnline ? '#4caf50' : '#e0e0e0', borderWidth: isOnline ? 2 : 1, boxShadow: 1 }}>
    <CardContent sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{name}</Typography>
        
        <Tooltip title={isOnline ? "Online" : `Offline: ${debugInfo}`}>
            <CircleIcon sx={{ fontSize: 16, color: isOnline ? '#4caf50' : '#f44336', cursor: 'help' }} />
        </Tooltip>
      </Box>
      
      <Divider sx={{ my: 1.5 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Consumo Ciclo Atual</Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalKwh.toFixed(2)} <span style={{fontSize: '0.8rem'}}>kWh</span></Typography>
      </Box>

      <Grid container spacing={1} sx={{ textAlign: 'left', mt: 1 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Última Leitura</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff9800' }} />
            <Typography variant="body2" fontWeight="bold">{lastReading.toFixed(2)} kW</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Média Dia</Typography>
          <Typography variant="body2" fontWeight="bold">{dailyAvg.toFixed(2)} kWh</Typography>
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">Projeção Mês (30d)</Typography>
          <Typography variant="body2" color="text.primary">{projectedMonth.toFixed(1)} kWh</Typography>
        </Grid>
      </Grid>

    </CardContent>
    
    <Box sx={{ backgroundColor: '#f5f5f5', p: 1.5, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="caption" color="text.secondary">Custo Acumulado</Typography>
      <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
        R$ {(totalKwh * TARIFA).toFixed(2)}
      </Typography>
    </Box>
  </Card>
);

// --- 3. Lógica Principal ---

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processarDados = useCallback((logs) => {
    const { cycleStart, cycleEnd, prevCycleStart } = getBillingCycle();
    
    const devices = {};
    let somaMesAtual = 0;
    let somaMesAnterior = 0;

    const logsSorted = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const globalLatestTime = logsSorted.length > 0 
        ? new Date(logsSorted[logsSorted.length - 1].timestamp).getTime() 
        : 0;

    logsSorted.forEach((log) => {
      const id = log.device_id;
      const time = new Date(log.timestamp);
      const powerKw = parseFloat(log.kwh);

      if (!devices[id]) {
        devices[id] = { 
          currentKwh: 0, 
          lastMonthKwh: 0, 
          lastTime: time, 
          lastReading: 0,
          name: `Disjuntor ${id}`,
          isOnline: false 
        };
        return; 
      }

      const deltaHours = (time - devices[id].lastTime) / (1000 * 60 * 60);

      if (deltaHours <= 1.0) {
          const energyInc = powerKw * deltaHours;

          // Se estiver no ciclo ATUAL (ex: 21 Nov a 21 Dez)
          if (time >= cycleStart && time < cycleEnd) {
            devices[id].currentKwh += energyInc;
            somaMesAtual += energyInc;
          } 
          // Se estiver no ciclo ANTERIOR (ex: 21 Out a 21 Nov)
          else if (time >= prevCycleStart && time < cycleStart) {
            devices[id].lastMonthKwh += energyInc;
            somaMesAnterior += energyInc;
          }
      }

      devices[id].lastTime = time;
      devices[id].lastReading = powerKw;
    });

    // --- CÁLCULO DA PORCENTAGEM (COMPARATIVO) ---
    // Se houve consumo no mês anterior, calcula a diferença. Senão, é 0 (ou 100% se preferir).
    const diffPercent = somaMesAnterior > 0 
      ? ((somaMesAtual - somaMesAnterior) / somaMesAnterior) * 100 
      : 0;
    
    const timeDiffCycle = new Date() - cycleStart;
    const daysPassed = Math.max(1, timeDiffCycle / (1000 * 60 * 60 * 24)); 
    const daysRemaining = Math.max(0, 30 - Math.floor(daysPassed));

    const devicesFormatted = {};
    
    Object.keys(devices).forEach(key => {
        const d = devices[key];
        const lastTimeMs = d.lastTime.getTime();
        const diffRelative = globalLatestTime - lastTimeMs;
        const isSynced = diffRelative <= 10000; 
        const hasLoad = Math.abs(d.lastReading) > 0.01;
        const isOnline = isSynced && hasLoad;

        devicesFormatted[key] = {
            ...d,
            dailyAvg: d.currentKwh / daysPassed,
            projectedMonth: (d.currentKwh / daysPassed) * 30,
            isOnline: isOnline,
            debugInfo: `${(diffRelative/1000).toFixed(1)}s atrás`
        };
    });

    return {
      cicloTxt: `${cycleStart.toLocaleDateString('pt-BR')} a ${cycleEnd.toLocaleDateString('pt-BR')}`,
      somaMes: somaMesAtual,
      somaUltimoMes: somaMesAnterior,
      relativo: diffPercent,
      daysRemaining,
      dispositivos: devicesFormatted
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
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, [processarDados]);

  if (loading && !data) return <Container sx={{mt: 10, textAlign: 'center'}}><CircularProgress /></Container>;
  if (error && !data) return <Container sx={{mt: 5}}><Alert severity="error">{error}</Alert></Container>;

  // --- LÓGICA DE COR E ÍCONE DO COMPARATIVO ---
  // Se gastou MAIS (relativo > 0): Vermelho (Ruim) e Seta p/ Cima
  // Se gastou MENOS (relativo < 0): Verde (Bom) e Seta p/ Baixo
  // Se igual (0): Cinza/Azul e Seta p/ Cima (ou traço)
  
  const isSpendingMore = data.relativo > 0;
  const isSpendingLess = data.relativo < 0;

  let comparisonColor = 'text.secondary'; // Padrão
  if (isSpendingMore) comparisonColor = 'error.main'; // Vermelho
  if (isSpendingLess) comparisonColor = 'success.main'; // Verde

  let ComparisonIcon = TrendUpIcon; // Padrão seta pra cima
  if (isSpendingLess) ComparisonIcon = TrendDownIcon; // Seta pra baixo se economizou

  const signal = data.relativo > 0 ? '+' : '';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>🚀 Monitoramento (Ciclo Dia 21)</Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        Período de Faturamento: {data.cicloTxt}
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
          {/* Card de Comparativo Atualizado */}
          <SummaryCard 
            title="Comparativo Mês Anterior" 
            value={`${signal}${data.relativo.toFixed(1)}%`} 
            color={comparisonColor}
            secondaryValue={`Mês Passado: ${data.somaUltimoMes.toFixed(2)} kWh`} 
            bgcolor="#fff3e0"
            icon={<ComparisonIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Dias Restantes" 
            value={`${data.daysRemaining} dias`} 
            color="warning.main" 
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

      <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Detalhamento por Disjuntor</Typography>
      <Grid container spacing={2}>
        {Object.keys(data.dispositivos).map(id => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
            <DisjuntorCard 
              name={data.dispositivos[id].name}
              totalKwh={data.dispositivos[id].currentKwh}
              lastReading={data.dispositivos[id].lastReading} 
              dailyAvg={data.dispositivos[id].dailyAvg}       
              projectedMonth={data.dispositivos[id].projectedMonth}
              isOnline={data.dispositivos[id].isOnline}
              debugInfo={data.dispositivos[id].debugInfo}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;