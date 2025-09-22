# 2. Requisitos do Projeto

## Requisitos Funcionais (RF)

As seguintes histórias de usuário definem as funcionalidades do EcoWatt Monitor:

-   **RF01**: Como um novo usuário, eu quero poder me **cadastrar** na plataforma usando meu e-mail e senha para ter acesso ao sistema.
-   **RF02**: Como um usuário cadastrado, eu quero poder fazer **login** no sistema para acessar meu dashboard pessoal.
-   **RF03**: Como um usuário logado, eu quero visualizar um **dashboard principal** com o consumo total de energia em tempo real e gráficos históricos (diário, mensal).
-   **RF04**: Como um usuário logado, eu quero poder **cadastrar dispositivos** (ex: Geladeira, Ar Condicionado, Chuveiro) na plataforma para monitorar o consumo individualmente.
-   **RF05**: Como um usuário logado, eu quero visualizar um gráfico comparativo do **consumo por dispositivo** para identificar os maiores consumidores.
-   **RF06**: Como um usuário logado, eu quero poder **gerar um relatório mensal** de consumo em formato PDF.
-   **RF07**: Como um usuário logado, eu quero poder definir uma **meta mensal de redução de consumo** e acompanhar o progresso no dashboard.

## Requisitos Não Funcionais (RNF)

-   **RNF01 (Desempenho)**: As APIs do backend devem ter um tempo de resposta médio inferior a 300ms. O dashboard deve carregar em menos de 3 segundos.
-   **RNF02 (Segurança)**: As senhas dos usuários devem ser armazenadas de forma criptografada (hash). A comunicação entre frontend e backend deve ocorrer via HTTPS.
-   **RNF03 (Usabilidade)**: A interface deve ser responsiva, adaptando-se a telas de desktop e de dispositivos móveis.
-   **RNF04 (Disponibilidade)**: O sistema deve ter uma disponibilidade de 99.8% (uptime).
-   **RNF05 (Tecnologia)**: O sistema será desenvolvido com React.js (frontend), Node.js/Express (backend) e PostgreSQL (banco de dados).