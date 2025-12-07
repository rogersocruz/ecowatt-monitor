# 2. Requisitos do Projeto

## Requisitos Funcionais (RF)

As seguintes funcionalidades já estão operacionais no sistema EcoWatt Monitor:

-   **RF01 - Ingestão de Telemetria**: O sistema deve receber dados de consumo (potência/energia) enviados por sensores ou simuladores via API REST (`POST /api/data/ingest`), garantindo a persistência em banco de dados relacional.
-   **RF02 - Dashboard Analítico**: O sistema deve apresentar um painel principal exibindo:
    -   Consumo acumulado no ciclo atual (kWh).
    -   Estimativa de custo financeiro (R$) baseada em tarifa configurável.
    -   Comparativo percentual de consumo entre o mês atual e o anterior.
-   **RF03 - Monitoramento por Disjuntor**: O sistema deve detalhar o consumo individual de cada circuito/disjuntor cadastrado, exibindo a última leitura de potência (kW) e a média diária.
-   **RF04 - Indicador de Status (Watchdog)**: O sistema deve identificar visualmente se um dispositivo está "Online" (verde) ou "Offline" (vermelho) com base na recência do recebimento de dados (tempo limite de 10 segundos).
-   **RF05 - Simulação de Carga**: O sistema deve possuir um módulo simulador capaz de gerar perfis de carga sintéticos (ex: Ar Condicionado, Chuveiro, Geração Solar) para testes de validação e demonstração.

## Requisitos Não Funcionais (RNF)

Restrições e qualidades técnicas implementadas na arquitetura atual:

-   **RNF01 (Stack Tecnológica)**: A solução deve ser desenvolvida utilizando a stack Javascript (React.js no Frontend, Node.js/Express no Backend) e Python para scripts de simulação.
-   **RNF02 (Infraestrutura)**: Todos os componentes do sistema (Web, API, Banco de Dados) devem ser executados em containers isolados via Docker e orquestrados pelo Docker Compose.
-   **RNF03 (Persistência)**: O banco de dados deve utilizar PostgreSQL, garantindo a integridade de dados de séries temporais e suportando operações de *Upsert* (inserção ou atualização) para evitar duplicidade de leituras.
-   **RNF04 (Tempo de Resposta)**: O Dashboard deve atualizar os dados automaticamente a cada 2 segundos (polling) para fornecer uma experiência de "tempo real" ao usuário.
-   **RNF05 (Interoperabilidade)**: A comunicação entre os módulos deve ser realizada estritamente via protocolo HTTP/JSON.