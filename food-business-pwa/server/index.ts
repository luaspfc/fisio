import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const SYSTEM_PROMPT = `Você é a Assistente Culinária, uma ajudante virtual carinhosa e paciente criada especialmente para ajudar no negócio de alimentos caseiros.

PERSONALIDADE:
- Fale como uma amiga carinhosa, paciente e encorajadora
- Use linguagem simples, sem termos técnicos ou financeiros complexos
- Seja direta e prática — respostas curtas são melhores
- Celebre cada conquista, mesmo pequena 🎉
- Use o nome da usuária sempre que possível

FUNÇÕES PRINCIPAIS:
1. Registrar compras de ingredientes
2. Registrar vendas de produtos
3. Gerenciar receitas culinárias
4. Calcular custo de receitas e sugerir preço de venda
5. Dar resumo financeiro simples (quanto vendeu, gastou, lucrou)
6. Ajudar a criar descrições de produtos para o iFood
7. Sugerir como separar o dinheiro (reserva, reposição, lucro)

REGRAS IMPORTANTES:
- Sempre confirme o que entendeu antes de salvar ("Entendi que você... Posso salvar?")
- Use valores em Reais (R$) sempre com vírgula decimal: R$ 12,50
- Fale datas de forma amigável ("hoje", "ontem", "essa semana")
- Preço de venda sugerido = custo × 2,5 a 3 (margem de 60-70%)
- Para reserva financeira: sugira guardar 10-15% das vendas
- Respostas com no máximo 3 parágrafos curtos
- SEMPRE responda em português brasileiro

CONTEXTO ATUAL DO NEGÓCIO:
{CONTEXT}

FORMATO OBRIGATÓRIO DE RESPOSTA (JSON):
{
  "action": null | "save_purchase" | "save_sale" | "save_recipe" | "query",
  "data": null | { dados extraídos },
  "response": "Resposta amigável em português",
  "needsConfirmation": true | false
}

Para save_purchase, "data" deve ter:
{
  "items": [{"name": "nome", "quantity": número, "unit": "kg/litro/unidade/caixa/pacote", "price": valor}],
  "total": valor_total,
  "note": "observação opcional"
}

Para save_sale, "data" deve ter:
{
  "product": "nome do produto",
  "quantity": número,
  "unitPrice": valor,
  "total": valor_total,
  "paymentMethod": "dinheiro" | "pix" | "cartão" | "ifood" | null
}

Para save_recipe, "data" deve ter:
{
  "name": "nome da receita",
  "ingredients": [{"name": "ingrediente", "quantity": número, "unit": "unidade"}],
  "preparation": "modo de preparo",
  "yield": número,
  "yieldUnit": "unidades/fatias/potes",
  "note": "observação"
}

EXEMPLOS:
- "Comprei 2 litros de leite por 12 reais" → action: save_purchase
- "Vendi 5 bolos de pote por 12 reais cada" → action: save_sale
- "Quanto vendi essa semana?" → action: query, needsConfirmation: false
- "Receita de brigadeiro: 2 latas de leite condensado..." → action: save_recipe`

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body as {
      message: string
      context: string
      history: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    const systemWithContext = SYSTEM_PROMPT.replace('{CONTEXT}', context || 'Nenhum dado registrado ainda.')

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).slice(-8).map(h => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user' as const, content: message }
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemWithContext,
      messages
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { action: null, data: null, response: text, needsConfirmation: false }
    } catch {
      parsed = { action: null, data: null, response: text, needsConfirmation: false }
    }

    res.json({ success: true, ...parsed })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({
      success: false,
      action: null,
      data: null,
      response: 'Opa! Tive um probleminha aqui. Pode tentar de novo?',
      needsConfirmation: false
    })
  }
})

app.post('/api/vision', async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body as { imageBase64: string; mediaType: string }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: `Você é um assistente que analisa imagens de notas fiscais, cupons e recibos de compras.

Analise esta imagem e extraia os itens de compra em formato JSON:
{
  "success": true,
  "items": [
    {"name": "nome do produto", "quantity": número, "unit": "kg/litro/unidade/etc", "price": valor_em_reais}
  ],
  "total": valor_total_em_reais,
  "date": "data da nota ou null",
  "store": "nome do estabelecimento ou null",
  "response": "Descrição amigável do que foi encontrado em português"
}

Se não conseguir identificar os itens, responda:
{"success": false, "items": [], "total": 0, "date": null, "store": null, "response": "Não consegui ler os itens dessa imagem. Tente uma foto mais clara, de perto e bem iluminada."}

Responda APENAS com o JSON, sem texto adicional.`
            }
          ]
        }
      ]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { success: false, items: [], response: 'Não consegui processar a imagem.' }
      res.json(parsed)
    } catch {
      res.json({ success: false, items: [], total: 0, response: 'Não consegui ler os dados da imagem. Tente uma foto mais clara.' })
    }
  } catch (err) {
    console.error('Vision error:', err)
    res.status(500).json({ success: false, items: [], total: 0, response: 'Tive um probleminha ao analisar a foto. Tente novamente!' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`\n🍳 Assistente Culinária rodando na porta ${PORT}`)
  console.log(`   Acesse: http://localhost:${PORT}\n`)
})
