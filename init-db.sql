-- Exemplo de Conteúdo para init-db.sql (Garantindo as relações necessárias)

-- 1. Tabela de Usuários (necessária para FK em devices)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- RNF02: Armazenamento seguro de senha
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Dispositivos/Circuitos (RF04)
CREATE TABLE IF NOT EXISTS devices (
    id_disj SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    consumo_base REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Medições Diárias (Telemetria)
CREATE TABLE IF NOT EXISTS med_dia (
    id SERIAL PRIMARY KEY,
    id_disj INTEGER NOT NULL REFERENCES devices(id_disj) ON DELETE CASCADE,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    valor REAL NOT NULL, -- Consumo/Geração em kWh

    -- [CRÍTICO PARA O UPSERT]: Garante que um par dispositivo/timestamp seja único
    UNIQUE (id_disj, timestamp) 
);

-- Inserção de um usuário padrão (para testes)
INSERT INTO users (id, email, password_hash)
VALUES (1, 'testuser@ecowatt.com', 'mockhash_123') 
ON CONFLICT (id) DO NOTHING;

-- Inserção de dispositivos mock (baseado no simulador)
INSERT INTO devices (id_disj, user_id, description, consumo_base)
VALUES 
    (1, 1, 'D1 - Iluminação Sala', 1.2),
    (2, 1, 'D2 - Chuveiro Quente', 12.0),
    (3, 1, 'D3 - Ar Condicionado Q/F', 6.0),
    (4, 1, 'D4 - Cozinha (Tomadas)', 4.0),
    (5, 1, 'D5 - Piscina (Motor/Filtro)', 8.0),
    (6, 1, 'D6 - Geração PV', -35.0)
ON CONFLICT (id_disj) DO NOTHING;

-- Define o valor da sequence para garantir que novos inserts comecem após os valores manuais
-- Correção 1: Sequence 'users' deve usar 'users_id_seq'
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
-- Correção 2: Sequence 'devices' deve usar 'devices_id_disj_seq'
SELECT setval('devices_id_disj_seq', (SELECT MAX(id_disj) FROM devices));