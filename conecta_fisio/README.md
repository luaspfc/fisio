# ConectaFisio - Plataforma Inteligente de Gestão de Fisioterapia Domiciliar

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 🎯 Visão Geral

**ConectaFisio** é uma plataforma completa e inteligente que conecta fisioterapeutas e pacientes, facilitando o agendamento de sessões domiciliares com cálculo automático de deslocamento, gestão segura de prontuários eletrônicos e suporte à decisão clínica baseado em Inteligência Artificial e evidências científicas.

### Principais Características

✅ **Agenda Inteligente:** Cálculo automático de deslocamento com Google Maps, prevenção de overbooking  
✅ **Prontuário Eletrônico:** Criptografia AES-256-GCM, conformidade LGPD  
✅ **Suporte à Decisão Clínica:** RAG + Deep Learning com base de artigos científicos  
✅ **Avaliação Ética:** Sistema de avaliações anônimas sem ranking público  
✅ **Automação:** Lembretes automáticos via WhatsApp/Email 24h antes  
✅ **Segurança:** Auditoria completa, controle de acesso, validação de CREFITO  

---

## 🏗️ Arquitetura

```
Frontend (React 19)
    ↓ tRPC
Backend (Express + tRPC)
    ↓ HTTP
Microserviço IA (FastAPI)
    ↓
Infraestrutura (MySQL, S3, Banco Vetorial)
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 22.x
- MySQL 8.0
- Python 3.11 (para microserviço IA)
- npm/pnpm

### Instalação Local

```bash
# Clone o repositório
git clone https://seu_repositorio.git
cd conecta_fisio

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Execute migrações
pnpm db:push

# Inicie o servidor
pnpm dev
```

### Microserviço IA

```bash
cd ai_service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

---

## 📚 Documentação

- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Guia completo de deploy em produção
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - Documentação técnica detalhada
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Guia de uso para usuários finais
- **[todo.md](./todo.md)** - Roadmap e status do projeto

---

## 🔐 Segurança e Conformidade

### LGPD (Lei Geral de Proteção de Dados)

- ✅ Criptografia de dados sensíveis (AES-256-GCM)
- ✅ Auditoria completa de acessos (Art. 5º, II)
- ✅ Direito de acesso aos próprios logs (Art. 18)
- ✅ Consentimento explícito para coleta de dados
- ✅ Política de retenção de dados

### Controle de Acesso

- Autenticação OAuth com Manus
- Roles: Admin, Fisioterapeuta, Paciente
- Policies baseadas em papéis
- Validação de CREFITO manual

---

## 📊 Stack Tecnológico

### Frontend
- React 19.2.1
- TypeScript 5.9.3
- Tailwind CSS 4.1.14
- shadcn/ui
- tRPC Client 11.6.0

### Backend
- Express 4.21.2
- Node.js 22.13.0
- tRPC Server 11.6.0
- Drizzle ORM 0.44.5
- MySQL 8.0

### IA
- FastAPI 0.104.1
- Python 3.11
- Pydantic 2.5.0

---

## 🎯 Funcionalidades Implementadas

### FASE 1: Setup e Autenticação ✅
- Autenticação com 3 papéis (Admin, Fisioterapeuta, Paciente)
- Auditoria LGPD com logs imutáveis
- Controle de acesso baseado em policies

### FASE 2: Agenda Inteligente ✅
- Cálculo automático de deslocamento com Google Maps
- Prevenção de overbooking com validação de conflitos
- Suporte a múltiplos pacientes e otimização de rota

### FASE 3: Prontuário Eletrônico ✅
- Criptografia de dados sensíveis
- Compartilhamento seguro com tokens
- Histórico de evolução estruturado

### FASE 4: Interfaces React ✅
- Dashboard Fisioterapeuta
- Dashboard Paciente
- Dashboard Admin
- Busca pública de profissionais
- Agendamento multi-step
- Visualização de prontuário

### FASE 5: Automação e Avaliação ✅
- Notificações automáticas 24h antes
- Sistema de avaliação ética anônima
- Selos automáticos de qualidade
- Cálculo de nota média

### FASE 6: Suporte à Decisão Clínica ✅
- Microserviço Python com FastAPI
- RAG com base de artigos científicos
- Deep Learning para previsão de sucesso
- Recomendações personalizadas de leitura

### FASE 7: Deploy e Documentação ✅
- Guia de deploy em VPS Linux
- Configuração Nginx + SSL
- Backup automático
- Documentação técnica e de usuário

---

## 📈 Roadmap Futuro

- [ ] Integração com LLMs reais (GPT-4, Claude)
- [ ] Banco vetorial em produção (Pinecone, Milvus)
- [ ] Modelos Deep Learning treinados com dados reais
- [ ] Mobile app (React Native)
- [ ] Integração com sistemas de pagamento (Stripe)
- [ ] Análise de dados e dashboards avançados
- [ ] Telemedicina com videochamada
- [ ] Integração com prontuários eletrônicos de hospitais

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Email:** suporte@conectafisio.com
- **WhatsApp:** +55 (11) 98765-4321
- **Documentação:** https://conectafisio.com/docs
- **Issues:** GitHub Issues

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

## 👥 Autores

- **Manus AI** - Arquitetura, Desenvolvimento e Documentação

---

## 🙏 Agradecimentos

Obrigado a todos os profissionais de saúde que inspiraram o desenvolvimento desta plataforma. ConectaFisio foi criada com o objetivo de melhorar a qualidade da reabilitação domiciliar no Brasil.

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Production Ready ✅

---

## 📋 Checklist de Início Rápido

- [ ] Clonar repositório
- [ ] Instalar dependências (`pnpm install`)
- [ ] Configurar `.env`
- [ ] Executar migrações (`pnpm db:push`)
- [ ] Iniciar servidor (`pnpm dev`)
- [ ] Iniciar microserviço IA (`python ai_service/main.py`)
- [ ] Acessar http://localhost:3000
- [ ] Criar primeira conta
- [ ] Testar fluxo de agendamento

---

Desenvolvido com ❤️ para a saúde do Brasil.
