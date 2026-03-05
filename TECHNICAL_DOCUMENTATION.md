# ConectaFisio - Documentação Técnica Completa

**Versão:** 1.0  
**Data:** Janeiro 2024  
**Autor:** Manus AI

---

## Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Modelos de Dados](#modelos-de-dados)
5. [APIs e Endpoints](#apis-e-endpoints)
6. [Segurança e LGPD](#segurança-e-lgpd)
7. [Fluxos Principais](#fluxos-principais)
8. [Extensibilidade](#extensibilidade)

---

## Visão Geral da Arquitetura

A ConectaFisio é uma plataforma de gestão de fisioterapia domiciliar construída com uma arquitetura de três camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│          Dashboards, Agendamento, Prontuário, IA            │
└────────────────────┬────────────────────────────────────────┘
                     │ tRPC + HTTP
┌────────────────────▼────────────────────────────────────────┐
│           Backend Principal (Express + tRPC)                 │
│    Autenticação, Agenda, Prontuário, Avaliações, IA         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP
┌────────────────────▼────────────────────────────────────────┐
│        Microserviço IA (FastAPI + Python)                    │
│    RAG, Deep Learning, Sugestões Clínicas                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Infraestrutura de Dados                          │
│   MySQL 8.0, S3 (Storage), Banco Vetorial (Pinecone)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 19.2.1 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Tailwind CSS | 4.1.14 | Styling |
| shadcn/ui | Latest | Component Library |
| tRPC Client | 11.6.0 | Type-safe API calls |
| Wouter | 3.3.5 | Routing |
| Vite | 7.1.7 | Build Tool |

### Backend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Express | 4.21.2 | Web Framework |
| Node.js | 22.13.0 | Runtime |
| TypeScript | 5.9.3 | Type Safety |
| tRPC Server | 11.6.0 | RPC Framework |
| Drizzle ORM | 0.44.5 | Database ORM |
| MySQL2 | 3.15.0 | Database Driver |
| Zod | 4.1.12 | Schema Validation |
| Jose | 6.1.0 | JWT Handling |

### Microserviço IA

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| FastAPI | 0.104.1 | Web Framework |
| Python | 3.11 | Runtime |
| Pydantic | 2.5.0 | Data Validation |
| Uvicorn | 0.24.0 | ASGI Server |

### Infraestrutura

| Tecnologia | Propósito |
|-----------|----------|
| MySQL 8.0 | Database Principal |
| Nginx | Reverse Proxy |
| Let's Encrypt | SSL/TLS |
| Systemd | Process Management |
| Docker (Opcional) | Containerização |

---

## Estrutura de Diretórios

```
conecta_fisio/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # Páginas principais
│   │   │   ├── Home.tsx
│   │   │   ├── FisioterapeutaDashboard.tsx
│   │   │   ├── PacienteDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BuscaFisioterapeutas.tsx
│   │   │   ├── CadastroFisioterapeuta.tsx
│   │   │   ├── PerfilFisioterapeuta.tsx
│   │   │   ├── AgendarAtendimento.tsx
│   │   │   ├── VisualizarProntuario.tsx
│   │   │   ├── AvaliarAtendimento.tsx
│   │   │   └── SugestoesClinicas.tsx
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Map.tsx
│   │   │   ├── AIChatBox.tsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── lib/
│   │   │   └── trpc.ts              # tRPC client setup
│   │   ├── App.tsx                  # Router principal
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   └── public/                      # Static assets
│
├── server/                          # Backend Express + tRPC
│   ├── routers/                     # tRPC routers
│   │   ├── auth.ts                  # Autenticação
│   │   ├── agendamento.ts           # Agenda inteligente
│   │   ├── prontuario.ts            # Prontuário eletrônico
│   │   ├── avaliacoes.ts            # Avaliações éticas
│   │   └── ia.ts                    # Integração com IA
│   ├── services/                    # Business logic
│   │   ├── appointmentService.ts    # Lógica de agendamento
│   │   ├── googleMapsService.ts     # Google Maps API
│   │   ├── prontuarioService.ts     # Lógica de prontuário
│   │   ├── notificationService.ts   # Notificações
│   │   └── evaluationService.ts     # Avaliações
│   ├── _core/                       # Framework internals
│   │   ├── index.ts                 # Server entry point
│   │   ├── context.ts               # tRPC context
│   │   ├── trpc.ts                  # tRPC setup
│   │   ├── llm.ts                   # LLM integration
│   │   ├── map.ts                   # Maps API
│   │   └── env.ts                   # Environment config
│   ├── audit.ts                     # LGPD audit logging
│   ├── encryption.ts                # Data encryption
│   ├── db.ts                        # Database queries
│   └── routers.ts                   # Main router
│
├── ai_service/                      # Microserviço Python
│   ├── main.py                      # FastAPI app
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Environment template
│
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Drizzle schema
│   └── migrations/                  # Database migrations
│
├── shared/                          # Shared code
│   └── const.ts                     # Constants
│
├── DEPLOY_GUIDE.md                  # Deploy documentation
├── TECHNICAL_DOCUMENTATION.md       # This file
├── README.md                        # Project README
├── todo.md                          # Project TODO
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
└── drizzle.config.ts                # Drizzle config
```

---

## Modelos de Dados

### Users (Autenticação)

```typescript
users {
  id: int (PK)
  openId: string (UNIQUE) // OAuth identifier
  name: string
  email: string
  loginMethod: string
  role: enum['user', 'admin']
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

### Fisioterapeutas

```typescript
fisioterapeutas {
  id: int (PK)
  userId: int (FK -> users)
  crefito: string (UNIQUE) // CREFITO registration
  crefitoValidado: boolean
  especialidades: json
  endereco: string
  raioAtendimento: int // km
  horarioDisponivel: json
  valorHora: decimal
  valorKmAdicional: decimal
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Pacientes

```typescript
pacientes {
  id: int (PK)
  userId: int (FK -> users)
  dataNascimento: date
  endereco: string
  telefone: string
  contatoEmergencia: string
  historicoClinco: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Agendamentos

```typescript
agendamentos {
  id: int (PK)
  fisioterapeutaId: int (FK -> fisioterapeutas)
  pacienteId: int (FK -> pacientes)
  dataHora: timestamp
  duracao: int // minutos
  status: enum['pendente', 'confirmado', 'cancelado', 'concluido']
  localizacao: string
  distancia: decimal // km
  valorTotal: decimal
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Prontuarios

```typescript
prontuarios {
  id: int (PK)
  pacienteId: int (FK -> pacientes)
  fisioterapeutaId: int (FK -> fisioterapeutas)
  avaliacao: text (ENCRYPTED)
  diagnostico: text (ENCRYPTED)
  planoTerapeutico: text (ENCRYPTED)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Evolucoes

```typescript
evolucoes {
  id: int (PK)
  prontuarioId: int (FK -> prontuarios)
  dataEvol: timestamp
  resultado: text (ENCRYPTED)
  proximosPassos: text (ENCRYPTED)
  createdAt: timestamp
}
```

### AuditLogs (LGPD)

```typescript
auditLogs {
  id: int (PK)
  userId: int (FK -> users)
  entityType: string // 'prontuario', 'agendamento', etc
  entityId: int
  action: enum['created', 'updated', 'viewed', 'deleted', 'shared']
  changes: json // Mudanças realizadas
  ipAddress: string
  userAgent: string
  timestamp: timestamp
}
```

### Avaliacoes

```typescript
avaliacoes {
  id: int (PK)
  agendamentoId: int (FK -> agendamentos)
  pacienteId: int (FK -> pacientes)
  fisioterapeutaId: int (FK -> fisioterapeutas)
  nota: int // 1-5
  aspectos: json // {profissionalismo, pontualidade, comunicacao, efetividade}
  recomendacao: boolean
  comentario: text
  anonimo: boolean
  createdAt: timestamp
}
```

---

## APIs e Endpoints

### tRPC Routers

#### Auth Router

```typescript
auth.me()                    // Obter usuário atual
auth.logout()                // Logout
auth.getAuditLogs(userId)    // Obter logs de auditoria (LGPD Art. 18)
```

#### Agendamento Router

```typescript
agendamento.criar({...})              // Criar agendamento
agendamento.listar(filtros)           // Listar agendamentos
agendamento.obter(id)                 // Obter detalhes
agendamento.confirmar(id)             // Confirmar agendamento
agendamento.cancelar(id)              // Cancelar agendamento
agendamento.validarDisponibilidade({...}) // Validar conflitos
```

#### Prontuario Router

```typescript
prontuario.criar({...})               // Criar prontuário
prontuario.obter(id)                  // Obter prontuário
prontuario.adicionarEvolucao({...})   // Adicionar evolução
prontuario.compartilhar({...})        // Compartilhar com token
prontuario.acessarCompartilhado(token) // Acessar via token
```

#### Avaliacoes Router

```typescript
avaliacoes.criar({...})               // Criar avaliação
avaliacoes.obterResumo(fisioterapeutaId) // Resumo de avaliações
avaliacoes.obterSelos(fisioterapeutaId)  // Selos automáticos
avaliacoes.obterRecentes(fisioterapeutaId) // Últimas avaliações
```

#### IA Router

```typescript
ia.obterSugestoesConduta({...})       // Sugestões de conduta
ia.obterPredicaoReabilitacao({...})   // Previsão de sucesso
ia.obterRecomendacoesLeitura({...})   // Recomendações de leitura
ia.obterAnaliseCompleta({...})        // Análise completa
ia.listarArtigos(diagnostico)         // Listar artigos científicos
```

### Microserviço IA (FastAPI)

```
POST /api/v1/sugestoes-conduta        # Sugestões baseadas em evidências
POST /api/v1/predicao-reabilitacao    # Previsão com Deep Learning
POST /api/v1/recomendacoes-leitura    # Recomendações personalizadas
POST /api/v1/analise-completa         # Análise integrada
GET  /api/v1/artigos                  # Listar artigos
GET  /health                          # Health check
```

---

## Segurança e LGPD

### Criptografia de Dados

**Campos Criptografados:**
- Avaliação do prontuário
- Diagnóstico
- Plano terapêutico
- Observações clínicas

**Algoritmo:** AES-256-GCM

```typescript
// Exemplo de uso
const encrypted = encryptField(diagnóstico, encryptionKey);
const decrypted = decryptField(encrypted, encryptionKey);
```

### Auditoria LGPD

Todas as ações em dados sensíveis são registradas:

- **Viewed:** Visualização de prontuário
- **Created:** Criação de registro
- **Updated:** Atualização de dados
- **Deleted:** Exclusão de dados
- **Shared:** Compartilhamento de acesso

**Direito de Acesso (Art. 18):** Usuários podem solicitar histórico completo de acessos aos seus dados via `auth.getAuditLogs()`.

### Controle de Acesso (Policies)

```typescript
// Exemplo: Paciente só vê seu próprio prontuário
if (user.role === 'paciente' && prontuario.pacienteId !== user.id) {
  throw new Error('Acesso negado');
}

// Fisioterapeuta só vê prontuários de seus pacientes
if (user.role === 'fisioterapeuta' && 
    !pacientesFisio.includes(prontuario.pacienteId)) {
  throw new Error('Acesso negado');
}
```

### Validação de CREFITO

- Manual via Dashboard Admin
- Campo `crefitoValidado` marca status
- Fisioterapeuta não pode agendar até validação

---

## Fluxos Principais

### Fluxo de Agendamento

```
1. Paciente busca fisioterapeuta
   ↓
2. Seleciona data/hora disponível
   ↓
3. Sistema valida:
   - Horário disponível?
   - Tempo de viagem suficiente?
   - Conflito com outros agendamentos?
   ↓
4. Se OK: Cria agendamento (status: pendente)
   ↓
5. Sistema envia notificação ao fisioterapeuta
   ↓
6. Fisioterapeuta confirma ou rejeita
   ↓
7. Paciente recebe confirmação
   ↓
8. 24h antes: Lembretes automáticos
```

### Fluxo de Prontuário

```
1. Fisioterapeuta cria prontuário após 1ª sessão
   ↓
2. Preenche: Avaliação, Diagnóstico, Plano Terapêutico
   ↓
3. Sistema criptografa dados sensíveis
   ↓
4. Registra auditoria (criação)
   ↓
5. Após cada sessão: Adiciona evolução
   ↓
6. Paciente pode visualizar prontuário (acesso controlado)
   ↓
7. Compartilhamento via token com expiração
```

### Fluxo de Sugestões Clínicas (IA)

```
1. Fisioterapeuta acessa "Sugestões Clínicas" para paciente
   ↓
2. Sistema envia dados do paciente ao microserviço IA
   ↓
3. IA busca artigos relacionados ao diagnóstico
   ↓
4. RAG gera sugestões de conduta baseadas em evidências
   ↓
5. Deep Learning prediz sucesso da reabilitação
   ↓
6. Recomenda leituras personalizadas
   ↓
7. Fisioterapeuta visualiza com confiança e nível de evidência
```

---

## Extensibilidade

### Adicionar Novo Router

1. Criar arquivo em `server/routers/novo.ts`
2. Definir procedures com `protectedProcedure` ou `publicProcedure`
3. Importar em `server/routers.ts`
4. Adicionar ao `appRouter`

### Adicionar Nova Página React

1. Criar arquivo em `client/src/pages/NovaPagina.tsx`
2. Usar `trpc.novo.useQuery()` para dados
3. Adicionar rota em `client/src/App.tsx`
4. Integrar ao DashboardLayout se necessário

### Integrar Nova API Externa

1. Criar service em `server/services/novaAPI.ts`
2. Chamar do router correspondente
3. Adicionar variáveis de ambiente em `.env`
4. Documentar em TECHNICAL_DOCUMENTATION.md

---

## Conclusão

A ConectaFisio foi arquitetada para ser segura, escalável e extensível. Todos os componentes seguem princípios de LGPD, criptografia de dados e auditoria completa.

Para dúvidas técnicas, consulte a documentação específica de cada componente ou abra uma issue no repositório.

**Última atualização:** Janeiro 2024
