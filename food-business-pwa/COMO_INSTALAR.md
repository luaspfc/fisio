# 🍳 Assistente Culinária — Guia de Instalação

## O que é?
Um aplicativo de celular para ajudar no gerenciamento do seu negócio de alimentos caseiros. Funciona como uma assistente virtual que você pode conversar por voz!

---

## Pré-requisitos

- Node.js 18+ instalado no servidor/computador
- Uma chave de API da Anthropic (Claude)
- Domínio com HTTPS (para produção) ou acesso local

---

## Passo a passo para instalar

### 1. Configurar a chave de API

```bash
# Copie o arquivo de configuração
cp .env.example .env

# Edite e coloque sua chave
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui
```

> 💡 Crie sua chave em: https://console.anthropic.com/

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### 4. Rodar em produção

```bash
# Construir o app
npm run build

# Iniciar o servidor
npm start
```

O servidor roda na porta 3001 por padrão.

---

## Instalando no celular

### Android (Chrome):
1. Abra o app no Chrome
2. Toque nos **3 pontinhos** no canto superior direito
3. Selecione **"Adicionar à tela inicial"**
4. Confirme com **"Adicionar"**

### iPhone (Safari):
1. Abra o app no Safari
2. Toque no **botão de compartilhar** (quadrado com seta)
3. Selecione **"Adicionar à Tela de Início"**
4. Confirme com **"Adicionar"**

---

## Funcionalidades

| Botão | O que faz |
|-------|-----------|
| 🎙️ Falar com a Assistente | Conversa por voz para qualquer coisa |
| 📷 Foto da Notinha | Fotografa cupom fiscal e registra automaticamente |
| 💰 Registrar Venda | Registra uma venda de produto |
| 📊 Ver o Dinheiro | Resumo financeiro simples |
| 📖 Minhas Receitas | Caderno de receitas com cálculo de custo |
| 🛵 Ajuda iFood | Cria descrição de produto para o iFood |

---

## O que a assistente entende (exemplos de fala)

**Para registrar compras:**
- "Comprei 2 litros de leite por 12 reais"
- "Gastei 45 reais no mercado: chocolate, manteiga e ovos"

**Para registrar vendas:**
- "Vendi 5 bolos de pote por 12 reais cada"
- "Hoje o iFood pediu 3 brigadeiros a 8 reais"

**Para perguntar sobre finanças:**
- "Quanto eu vendi essa semana?"
- "Tô tendo lucro?"
- "Qual produto está vendendo mais?"
- "Quanto devo guardar de reserva?"

**Para receitas:**
- "Adiciona a receita do bolo de chocolate: 3 ovos, 2 xícaras de farinha..."
- "Qual o custo da receita de brigadeiro?"

**Para iFood:**
- "Me ajuda a criar um anúncio para o meu bolo de pote"

---

## Arquitetura técnica

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   PWA (React)       │────▶│  Express Server   │────▶│  Claude API     │
│   - Voz (Browser)   │     │  - /api/chat      │     │  (Anthropic)    │
│   - Câmera          │     │  - /api/vision    │     │                 │
│   - IndexedDB       │     │                  │     │                 │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
```

### Dados ficam no celular (IndexedDB/Dexie):
- Compras de ingredientes
- Registros de vendas
- Receitas culinárias
- Histórico de conversa
- Configurações

---

## Proteção de dados

- ✅ Dados ficam no próprio celular (não vão para nuvem)
- ✅ Apenas as mensagens de texto vão para a API do Claude
- ✅ Fotos processadas via API mas não armazenadas
- ✅ Chave de API fica no servidor (nunca exposta ao browser)
- ✅ Sem login, sem cadastro, sem senha para lembrar

---

## Suporte

Dúvidas? Fale com quem instalou este aplicativo para você! 😊
