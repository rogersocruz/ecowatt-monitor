# 1. Definição do Problema e Solução

## ODS 7: Energia Limpa e Acessível

Este projeto está alinhado ao **Objetivo de Desenvolvimento Sustentável (ODS) 7**, que visa "assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todos". Especificamente, o projeto contribui para a meta 7.3: "Até 2030, dobrar a taxa global de melhoria da eficiência energética".

## Problema

O consumo de energia em ambientes urbanos, tanto residenciais quanto comerciais, é frequentemente ineficiente devido à falta de visibilidade sobre os padrões de uso. Sem dados claros sobre quais aparelhos consomem mais energia e em que horários, os usuários não têm ferramentas para tomar decisões informadas que poderiam levar a uma redução significativa no consumo e, consequentemente, nos custos e no impacto ambiental. Essa lacuna de informação é uma barreira direta para o avanço da eficiência energética em nível individual.

## Solução Proposta: EcoWatt Monitor

A solução proposta é o **EcoWatt Monitor**, uma plataforma web (dashboard) que se conecta a fontes de dados de consumo (simuladas, via API) para fornecer uma visão clara e em tempo real do uso de energia.

A plataforma permitirá que os usuários:
1.  Visualizem o consumo total em tempo real, diário, semanal e mensal.
2.  Cadastrem dispositivos ou circuitos individuais para monitoramento específico.
3.  Identifiquem os "vilões" de consumo através de gráficos e relatórios.
4.  Estabeleçam metas de redução de consumo e acompanhem seu progresso.

## Justificativa da Escolha

Um **sistema web com dashboard** foi escolhido por ser a solução mais adequada para a visualização de dados complexos de telemetria. Sua acessibilidade via navegador em múltiplos dispositivos (desktop, mobile) e a capacidade de exibir gráficos interativos em tempo real são ideais para traduzir dados brutos de consumo em inteligência acionável para o usuário final. A arquitetura full-stack (frontend e backend) garante a escalabilidade para futuras integrações com sensores IoT e a segurança no tratamento dos dados do usuário.