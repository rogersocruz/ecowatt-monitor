# ⚡ EcoWatt Monitor

![EcoWatt Dashboard](image_9b6d1b.png)

> **Projeto de Engenharia de Software - Monitoramento de Consumo Energético (ODS 7)**
## 📖 Visão Geral

O **EcoWatt Monitor** é uma plataforma *full-stack* de inteligência energética projetada para modernizar a gestão de consumo em residências e pequenos comércios. Através da ingestão de telemetria simulada e processamento em tempo real, o sistema transforma dados brutos de disjuntores em métricas financeiras e operacionais, permitindo que o usuário identifique desperdícios invisíveis a olho nu.

### Alinhamento com os Objetivos de Desenvolvimento Sustentável (ODS)

O projeto foi concebido sob a diretriz do **ODS 7 da ONU (Energia Limpa e Acessível)**, especificamente para contribuir com a meta 7.3: *dobrar a taxa global de melhoria da eficiência energética até 2030*. No entanto, a solução atua de forma transversal em outros objetivos críticos:

* **⚡ ODS 7 - Eficiência Energética:** Democratiza o acesso a dados de consumo detalhados, permitindo que usuários reduzam sua demanda energética sem sacrificar o conforto.
* **🔄 ODS 12 - Consumo Responsável:** Ataca a cultura do desperdício ao fornecer ferramentas de definição de metas (orçamento energético) e alertas de desvio, incentivando a mudança comportamental.
* **🌍 ODS 13 - Ação Climática:** Ao promover a redução do consumo de kWh, o sistema contribui diretamente para a diminuição da pegada de carbono (Scope 2 emissions), reduzindo a demanda sobre matrizes energéticas não-renováveis em horários de pico.
* **🏗️ ODS 9 - Inovação e Infraestrutura:** Propõe a digitalização da infraestrutura elétrica convencional ("quadro de força analógico") através de uma arquitetura de IoT e Software moderna e escalável.

O EcoWatt Monitor não apenas mede energia; ele empodera o usuário para ser um agente ativo na sustentabilidade.

---

## 🚀 Tecnologias Utilizadas

O projeto está totalmente containerizado, facilitando a execução em ambiente de desenvolvimento.

| Escopo | Tecnologia | Status Atual |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) + Material UI (MUI v7) | ✅ Implementado |
| **Backend** | Node.js (Express) | ✅ Implementado |
| **Database** | PostgreSQL 16 (Docker) | ✅ Implementado |
| **Simulador** | Python 3 (Requests/Pandas) | ✅ Implementado (GUI + Histórico) |
| **Infra** | Docker Compose | ✅ Orquestração Local |

---

## 📅 Processo de Desenvolvimento (Scrum)

O projeto segue a metodologia Scrum com sprints quinzenais. Abaixo, o status das entregas conforme o cronograma da disciplina:

### ✅ TP1 - Definição do Problema e Planejamento
*Foco: Análise inicial, requisitos e setup.*
- [x] Definição do ODS 7 como norteador.
- [x] Levantamento de Requisitos Funcionais e Não Funcionais.
- [x] Diagrama de Casos de Uso.
- [x] Configuração do Repositório.
- **Documentação:** [Ver Definição do Problema](./docs/01-Definicao-do-Problema.md) | [Ver Requisitos](./docs/02-Requisitos.md)

### ✅ TP2 - Projeto de Software
*Foco: Arquitetura e Modelagem.*
- [x] Definição da Stack Tecnológica (React/Node/Postgres).
- [x] Modelagem do Banco de Dados (Tabelas `devices` e `med_dia`).
- [x] Configuração do ambiente Docker.

### ✅ TP3 - Sprint de Desenvolvimento (MVP)
*Foco: Primeiro entregável funcional.*
- [x] Backend API rodando com rotas de ingestão (`/api/data/ingest`).
- [x] Banco de Dados persistindo dados de telemetria.
- [x] Frontend base criado com Vite.

### ✅ TP4 - Desenvolvimento + Plano de Testes
*Foco: Evolução e Qualidade.*
- [x] **Dashboard Interativo:** Cálculo de consumo mensal, projeção financeira e status online/offline dos disjuntores.
- [x] **Simulador Avançado:** Script Python com interface gráfica (Tkinter) e gerador de histórico.
- [x] Integração completa: Simulador -> Backend -> Banco -> Frontend.

### 🚧 TP5 - Desenvolvimento + Execução de Testes
*Foco: Validação e Refinamento.*
- [x] Refinamento das telas de Relatórios.
- [x] Execução de testes de carga no banco de dados.

### 📝 TP6 - Entrega Final
*Foco: Produto Completo.*
- [x] Solução final integrada.
- [x] Vídeo demonstrativo completo.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
* Docker e Docker Compose instalados.
* Node.js e npm
* Python 3.x (para o simulador).

### 1. Subir a Aplicação (Web + Banco)
Na raiz do projeto, execute:

```bash
docker-compose up --build
```
depois em outro terminal:

```bash
cd /ecowatt-frontend
npm run dev
```

O Backend estará disponível em: http://localhost:3000

O Frontend estará disponível em: http://localhost:5173

### 2. Executar o Simulador de Dados
Para ver os gráficos se moverem, é necessário enviar dados. Abra um novo terminal:

Bash
```bash
cd ecowatt-simulator
.venv/Scripts/activate
python ecowatt_simulator.py
```
Uma janela abrirá permitindo ligar/desligar disjuntores e controlar a potência em tempo real.

### 📂 Estrutura do Repositório
```bash
ecowatt-monitor/
├── docs/                  # Documentação acadêmica
├── ecowatt-backend/       # API Node.js e Configuração do DB
├── ecowatt-frontend/      # Interface React (Vite)
│   ├── src/pages/         # Dashboard, Calendar, Reports
│   └── src/components/    # Layout e Cards
├── ecowatt-simulator/     # Scripts Python (Gerador de Carga)
├── docker-compose.yml     # Orquestração dos containers
└── README.md              # Este arquivo
```
**👨‍💻 Autor**
Desenvolvido por Roger Cruz como parte da disciplina de Engenharia de Software.