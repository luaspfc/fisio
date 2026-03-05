# ConectaFisio - Project TODO

## FASE 1 — Setup, Autenticação e Segurança LGPD
- [x] Estender schema com tabelas: AuditLog
- [x] Implementar helper Auditable para rastreamento automático
- [x] Criar Model AuditLog (imutável)
- [ ] Implementar Policies: FisioterapeutaPolicy, ProntuarioPolicy
- [ ] Criar seed de usuários admin
- [x] Testes de auditoria automática
- [x] Criar auth router com suporte a LGPD Art. 18 (acesso aos próprios logs)

## FASE 2 — Agenda Inteligente
- [x] Criar tabelas: Agendamento, Fisioterapeuta, Paciente
- [x] Implementar AppointmentService com validação de deslocamento
- [x] Integrar Google Maps API (Distance Matrix) com fallback Haversine
- [x] Implementar validação de conflitos para prevenir overbooking
- [x] Validar conflitos de horário com tempo de deslocamento
- [x] Testes de prevenção de conflitos
- [x] Criar agendamento router com procedures tRPC

## FASE 3 — Prontuário Eletrônico
- [x] Criar tabelas: Prontuario, Evolucao, Anexo, ShareToken
- [x] Implementar criptografia de campos sensíveis (AES-256-GCM)
- [x] Criar ProntuarioService com controle de acesso
- [x] Implementar Policies de acesso baseadas em papéis
- [x] Criar Service de compartilhamento com tokens
- [x] Testes de criptografia e acesso
- [x] Criar prontuário router com procedures tRPC

## FASE 4 — Views React e Fluxos Principais
- [x] Dashboard do Fisioterapeuta (com agenda e prontuários)
- [x] Dashboard do Admin (validação CREFITO com tabs)
- [x] Dashboard do Paciente (com agenda e prontuário)
- [x] Página de busca pública de fisioterapeutas
- [x] Perfil público do profissional (detalhe com avaliações)
- [x] Formulário de cadastro de fisioterapeuta (multi-step)
- [x] Página de agendamento (multi-step com horários)
- [x] Página de visualização de prontuário com auditoria LGPD
- [x] Integração de todas as rotas no App.tsx

## FASE 5 — Automação e Avaliação Ética
- [x] Criar NotificationService com templates Email/WhatsApp/SMS
- [x] Implementar lembretes automáticos (24h antes)
- [x] Criar EvaluationService com validação ética
- [x] Implementar selos automáticos de qualidade (sem ranking público)
- [x] Criar página de avaliação (multi-step com aspectos)
- [x] Criar avaliacoes router com procedures tRPC
- [x] Integrar rota /avaliar no App.tsx
- [x] Implementar anonimato nas avaliações

## FASE 6 — Suporte à Decisão Clínica (RAG + Deep Learning)
- [x] Microserviço Python com FastAPI
- [x] Banco de dados vetorial (Mock - pronto para Pinecone/Milvus)
- [x] Pipeline de ingestão de artigos científicos (mock)
- [x] Motor de busca (Retrieval) com filtros por diagnóstico
- [x] Motor de geração (RAG com templates - pronto para LLM)
- [x] Modelo preditivo (Deep Learning - Mock - pronto para TensorFlow/PyTorch)
- [x] Integração com backend principal (IA Router tRPC)
- [x] Página de Sugestões Clínicas com 3 abas
- [x] Integração da rota /sugestoes-clinicas no App.tsx

## FASE 7 — Deploy e Documentação
- [x] Guia de deploy em VPS Linux (DEPLOY_GUIDE.md)
- [x] Configuração Nginx + SSL (Let's Encrypt)
- [x] Variáveis de ambiente (.env.example)
- [x] Backup automático com cron
- [x] Documentação técnica completa (TECHNICAL_DOCUMENTATION.md)
- [x] Documentação de uso para usuários (USER_GUIDE.md)
- [x] Troubleshooting e checklist de deploy
- [x] Monitoramento e logs


## FASE 8 — Integração com LLM Real (GPT-4/Claude)
- [ ] Integrar OpenAI GPT-4 ou Anthropic Claude
- [ ] Implementar RAG com LLM real para sugestões clínicas
- [ ] Adicionar streaming de respostas
- [ ] Cache de prompts para otimização
- [ ] Testes de qualidade das sugestões
- [ ] Documentação de configuração de API keys


## FASE 8 — Integração Hotmart (Assinatura R$ 99,99/mês)
- [x] Integrar API Hotmart para gerenciar assinaturas (hotmartService.ts)
- [x] Criar sistema de webhooks para notificações de pagamento
- [x] Implementar verificação de assinatura ativa antes de agendamentos
- [x] Criar dashboard de pagamentos e gerenciamento (pagamentosRouter.ts)
- [x] Adicionar página de checkout e gerenciamento de assinatura (GerenciarAssinatura.tsx)
- [x] Adicionar campos hotmartCustomerId e assinaturaAtiva ao schema
- [x] Integrar rota /gerenciar-assinatura no App.tsx
- [ ] Testes de integração com Hotmart
- [ ] Documentar configuração de API keys Hotmart
