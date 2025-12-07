# 1. Definição do Problema e Solução

## Alinhamento com os Objetivos de Desenvolvimento Sustentável (ODS)

Embora o foco central seja o **ODS 7**, a arquitetura atual do EcoWatt Monitor permite endereçar objetivos transversais de sustentabilidade e modernização tecnológica:

### ⚡ ODS 7: Energia Limpa e Acessível
* **Meta 7.3:** "Até 2030, dobrar a taxa global de melhoria da eficiência energética."
* [cite_start]**No Projeto:** O sistema fornece dados granulares de consumo (kWh) por disjuntor, permitindo a identificação imediata de desperdícios que seriam invisíveis na fatura mensal convencional[cite: 527].

### 🔄 ODS 12: Consumo e Produção Responsáveis
* **Meta 12.8:** "Garantir que as pessoas tenham informação relevante para o desenvolvimento sustentável."
* [cite_start]**No Projeto:** O Dashboard apresenta indicadores comparativos ("Mês Atual vs. Mês Anterior") e projeções financeiras, incentivando uma mudança de comportamento baseada em dados reais e não apenas em estimativas[cite: 539, 558].

### 🏗️ ODS 9: Indústria, Inovação e Infraestrutura
* **Meta 9.4:** "Modernizar a infraestrutura para torná-la sustentável."
* [cite_start]**No Projeto:** A solução aplica conceitos de digitalização e IoT (Internet das Coisas) para monitorar infraestruturas elétricas residenciais, utilizando uma arquitetura moderna de microsserviços containerizados[cite: 5, 190].

---

## Problema

O gerenciamento de energia em residências e pequenos comércios enfrenta barreiras significativas devido à **falta de visibilidade**:

1.  **Cegueira de Dados:** Os medidores tradicionais fornecem apenas o consumo acumulado mensal. [cite_start]O usuário não sabe quanto o chuveiro ou o ar-condicionado gastou individualmente[cite: 16].
2.  **Feedback Tardio:** A notificação do excesso de consumo chega apenas com a conta de luz, quando já é tarde para economizar.
3.  [cite_start]**Dificuldade de Diagnóstico:** Identificar aparelhos defeituosos ou com consumo "vampiro" (standby) é difícil sem monitoramento em tempo real[cite: 579].

---

## Solução Construída: EcoWatt Monitor

O **EcoWatt Monitor** é uma plataforma *full-stack* operacional que processa telemetria simulada para entregar inteligência energética.

### Funcionalidades Implementadas
A solução atual já entrega:

1.  [cite_start]**Monitoramento em Tempo Real:** Ingestão contínua de dados de consumo (simulados via Python) com visualização instantânea no Frontend[cite: 546, 583].
2.  [cite_start]**Detalhamento por Disjuntor:** Monitoramento individual de cargas específicas (Ex: Ar Condicionado, Chuveiro, Iluminação), permitindo isolar os "vilões" do consumo[cite: 533, 560].
3.  [cite_start]**Projeção Financeira e Comparativa:** Cálculo automático do custo acumulado (baseado em tarifa configurável) e comparação percentual com o ciclo anterior para validar economias[cite: 520, 549].
4.  [cite_start]**Monitoramento de Status (Watchdog):** Sistema visual que alerta se um disjuntor está "Online" ou "Offline" com base na recência do envio de dados[cite: 526, 543].

---

## Justificativa da Arquitetura

A estrutura técnica do projeto foi desenhada para garantir robustez e manutenibilidade:

* [cite_start]**Docker & Microsserviços:** A separação entre Frontend (React), Backend (Node.js) e Banco de Dados (PostgreSQL) em containers garante que o ambiente de desenvolvimento seja replicável e isolado[cite: 5].
* [cite_start]**React & Material UI:** Proporcionam uma interface responsiva e rápida, essencial para a visualização de dados críticos em tempo real[cite: 200].
* [cite_start]**PostgreSQL:** Escolhido pela robustez no armazenamento de séries temporais de telemetria, garantindo a integridade dos dados históricos para análises de longo prazo[cite: 60].