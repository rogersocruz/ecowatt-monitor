import pandas as pd
import numpy as np
import requests
import time
import random
from datetime import datetime, timedelta
from tqdm import tqdm

# --- CONFIGURAÇÃO ---
# URL de Ingestão: http://localhost:3000/api/data/ingest
API_BASE_URL = "http://localhost:3000/api"

# Definições de Disjuntores e Consumo Base (kWh/dia)
DEVICE_PROFILES = {
    1: (1.2, 0.2, "D1 - Iluminação Sala"),    
    2: (12.0, 0.05, "D2 - Chuveiro Quente"),  
    3: (6.0, 0.5, "D3 - Ar Condicionado Q/F"),    
    4: (4.0, 0.8, "D4 - Cozinha (Tomadas)"),    
    5: (8.0, 0.1, "D5 - Piscina (Motor/Filtro)"),    
    6: (-35.0, 0.4, "D6 - Geração PV"),  
}

# --- FUNÇÕES CORE ---

def ingest_data(device_id, kwh, timestamp):
    """Envia um ponto de dado para o backend Node.js."""
    url = f"{API_BASE_URL}/data/ingest"
    
    # Payload para a rota POST /api/data/ingest
    payload = {
        "device_id": device_id,
        "kwh": float(kwh),
        # Passa o timestamp como ISO 8601 string, sem a parte de timezone se for local
        "timestamp": timestamp.isoformat() 
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status() 
        return True
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Erro de Conexão: Certifique-se que o backend está rodando em {API_BASE_URL}. Pulando ingestão...")
        return False
    except requests.exceptions.RequestException as e:
        # Erro 500 ou 400 do servidor
        print(f"\n❌ Erro ao enviar dado para D{device_id}: {e}")
        return False

# CORREÇÃO AQUI: device_id adicionado como primeiro argumento
def generate_daily_kwh(device_id, base_kwh, sigma, date):
    """Gera consumo diário com variação normal, focando em sazonalidade para AC."""
    
    # 1. Variação Aleatória (Normal)
    random_variation = np.random.normal(0, sigma)
    
    # 2. Fator Sazonal (Afeta mais AC)
    if date.month in [1, 2, 12, 7, 8] and base_kwh > 0: 
        seasonal_factor = 1.3 
    else:
        seasonal_factor = 1.0

    kwh = (base_kwh + random_variation) * seasonal_factor
    
    # Garante que o consumo nunca seja negativo para consumo (exceto PV, que é D6)
    if device_id != 6:
        kwh = max(0.1, kwh)
        
    return kwh

# --- MODO 1: BACKFILLING (2 ANOS DE DADOS HISTÓRICOS) ---
# Você pode descomentar esta função para executar o backfilling completo

def run_backfilling(days=730):
    """Gera e envia 2 anos de dados diários para todos os disjuntores."""
    
    print(f"--- ⏳ INICIANDO BACKFILLING (Últimos {days} dias) ---")
    
    end_date = datetime.now().date() - timedelta(days=1) 
    start_date = end_date - timedelta(days=days)
    date_range = pd.date_range(start_date, end_date, freq='D')
    
    
    data_points = []
    
    for device_id, (base_kwh, sigma, name) in DEVICE_PROFILES.items():
        for date in date_range:
            # CORREÇÃO AQUI: Passando device_id
            kwh = generate_daily_kwh(device_id, base_kwh, sigma, date)
            data_points.append({
                'device_id': device_id,
                'kwh': kwh,
                'timestamp': date
            })

    print(f"Enviando {len(data_points)} pontos de dados para a API...")
    for point in tqdm(data_points):
        ingest_data(point['device_id'], point['kwh'], point['timestamp'])
        time.sleep(0.001) 
        
    print("--- ✅ BACKFILLING CONCLUÍDO ---")

# --- MODO 2: INTERFACE DE TEMPO REAL (CLI) ---

def run_realtime_cli():
    """Interface de linha de comando para controlar e ingerir dados em tempo real."""
    
    print("\n--- ⚡ INGESTÃO EM TEMPO REAL (CLI) ---")
    # Imprime o nome do disjuntor em vez do sigma
    print("Disjuntores:")
    for id, (_, _, name) in DEVICE_PROFILES.items():
        print(f"  D{id}: {name}")
        
    print("\nComandos: [ID do Disjuntor] [Fator de Consumo 0.1-2.0] | 'exit'")
    print("Ex: 2 1.5 -> Chuveiro consome 50% a mais (1.5x)")
    
    while True:
        try:
            command = input(">> ").strip()
            
            if command.lower() == 'exit':
                break
                
            parts = command.split()
            if len(parts) != 2:
                if command:
                    print("Formato inválido. Use: [ID] [Fator]")
                continue
                
            device_id = int(parts[0])
            factor = float(parts[1])
            
            if device_id not in DEVICE_PROFILES or not (0.1 <= factor <= 2.0):
                print("ID inválido ou Fator fora do range (0.1 a 2.0).")
                continue

            # 1. Simular Consumo Base * Fator de Sobrescrita
            base_kwh, sigma, _ = DEVICE_PROFILES[device_id]
            
            # CORREÇÃO AQUI: Passando device_id e datetime.now()
            kwh_today = generate_daily_kwh(device_id, base_kwh, sigma, datetime.now()) * factor
            
            # 2. Ingerir dado para o dia atual (med_dia)
            # NOTA: O timestamp é para o dia/hora atual, garantindo que o valor seja atualizado no DB.
            ingest_data(device_id, kwh_today, datetime.now())
            
            # 3. Feedback
            print(f"-> D{device_id}: Consumo Sobrescrito enviado: {kwh_today:.2f} kWh (Fator: {factor:.1f}x)")
            
        except ValueError:
            print("Entrada inválida. IDs e Fatores devem ser números.")
        except KeyboardInterrupt:
            break

# --- EXECUÇÃO PRINCIPAL ---

if __name__ == "__main__":
    
    print("\n--- EcoWatt Data Simulator V1.0 ---")
    
    # OBSERVAÇÃO: Descomente abaixo para executar o backfilling antes do CLI
    # run_backfilling(days=730) 
    
    run_realtime_cli()