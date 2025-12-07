// ecowatt-backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// [ALTERAÇÃO 1] Importação da nova função getRawTelemetry
import { pool, getDashboardData, insertConsumptionData, getRawTelemetry } from './db.js'; 
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Ajudas para encontrar o caminho do arquivo no ambiente ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Rotas de ADMIN/TESTE ---

// Rota de Teste do Servidor
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'EcoWatt Monitor Backend: Operacional', 
    version: '1.0.0',
    status: 'Running'
  });
});

// Rota de Status e Teste de Conexão com o Banco de Dados
app.get('/api/status', async (req, res) => {
  try {
    await pool.query('SELECT 1'); 
    res.status(200).json({
      service: 'EcoWatt Backend',
      status: 'Healthy',
      database: 'Connected and Ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health Check Failed:", error.message);
    res.status(503).json({
      service: 'EcoWatt Backend',
      status: 'Degraded',
      database: 'Connection Error',
      error: error.message
    });
  }
});

// Rota de Admin para inicialização de dados (DELETAR NO PROD!)
app.get('/admin/seed-db', async (req, res) => {
    // Para segurança, sempre verificar se estamos em ambiente de desenvolvimento!
    if (process.env.NODE_ENV === 'production' || req.query.mode !== 'dev') { 
        return res.status(403).json({ message: 'Acesso Proibido. Use /admin/seed-db?mode=dev para executar o script.' });
    }

    try {
        const seedPath = path.join(__dirname, 'seed_data.sql'); 
        const sql = await fs.readFile(seedPath, 'utf-8');

        // Esta linha executa o script SQL corrigido
        await pool.query(sql); 

        res.status(200).json({
            message: '🎉 Banco de dados populado com sucesso! Dados iniciais inseridos.',
            status: 'Seed Complete'
        });
    } catch (error) {
        console.error("❌ Erro ao popular o banco de dados:", error.stack);
        res.status(500).json({
            message: 'Falha ao executar o script de seed. (Verifique logs do container.)',
            error: error.message
        });
    }
});


// --- Rotas de APLICAÇÃO (RFs) ---

// Rota de Ingestão de Dados (Telemetria) - NOVA ROTA para o Python
app.post('/api/data/ingest', async (req, res) => {
    const { device_id, kwh, timestamp } = req.body;

    if (!device_id || kwh === undefined || !timestamp) {
        return res.status(400).json({ message: 'Dados incompletos (device_id, kwh, timestamp são obrigatórios).' });
    }

    try {
        // Chama a função do db.js para UPSERT (INSERT/UPDATE)
        await insertConsumptionData(device_id, kwh, timestamp);
        res.status(201).json({ 
            message: 'Dado de telemetria ingerido com sucesso.', 
        });
    } catch (error) {
        console.error("Erro na ingestão de dados:", error.stack);
        res.status(500).json({ 
            message: 'Falha na ingestão de dados.', 
            error: error.message 
        });
    }
});

// [ALTERAÇÃO 2] Nova Rota: Telemetria Bruta para o Dashboard fazer a integral temporal
app.get('/api/raw-telemetry', async (req, res) => {
    try {
        const data = await getRawTelemetry();
        res.status(200).json(data);
    } catch (error) {
        console.error("Erro ao buscar raw telemetry:", error.stack);
        res.status(500).json({ 
            message: 'Falha ao obter logs brutos.',
            error: error.message 
        });
    }
});

// RF03: Rota para obter os dados do Dashboard (Agregado - Legacy ou uso misto)
app.get('/api/dashboard', async (req, res) => {
    // TODO: No futuro, pegue o userId do token JWT
    const userId = 1; 

    try {
        const data = await getDashboardData(userId);
        res.json(data);
    } catch (error) {
        console.error("Erro ao obter dados do Dashboard:", error.stack);
        res.status(500).json({ 
            message: 'Falha ao carregar dados do dashboard.',
            error: error.message
        });
    }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`URL de teste (API): http://localhost:${PORT}/`);
  console.log(`URL de status (DB): http://localhost:${PORT}/api/status`);
});