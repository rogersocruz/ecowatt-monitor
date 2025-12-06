// ecowatt-backend/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
// Pool de conexões para o PostgreSQL
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // No Docker, será 'db' (o nome do serviço)
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
// Função para testar a conexão com o banco de dados
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        // CORREÇÃO: Remoção de emojis para garantir compatibilidade ASCII/Unicode no ambiente Docker
        console.log(`[DB] Conexão com PostgreSQL bem-sucedida. Hora do DB: ${res.rows[0].now}`); 
        return true;
    } catch (err) {
        // CORREÇÃO: Remoção de emojis 
        console.error('[DB] Erro FATAL na conexão com o PostgreSQL:', err.stack);
        return false;
    }
};

// --- Funções de Ingestão e Leitura ---

/**
 * Converte kWh para um valor monetário de R$ mock
 * @param {number} kwh - Consumo em Kilowatt-hora.
 * @returns {number} Preço mock em Reais.
 */
const calculateMockPrice = (kwh) => {
    // Tarifa mock de R$ 0.85 por kWh
    return (Math.abs(kwh) * 0.85).toFixed(2);
};

/**
 * Insere um novo ponto de dado de consumo/geração (RF03)
 * @param {number} deviceId - ID do dispositivo (id_disj).
 * @param {number} kwh - Consumo/Geração em kWh.
 * @param {string} timestamp - Timestamp ISO string.
 */
const insertConsumptionData = async (deviceId, kwh, timestamp) => {
    const query = `
        INSERT INTO med_dia (id_disj, timestamp, valor)
        VALUES ($1, $2, $3)
        -- Esta cláusula requer UNIQUE(id_disj, timestamp) na tabela med_dia
        ON CONFLICT (id_disj, timestamp) DO UPDATE 
        SET valor = EXCLUDED.valor;
    `;
    
    try {
        await pool.query(query, [deviceId, timestamp, kwh]);
        return { success: true };
    } catch (err) {
        console.error('[DB] Erro ao inserir dado de consumo:', err.stack); // CORREÇÃO: Remoção de emojis
        // O erro 500 do Python se refere a esta exceção
        throw new Error('Falha na ingestão de dado de telemetria no DB (Verifique o esquema e a restrição UNIQUE).');
    }
};


/**
 * Busca dados consolidados de consumo para o Dashboard (RF03)
 * @param {number} userId - ID do usuário logado 
 * @returns {object} Dados agregados do Dashboard
 */
const getDashboardData = async (userId = 1) => {
    try {
        // --- 1. Definir Períodos (Ciclo de 30 dias) ---
        const cycleEnd = new Date();
        const cycleStart = new Date(cycleEnd);
        cycleStart.setDate(cycleEnd.getDate() - 30);
        
        const previousCycleEnd = new Date(cycleStart);
        const previousCycleStart = new Date(previousCycleEnd);
        previousCycleStart.setDate(previousCycleEnd.getDate() - 30);

        // --- 2. Query de Dados Agregados (Ciclo Atual e Anterior) ---
        const totalConsumptionQuery = `
            WITH ConsumptionData AS (
                SELECT 
                    md.valor,
                    md.timestamp
                FROM med_dia md
                JOIN devices d ON md.id_disj = d.id_disj
                WHERE d.user_id = $1
            )
            SELECT 
                COALESCE(SUM(CASE WHEN timestamp 
                >= $2 AND timestamp < $3 THEN valor END), 0) AS current_month_kwh,
                COALESCE(SUM(CASE WHEN timestamp >= $4 AND timestamp < $2 THEN valor END), 0) AS last_month_kwh
            FROM ConsumptionData;
        `;
        
        const totalRes = await pool.query(totalConsumptionQuery, [
            userId, 
            cycleStart.toISOString(), 
            cycleEnd.toISOString(),
            previousCycleStart.toISOString()
        ]);
        const { current_month_kwh, last_month_kwh } = totalRes.rows[0];

        // --- 3. Query de Detalhes dos Dispositivos (RF04) ---
        const deviceDetailsQuery = `
            WITH DeviceDailyConsumption AS (
                SELECT
                    d.id_disj,
                    d.description, 
                    DATE(md.timestamp) AS day,
                    SUM(md.valor) AS daily_kwh 
                FROM devices d
                JOIN med_dia md ON d.id_disj = md.id_disj
                
                WHERE d.user_id = $1 AND md.timestamp >= $2 AND md.timestamp < $3
                GROUP BY d.id_disj, d.description, DATE(md.timestamp)
            )
            SELECT
                d.id_disj,
                d.description,         
                COALESCE(SUM(ddc.daily_kwh), 0) AS consumption_month_kwh,
                COALESCE(AVG(ddc.daily_kwh), 0) AS avg_kwh_day,
                COUNT(DISTINCT ddc.day) AS days_in_cycle
            FROM devices d
            LEFT JOIN DeviceDailyConsumption ddc ON d.id_disj = ddc.id_disj
            WHERE d.user_id 
            = $1
            GROUP BY d.id_disj, d.description
            ORDER BY consumption_month_kwh DESC;
        `;

        const deviceRes = await pool.query(deviceDetailsQuery, [
            userId, 
            cycleStart.toISOString(), 
            cycleEnd.toISOString()
        ]);
        const devices = deviceRes.rows.map(row => {
            const consumptionMonthKwh = parseFloat(row.consumption_month_kwh);
            const avgKwhDay = parseFloat(row.avg_kwh_day);
            const daysInCycle = parseInt(row.days_in_cycle);

            const mediaMesKwh = avgKwhDay * daysInCycle;
            const preco = calculateMockPrice(consumptionMonthKwh);

            return {
                id: row.id_disj, 
                name: row.description, 
                consumoMes: `${consumptionMonthKwh.toFixed(1)} kW`, 
                mediaMes: `${mediaMesKwh.toFixed(1)} kW`, 
                mediaDia: `${(avgKwhDay * 1000).toFixed(1)} W`, 
                preco: `R$ ${preco}`
            };
        });
        // --- 4. Cálculo e Formatação Final ---
        const currentKwh = parseFloat(current_month_kwh);
        const lastKwh = parseFloat(last_month_kwh);

        const diffPercent = lastKwh > 0 
            ?
        ((currentKwh - lastKwh) / lastKwh) * 100 
            : (currentKwh > 0 ? 100 : 0);
        const daysPassed = Math.floor((new Date() - cycleStart) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysPassed);


        return {
            ciclo: `${cycleStart.toLocaleDateString('pt-BR')} a ${cycleEnd.toLocaleDateString('pt-BR')}`,
            somaMes: `${currentKwh.toFixed(1)} kW`,
            somaUltimoMes: `${lastKwh.toFixed(1)} kW`,
            relativo: `${diffPercent >= 0 ?
        '+' : ''}${diffPercent.toFixed(1)}%`,
            diasRestantes: `restam ${daysRemaining} dias`,
            disjuntorMaisGasta: devices.length > 0 ?
        devices[0].name : 'N/A',
            precoReais: calculateMockPrice(currentKwh),
            disjuntores: devices
        };
    } catch (err) {
        console.error('[DB] Erro ao buscar dados do Dashboard (Refatorado):', err.stack); // CORREÇÃO: Remoção de emojis
        throw new Error('Falha na busca de dados consolidados após refatoração.');
    }
};
// Teste de Conexão é executado uma vez na inicialização
testConnection();

export { pool, testConnection, getDashboardData, insertConsumptionData };