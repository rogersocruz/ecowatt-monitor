import datetime
import random
import math
from tqdm import tqdm # pip install tqdm

# --- CONFIGURAÇÃO ---
OUTPUT_FILE = "history_seed.sql"
DAYS_BACK = 365
INTERVAL_MINUTES = 1 # Alta resolução

# Perfis de Consumo (Simulação de Comportamento Real)
def get_device_power(dev_id, date_time):
    hour = date_time.hour
    minute = date_time.minute
    month = date_time.month
    
    # Adiciona um ruído aleatório para parecer real (+- 10%)
    noise = random.uniform(0.9, 1.1)

    # Lógica de Consumo por Dispositivo
    if dev_id == 1: # Iluminação (Mais à noite)
        if 18 <= hour <= 23: return 1.2 * noise
        return 0.0

    elif dev_id == 2: # Chuveiro (Picos manhã/noite)
        # 15 min banho as 07:00 e 19:00
        if (hour == 7 or hour == 19) and 0 <= minute <= 15:
            return 12.0 * noise
        return 0.0

    elif dev_id == 3: # Ar Condicionado (Sazonalidade + Dia)
        # Mais uso no verão (Dez, Jan, Fev)
        is_summer = month in [12, 1, 2]
        base = 6.0 if is_summer else 0.0
        
        # Liga das 22h as 06h (dormir) ou tarde quente
        if is_summer and (hour >= 22 or hour <= 6): return base * noise
        return 0.0

    elif dev_id == 4: # Cozinha (Geladeira constante + Microondas)
        base_fridge = 0.15 # Geladeira liga/desliga
        if random.random() > 0.7: return 2.0 # Pico microondas/forno
        return base_fridge

    elif dev_id == 5: # Piscina (Filtro durante o dia)
        if 10 <= hour <= 14: return 8.0 * noise
        return 0.0

    elif dev_id == 6: # Solar PV (Curva de Sino durante o dia)
        if 6 <= hour <= 18:
            # Simula parábola solar (pico as 12h)
            x = hour + (minute/60)
            peak = 35.0
            # Função quadrática simples para curva solar
            generation = peak * math.sin((x - 6) * math.pi / 12)
            if generation < 0: generation = 0
            return -generation * noise # Negativo pois gera energia
        return 0.0
    
    return 0.0

def generate_sql():
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=DAYS_BACK)
    
    total_intervals = int((end_date - start_date).total_seconds() / (INTERVAL_MINUTES * 60))
    
    print(f"--- 🏭 Gerando histórico para {DAYS_BACK} dias ({total_intervals} intervalos) ---")
    print(f"Total estimado de linhas: {total_intervals * 6}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- Carga Massiva de Histórico EcoWatt\n")
        f.write("TRUNCATE TABLE med_dia;\n") # Limpa dados antigos para não duplicar
        f.write("BEGIN;\n")
        
        # Buffer para escrita em lotes (muito mais rápido)
        batch_size = 5000
        values_buffer = []
        
        current_time = start_date
        
        # Barra de progresso
        for _ in tqdm(range(total_intervals)):
            timestamp_str = current_time.strftime('%Y-%m-%d %H:%M:%S')
            
            for dev_id in range(1, 7):
                kwh = get_device_power(dev_id, current_time)
                # Formata valor SQL: (id, 'timestamp', valor)
                values_buffer.append(f"({dev_id}, '{timestamp_str}', {kwh:.4f})")
            
            # Escreve no arquivo a cada lote
            if len(values_buffer) >= batch_size:
                f.write(f"INSERT INTO med_dia (id_disj, timestamp, valor) VALUES {','.join(values_buffer)};\n")
                values_buffer = []
            
            current_time += datetime.timedelta(minutes=INTERVAL_MINUTES)
            
        # Escreve o restante
        if values_buffer:
            f.write(f"INSERT INTO med_dia (id_disj, timestamp, valor) VALUES {','.join(values_buffer)};\n")
            
        f.write("COMMIT;\n")
        
    print(f"\n✅ Arquivo '{OUTPUT_FILE}' gerado com sucesso!")
    print("👉 Próximo passo: Importar para o Docker.")

if __name__ == "__main__":
    generate_sql()