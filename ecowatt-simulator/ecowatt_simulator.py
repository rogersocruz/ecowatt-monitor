import tkinter as tk
from tkinter import ttk
import requests
from datetime import datetime
import threading
import time

# --- CONFIGURAÇÃO TÉCNICA ---
API_BASE_URL = "http://localhost:3000/api"

DEVICE_PROFILES = {
    1: {"name": "D1 - Iluminação Sala", "base": 1.2},
    2: {"name": "D2 - Chuveiro Quente", "base": 12.0},
    3: {"name": "D3 - Ar Condicionado Q/F", "base": 6.0},
    4: {"name": "D4 - Cozinha (Tomadas)", "base": 4.0},
    5: {"name": "D5 - Piscina (Motor/Filtro)", "base": 8.0},
    6: {"name": "D6 - Geração PV", "base": -35.0},
}

class EcoWattIndustrialGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("EcoWatt - Controle de Precisão Telemetria")
        self.root.geometry("650x850")
        
        self.states = {}      # Checkboxes (BooleanVar)
        self.kwh_values = {}  # Valores numéricos (DoubleVar)
        self.running = False  # Estado do loop
        self.interval = tk.IntVar(value=5)

        self.setup_ui()
        
    def setup_ui(self):
        ttk.Label(self.root, text="🕹️ SIMULADOR", font=('Consolas', 14, 'bold')).pack(pady=15)
        
        container = ttk.Frame(self.root)
        container.pack(fill="both", expand=True, padx=20)

        for dev_id, info in DEVICE_PROFILES.items():
            frame = ttk.LabelFrame(container, text=f" ID: {dev_id} | {info['name']} ", padding=10)
            frame.pack(fill="x", pady=5)
            
            # Switch Ativo
            self.states[dev_id] = tk.BooleanVar(value=True)
            ttk.Checkbutton(frame, text="ON", variable=self.states[dev_id]).pack(side="left")
            
            # Valor Numérico (DoubleVar sincronizado)
            # Para o PV (ID 6) permitimos range negativo no futuro, mas slider aqui é 0 a 100
            start_val = info["base"] if info["base"] > 0 else 0
            self.kwh_values[dev_id] = tk.DoubleVar(value=start_val)

            # Sincronização: Entry -> Slider
            entry = ttk.Entry(frame, textvariable=self.kwh_values[dev_id], width=8)
            entry.pack(side="right", padx=5)

            # Sincronização: Slider -> Entry (Limitado a 100)
            slider = ttk.Scale(frame, from_=0, to=100, variable=self.kwh_values[dev_id], orient="horizontal")
            slider.pack(side="right", fill="x", expand=True, padx=10)

        # --- CONTROLE DE LOOP ---
        control_frame = ttk.LabelFrame(self.root, text=" Automação Industrial ", padding=15)
        control_frame.pack(fill="x", padx=20, pady=20)
        
        ttk.Label(control_frame, text="Intervalo (s):").pack(side="left", padx=5)
        ttk.Entry(control_frame, textvariable=self.interval, width=5).pack(side="left", padx=5)

        self.btn_toggle = ttk.Button(control_frame, text="INICIAR LOOP", command=self.toggle_loop)
        self.btn_toggle.pack(side="left", padx=20)
        
        ttk.Button(control_frame, text="FORÇAR ENVIO AGORA", command=self.manual_send).pack(side="right")

    def toggle_loop(self):
        if not self.running:
            self.running = True
            self.btn_toggle.config(text="PARAR LOOP")
            threading.Thread(target=self.automation_loop, daemon=True).start()
        else:
            self.running = False
            self.btn_toggle.config(text="INICIAR LOOP")

    def automation_loop(self):
        while self.running:
            self.manual_send()
            time.sleep(self.interval.get())

    def manual_send(self):
        threading.Thread(target=self.worker_ingest, daemon=True).start()

    def worker_ingest(self):
        for dev_id in DEVICE_PROFILES.keys():
            if self.states[dev_id].get():
                try:
                    val = self.kwh_values[dev_id].get()
                    # Inversão para o ID 6 (PV) se necessário, ou enviar conforme GUI
                    if dev_id == 6 and val > 0: val = -val
                    
                    payload = {
                        "device_id": dev_id,
                        "kwh": float(val),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    r = requests.post(f"{API_BASE_URL}/data/ingest", json=payload, timeout=2)
                    if r.status_code == 201:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] D{dev_id} @ {val} kWh")
                except Exception as e:
                    print(f"Erro D{dev_id}: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = EcoWattIndustrialGUI(root)
    root.mainloop()