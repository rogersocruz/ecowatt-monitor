# ecowatt-hist-simulator.py
import pandas as pd
import numpy as np
import requests
import time
import random
import os
import sys
from datetime import datetime, timedelta
from tqdm import tqdm

# --- CONFIGURAÇÃO ---
API_BASE_URL = "http://localhost:3000/api"
DAYS_TO_SIMULATE = 730  # Dois anos
INTERVAL_SECONDS = 60  # Um ponto por minuto
POINTS_PER_DAY = (24 * 60 * 60) // INTERVAL_SECONDS # 1440 pontos/dia

# Define a data atual menos um dia (final de ontem) como o fim do backfilling
END_DATE = datetime.now().date() - timedelta(days=1) 
START_DATE = END_DATE - timedelta(days=DAYS_TO_SIMULATE) 

# PERFIS (Limites Reais): {ID: (BASE_KW_MEDIO_STANDBY, POTENCIA_PICO_KW, SIGMA_KW)}
DEVICE_PROFILES_HF = {
    1: (0.001, 0.03, 0.0005, "D1 - Iluminação Sala"),    
    2: (0.0001, 5.0, 0.05, "D2 - Chuveiro Quente"),  
    3: (0.005, 2.5, 0.1, "D3 - Ar Condicionado Q/F"),    
    4: (0.05, 0.5, 0.02, "D4 - Cozinha (Standby Geladeira)"),    
    5: (0.01, 1.0, 0.01, "D5 - Piscina (Motor/Filtro)"),    
    6: (0.0, -5.0, 0.2, "D6 - Geração PV"), # Pico Negativo
}

# Define Janelas de Uso RÍGIDAS (O consumo só ocorre dentro dessas janelas)
# OBS: O AC (D3) tem lógica de janela diurna/integral separada por mês.
USAGE_WINDOWS = {
    1: [("19:00", "23:00")], # Iluminação: 4h noite
    2: [("06:30", "06:50"), ("18:30", "18:50"), ("21:00", "21:20")], # Chuveiro: 3 banhos de 20min
    3: [("23:00", "06:00")], # AC: 7h noturnas (Padrão)
    4: [("06:00", "22:00")], # Cozinha: Standby Geladeira + Uso (Janela de pico)
    5: [("09:00", "14:00")], # Piscina: 5h durante o dia
    6: [("10:00", "16:00")], # Geração PV: 6h sol
}
# --- FUNÇÕES CORE ---

def is_time_in_window(current_time, window_list):
    """Verifica se o horário atual está dentro de qualquer janela de uso definida."""
    time_only = current_time.time()
    
    for start_str, end_str in window_list:
        start_time = datetime.strptime(start_str, "%H:%M").time()
        end_time = datetime.strptime(end_str, "%H:%M").time()
        
        if start_time <= end_time:
            if start_time <= time_only <= end_time:
                return True
        else: 
            if time_only >= start_time or time_only <= end_time:
                return True
    return False

def ingest_data(device_id, delta_wh, timestamp):
    """Envia a energia consumida no intervalo (Delta Wh) para o backend."""
    url = f"{API_BASE_URL}/data/ingest"
    
    payload = {
        "device_id": device_id,
        "kwh": float(delta_wh), 
        "timestamp": timestamp.isoformat() 
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status() 
        return True
    except requests.exceptions.RequestException as e:
        status_code = response.status_code if hasattr(response, 'status_code') else 'N/A'
        response_text = response.text if hasattr(response, 'text') else str(e)
        
        print(f"\n❌ Erro na Ingestão (D{device_id} @ {timestamp.time()}):")
        print(f"  -> Status: {status_code}. Detalhes: {response_text}")
        return False

def generate_delta_kwh(device_id, base_kw, peak_kw, sigma_kw, current_time, date, hour):
    """Calcula a energia (Wh) consumida no intervalo de 60 segundos com lógica de corte."""
    
    # 1. Checa Janelas de Tempo (Regra Rígida de Corte)
    is_active_window = is_time_in_window(current_time, USAGE_WINDOWS.get(device_id, []))
    power_kw = 0.0
    
    is_weekend = date.weekday() >= 5
    is_summer_month = date.month in [1, 2, 12] # 3 meses de verão

    # 2. Lógica de Geração de Potência (kW)
    
    if device_id == 6: 
        if is_active_window:
            power_kw = np.random.normal(peak_kw * -1, sigma_kw) # Geração PV
        else:
            power_kw = 0.0
            
    elif device_id == 5:
        # D5: Piscina - Apenas fins de semana (5h)
        if is_weekend and is_active_window:
            power_kw = np.random.normal(peak_kw, sigma_kw)
        elif is_active_window and not is_weekend:
            power_kw = base_kw # Standby nos dias úteis durante a janela.
        else:
            power_kw = base_kw * 0.1 # Standby fora da janela

    elif device_id == 3:
        # D3: AC - Uso Integral no Verão ou Noturno no Resto do ano
        if is_summer_month:
            # Uso Integral (00:00 - 23:59) - Janela virtualmente ativa o dia todo
            power_kw = np.random.normal(peak_kw, sigma_kw) 
        elif is_active_window:
             # Uso Noturno normal (23:00 - 06:00)
             power_kw = np.random.normal(peak_kw, sigma_kw)
        else:
            power_kw = base_kw # Standby

    elif device_id in [1, 2]:
        # D1 (Iluminação) e D2 (Chuveiro): Uso rígidamente dentro da janela
        if is_active_window:
            power_kw = np.random.normal(peak_kw, sigma_kw)
        else:
            power_kw = 0.0 # Corte total
            
    elif device_id == 4:
        # D4: Cozinha - Uso de Pico dentro da Janela (10 utilizações de 5min = 50min/dia)
        # 50 minutos de uso / 1440 minutos totais = 3.47% do tempo em pico.
        if is_active_window and random.random() < 0.035: 
             power_kw = np.random.normal(peak_kw, sigma_kw)
        else:
             power_kw = base_kw # Standby da geladeira/outros

    # 3. Regra 4: Evento Aleatório (1 em 10.000 pontos)
    if random.random() < 0.0001: 
        power_kw *= 1.8 

    # 4. Conversão para Delta Wh (Escala de valores maiores)
    # Delta KWH = Potência (kW) * (60 segundos / 3600 segundos/hora)
    delta_kwh = power_kw * (INTERVAL_SECONDS / 3600.0) 
    
    # Multiplica por 1000 para converter kWh para Wh
    delta_wh = delta_kwh * 1000 
    
    if device_id != 6:
        return max(delta_wh, 0)
    else:
        return delta_wh # Retorna negativo para geração


# --- FUNÇÃO PRINCIPAL DE BACKFILLING ---

def run_hf_ingestion():
    """Executa o backfilling de 2 anos, com escala Wh e timestamp de 1 minuto, em ordem reversa."""
    
    total_points_est = DAYS_TO_SIMULATE * POINTS_PER_DAY * 6 
    
    print(f"--- ⏳ INICIANDO BACKFILLING REVERSO (2 ANOS / ~{total_points_est:.0f} pontos) ---")
    print(f"Período: {START_DATE.isoformat()} a {END_DATE.isoformat()}")

    # Cria a lista de datas em ordem direta
    date_range = [START_DATE + timedelta(days=i) for i in range(DAYS_TO_SIMULATE + 1)]
    
    total_data_points = []
    
    # 1. Geração dos dados (Processo de Geração Inverso)
    print("\nGerando dados de telemetria... (Pode levar alguns minutos)")
    
    # Itera as datas do PRESENTE para o PASSADO (Reverso)
    for date in tqdm(reversed(date_range), desc="Gerando Histórico por Dia", unit="dia"):
        
        seconds_in_day = 24 * 60 * 60
        
        # Itera os segundos do dia em ordem reversa (fim do dia -> início da madrugada)
        for total_seconds in range(seconds_in_day - INTERVAL_SECONDS, -1, -INTERVAL_SECONDS):
            
            current_timestamp = datetime.combine(date, datetime.min.time()) + timedelta(seconds=total_seconds)
            
            hour = current_timestamp.hour
            minute = current_timestamp.minute
            
            for device_id, profile in DEVICE_PROFILES_HF.items():
                base_kw, peak_kw, sigma_kw, _ = profile
                
                delta_wh = generate_delta_kwh(device_id, base_kw, peak_kw, sigma_kw, current_timestamp, date, hour)
                
                total_data_points.append({
                    'device_id': device_id,
                    'kwh': delta_wh, 
                    'timestamp': current_timestamp
                })

    # Reverte a lista para ingestão na ordem cronológica correta (Passado -> Presente)
    total_data_points.reverse() 

    # 2. Ingestão dos dados (Serializada)
    total_points = len(total_data_points)
    print(f"\nTotal de pontos gerados: {total_points}")
    print("\nIniciando Ingestão serializada (Passado -> Presente).")
    
    ingestion_success = True
    
    for point in tqdm(total_data_points, desc="Ingestão de Telemetria", unit="leituras"):
        if not ingest_data(point['device_id'], point['kwh'], point['timestamp']):
            ingestion_success = False
            break 
        
        #time.sleep(0.0001) 
        
    if ingestion_success:
        print("\n--- ✅ BACKFILLING DE TELEMETRIA (2 ANOS) CONCLUÍDO. ---")
    else:
        print("\n--- ❌ FALHA NA INGESTÃO. Verifique logs acima. ---")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir:
        os.chdir(current_dir)
    
    run_hf_ingestion()