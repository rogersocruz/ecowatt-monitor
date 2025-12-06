-- ecowatt-backend/seed_data.sql

-- 1. Inserir Usuário (RF01)
INSERT INTO users (email, password_hash)
VALUES ('roger.eng@ecowatt.com', '$2a$10$f6Fw6T2P0Y9xR2hY0Z4/eO/sR8R3V0oQ7C1K5B8Z7X5')
ON CONFLICT (email) DO NOTHING;

-- 2. Inserir Dispositivos (D01 a D06) (RF04)
INSERT INTO devices (user_id, description) VALUES
(1, 'D1 - Iluminação Sala - Circuito principal'),
(1, 'D2 - Chuveiro Quente - Alto consumo'),
(1, 'D3 - Ar Condicionado Q/F - Split Inverter'),
(1, 'D4 - Cozinha (Tomadas) - Bancada da cozinha'),
(1, 'D5 - Piscina (Motor/Filtro) - Consumo contínuo'),
(1, 'D6 - Geração PV - Inversores')
ON CONFLICT DO NOTHING;

-- 3. Inserir Dados de Consumo (Mock - Últimos 60 dias)

-- Para D1 (Iluminação - Baixo Consumo)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 1,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 0.5 + 1)::numeric(10, 4);

-- Para D2 (Chuveiro - Alto Consumo)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 2,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 5 + 10)::numeric(10, 4);

-- Para D3 (Ar Condicionado - Uso sazonal)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 3,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 2 + 1)::numeric(10, 4);

-- Para D4 (Cozinha - Uso médio)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 4,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 1.5 + 2)::numeric(10, 4);

-- Para D5 (Piscina - Uso médio)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 5,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 2 + 6)::numeric(10, 4);

-- Para D6 (Geração PV - Produção)
INSERT INTO med_dia (id_disj, timestamp, valor)
SELECT 6,
    generate_series(
        CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '1 day', '1 day'
    )::timestamp,
    (random() * 20 + 30) * -1::numeric(10, 4);