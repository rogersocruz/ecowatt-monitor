# 3. Casos de Uso e Fluxos de Utilização

Este documento descreve como o usuário interage com o **EcoWatt Monitor** para realizar tarefas de gestão energética no seu dia a dia.

## 👤 Perfil do Usuário
* **Ator:** Proprietário Residencial ou Gestor de Pequeno Comércio.
* **Objetivo:** Reduzir custos, identificar desperdícios e monitorar o status de equipamentos.

---

## 🛠️ Fluxo 1: Monitoramento em Tempo Real (O que está ligado?)
**Cenário:** O usuário chega em casa e quer saber se esqueceu algo ligado (ex: Ar Condicionado ou Ferro de Passar).

1.  **Acesso:** O usuário abre o EcoWatt Monitor no navegador/tablet.
2.  **Visualização Rápida:** Ele rola a tela até a seção **"Detalhamento por Disjuntor"**.
3.  **Verificação de Status (Watchdog):**
    * Ele observa as "luzes de status" (círculos coloridos) no canto de cada card.
    * 🟢 **Verde:** O equipamento está **Online** e consumindo energia agora (dados recebidos < 10s).
    * 🔴 **Vermelho:** O equipamento está **Desligado/Offline** (sem consumo ou dados antigos).
4.  **Leitura Instantânea:** No card do "Ar Condicionado", ele vê a "Última Leitura" indicando `1.2 kW`.
5.  **Ação:** O usuário confirma que o aparelho ficou ligado indevidamente e vai até o cômodo desligá-lo.

---

## 💰 Fluxo 2: Gestão Financeira e Previsão (Vou estourar o orçamento?)
**Cenário:** Estamos no dia 15 do mês e o usuário quer saber se a conta de luz virá alta.

1.  **Dashboard Principal:** O usuário foca nos Cards de Resumo no topo da tela.
2.  **Checagem de Custo:** Ele lê o card **"Fatura Estimada"**.
    * *Valor:* `R$ 450,00` (Custo acumulado até o momento).
3.  **Comparativo Histórico:** Ele olha para o card **"Comparativo Mês Anterior"**.
    * *Indicador:* ⬆️ `+15%` (Vermelho).
    * *Insight:* "Estou gastando 15% a mais do que no mês passado nesta mesma época."
4.  **Projeção:** Ele verifica o card de cada disjuntor para ver a **"Projeção Mês (30d)"** e descobre que o "Chuveiro" está projetado para gastar `R$ 150,00` sozinho.
5.  **Decisão:** O usuário decide reduzir o tempo de banho na próxima semana para compensar a alta.

---

## 🔎 Fluxo 3: Identificação de "Vilões" (Quem gasta mais?)
**Cenário:** O usuário quer entender por que a conta subiu, mas não sabe qual aparelho é o culpado.

1.  **Análise Detalhada:** O usuário percorre os cards de disjuntores.
2.  **Comparação de Consumo:** Ele compara o valor **"Consumo Ciclo Atual"** (kWh) entre os dispositivos.
    * *Disjuntor 1 (Iluminação):* 25 kWh
    * *Disjuntor 3 (Ar Condicionado):* **340 kWh**
3.  **Análise de Custo Individual:** Ele olha o rodapé do card do Ar Condicionado: **"Custo Acumulado: R$ 289,00"**.
4.  **Conclusão:** O sistema evidencia que o Ar Condicionado representa mais de 60% da fatura total, permitindo que o usuário foque seus esforços de economia onde realmente importa.

---

## 🧪 Fluxo 4: Simulação de Cenários (Developer/Demonstração)
**Cenário:** Testar como o sistema reage a uma mudança brusca de carga (ex: Ligar todas as máquinas da fábrica/casa).

1.  **Execução do Simulador:** O usuário técnico abre a interface Python (`ecowatt_simulator.py`).
2.  **Ação Manual:** Clica nas caixas de seleção "ON" para todos os 6 dispositivos simultaneamente e ajusta os sliders de potência para o máximo.
3.  **Observação no Frontend:**
    * Imediatamente, todos os cards no Dashboard mudam o status para **Verde (Online)**.
    * O valor de **"Consumo Mês Atual"** começa a subir rapidamente a cada atualização (2s).
    * O gráfico de "Última Leitura" dispara.
4.  **Validação:** O sistema prova sua capacidade de processar múltiplos fluxos de dados concorrentes e atualizar a interface em tempo real sem travamentos.