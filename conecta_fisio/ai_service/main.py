"""
ConectaFisio AI Service - FASE 6
Microserviço Python com FastAPI para Suporte à Decisão Clínica (RAG + Deep Learning)

Funcionalidades:
1. RAG (Retrieval-Augmented Generation): Busca em base de artigos científicos
2. Deep Learning: Previsão de sucesso de reabilitação
3. Recomendações personalizadas de conduta clínica
4. Sugestões de leitura baseadas em caso
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime
import json

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ConectaFisio AI Service",
    description="Suporte à Decisão Clínica com RAG e Deep Learning",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODELOS
# ============================================================================

class PacienteData(BaseModel):
    """Dados do paciente para análise"""
    id: int
    idade: int
    genero: str
    diagnostico: str
    historico_clinico: str
    medicacoes: List[str]
    comorbidades: List[str]
    sessoes_completadas: int
    evolucao_ultima_sessao: str
    objetivo_terapeutico: str


class ArtigoScientific(BaseModel):
    """Artigo científico pré-aprovado"""
    id: int
    titulo: str
    autores: str
    ano: int
    revista: str
    doi: str
    resumo: str
    palavras_chave: List[str]
    embedding: Optional[List[float]] = None
    diagnosticos_relacionados: List[str]
    intervencoes_sugeridas: List[str]
    nivel_evidencia: str  # A, B, C, D


class SugestaoConduta(BaseModel):
    """Sugestão de conduta clínica"""
    id: str
    conduta: str
    confianca: float  # 0-1
    fundamentacao: str
    artigos_relacionados: List[ArtigoScientific]
    evidencia_nivel: str
    observacoes_clinicas: str


class PredicaoReabilitacao(BaseModel):
    """Previsão de sucesso da reabilitação"""
    probabilidade_sucesso: float  # 0-1
    risco_lesao: float  # 0-1
    tempo_estimado_dias: int
    fatores_positivos: List[str]
    fatores_risco: List[str]
    recomendacoes_ajuste: List[str]


class RecomendacaoLeitura(BaseModel):
    """Recomendação de leitura para o caso"""
    artigo: ArtigoScientific
    relevancia: float  # 0-1
    motivo: str
    secoes_recomendadas: List[str]


# ============================================================================
# BASE DE DADOS VETORIAL (Mock - usar Pinecone/Milvus em produção)
# ============================================================================

class VectorDatabase:
    """Mock de banco de dados vetorial com artigos científicos"""
    
    def __init__(self):
        self.artigos = self._load_mock_articles()
    
    def _load_mock_articles(self) -> List[ArtigoScientific]:
        """Carrega artigos científicos pré-aprovados (mock)"""
        return [
            ArtigoScientific(
                id=1,
                titulo="Efetividade da Reabilitação Pós-Cirúrgica do Joelho",
                autores="Silva et al.",
                ano=2023,
                revista="Journal of Orthopedic Surgery",
                doi="10.1234/jos.2023.001",
                resumo="Estudo prospectivo com 150 pacientes mostrando 85% de recuperação completa com protocolo de 8 semanas.",
                palavras_chave=["joelho", "reabilitação", "pós-cirúrgico", "LCA"],
                diagnosticos_relacionados=["Lesão de LCA", "Pós-operatório de joelho"],
                intervencoes_sugeridas=["Mobilização passiva", "Fortalecimento progressivo", "Propriocepção"],
                nivel_evidencia="A"
            ),
            ArtigoScientific(
                id=2,
                titulo="Previsão de Sucesso em Reabilitação Neurológica usando Machine Learning",
                autores="Santos & Costa",
                ano=2023,
                revista="Neurorehabilitation Journal",
                doi="10.5678/nrj.2023.045",
                resumo="Modelo de Deep Learning com acurácia de 92% na previsão de sucesso de reabilitação neurológica.",
                palavras_chave=["Deep Learning", "previsão", "reabilitação neurológica", "AVC"],
                diagnosticos_relacionados=["AVC", "Paralisia", "Déficit motor"],
                intervencoes_sugeridas=["Terapia ocupacional", "Exercícios funcionais", "Estimulação"],
                nivel_evidencia="A"
            ),
            ArtigoScientific(
                id=3,
                titulo="Protocolo de Reabilitação Respiratória em Pacientes com COVID-19",
                autores="Oliveira et al.",
                ano=2023,
                revista="Respiratory Care",
                doi="10.9012/rc.2023.089",
                resumo="Protocolo estruturado de 6 semanas com melhora significativa em capacidade pulmonar.",
                palavras_chave=["COVID-19", "reabilitação respiratória", "capacidade pulmonar"],
                diagnosticos_relacionados=["Sequelas de COVID-19", "Insuficiência respiratória"],
                intervencoes_sugeridas=["Exercícios respiratórios", "Treinamento aeróbico", "Educação"],
                nivel_evidencia="B"
            ),
        ]
    
    def search_by_diagnosis(self, diagnostico: str, limite: int = 5) -> List[ArtigoScientific]:
        """Busca artigos por diagnóstico"""
        resultados = [
            a for a in self.artigos
            if diagnostico.lower() in [d.lower() for d in a.diagnosticos_relacionados]
        ]
        return resultados[:limite]
    
    def search_by_keywords(self, palavras_chave: List[str], limite: int = 5) -> List[ArtigoScientific]:
        """Busca artigos por palavras-chave"""
        resultados = []
        for artigo in self.artigos:
            matches = sum(1 for pk in palavras_chave if pk.lower() in [p.lower() for p in artigo.palavras_chave])
            if matches > 0:
                resultados.append((artigo, matches))
        
        resultados.sort(key=lambda x: x[1], reverse=True)
        return [a for a, _ in resultados[:limite]]


# Instância global
vector_db = VectorDatabase()


# ============================================================================
# MODELOS DE DEEP LEARNING (Mock - usar TensorFlow/PyTorch em produção)
# ============================================================================

class DeepLearningModel:
    """Mock de modelo de Deep Learning para previsão de sucesso"""
    
    @staticmethod
    def predict_rehabilitation_success(paciente: PacienteData) -> PredicaoReabilitacao:
        """
        Prediz probabilidade de sucesso da reabilitação usando Deep Learning
        Em produção: usar modelo CNN/RNN treinado com dados históricos anonimizados
        """
        
        # Fatores positivos
        fatores_positivos = []
        if paciente.idade < 60:
            fatores_positivos.append("Idade favorável para recuperação")
        if paciente.sessoes_completadas >= 5:
            fatores_positivos.append("Aderência ao tratamento")
        if "Hipertensão" not in paciente.comorbidades:
            fatores_positivos.append("Ausência de comorbidades cardiovasculares")
        
        # Fatores de risco
        fatores_risco = []
        if paciente.idade > 70:
            fatores_risco.append("Idade avançada")
        if len(paciente.comorbidades) > 2:
            fatores_risco.append("Múltiplas comorbidades")
        if "Sedentário" in paciente.historico_clinico:
            fatores_risco.append("Histórico sedentário")
        
        # Cálculo de probabilidade (mock - em produção usar modelo real)
        prob_sucesso = 0.75
        if paciente.idade < 50:
            prob_sucesso += 0.15
        if paciente.sessoes_completadas >= 10:
            prob_sucesso += 0.10
        if len(fatores_risco) > 0:
            prob_sucesso -= 0.10 * len(fatores_risco)
        
        prob_sucesso = max(0, min(1, prob_sucesso))
        
        # Risco de lesão
        risco_lesao = 1 - prob_sucesso
        
        # Tempo estimado
        tempo_estimado = 30 + (paciente.idade // 10) * 5
        
        # Recomendações de ajuste
        recomendacoes = []
        if prob_sucesso < 0.6:
            recomendacoes.append("Aumentar frequência de sessões")
        if risco_lesao > 0.4:
            recomendacoes.append("Reduzir intensidade dos exercícios")
        if len(fatores_risco) > 0:
            recomendacoes.append("Monitorar comorbidades")
        
        return PredicaoReabilitacao(
            probabilidade_sucesso=round(prob_sucesso, 2),
            risco_lesao=round(risco_lesao, 2),
            tempo_estimado_dias=tempo_estimado,
            fatores_positivos=fatores_positivos,
            fatores_risco=fatores_risco,
            recomendacoes_ajuste=recomendacoes
        )


# ============================================================================
# RAG (Retrieval-Augmented Generation)
# ============================================================================

class RAGEngine:
    """Motor de RAG para sugestões de conduta clínica"""
    
    @staticmethod
    def gerar_sugestoes_conduta(
        paciente: PacienteData,
        artigos: List[ArtigoScientific]
    ) -> List[SugestaoConduta]:
        """
        Gera sugestões de conduta baseadas em artigos científicos
        Em produção: usar LLM (GPT-4, Claude, etc) com prompt engineering
        """
        
        sugestoes = []
        
        for artigo in artigos:
            # Extrai intervenções do artigo
            for intervencao in artigo.intervencoes_sugeridas:
                confianca = 0.85 if artigo.nivel_evidencia == "A" else 0.70
                
                sugestao = SugestaoConduta(
                    id=f"{artigo.id}_{intervencao}",
                    conduta=intervencao,
                    confianca=confianca,
                    fundamentacao=f"Baseado em {artigo.titulo} ({artigo.ano})",
                    artigos_relacionados=[artigo],
                    evidencia_nivel=artigo.nivel_evidencia,
                    observacoes_clinicas=f"Aplicável para {paciente.diagnostico} em pacientes com perfil similar"
                )
                sugestoes.append(sugestao)
        
        # Ordena por confiança
        sugestoes.sort(key=lambda x: x.confianca, reverse=True)
        
        return sugestoes[:5]  # Top 5


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check do serviço"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ConectaFisio AI Service"
    }


@app.post("/api/v1/sugestoes-conduta")
async def obter_sugestoes_conduta(paciente: PacienteData) -> dict:
    """
    Obtém sugestões de conduta clínica para um paciente
    
    Fluxo:
    1. Busca artigos relacionados ao diagnóstico
    2. Aplica RAG para gerar sugestões
    3. Retorna sugestões com fundamentação científica
    """
    try:
        logger.info(f"Processando sugestões para paciente {paciente.id}")
        
        # Busca artigos relacionados
        artigos = vector_db.search_by_diagnosis(paciente.diagnostico)
        
        if not artigos:
            raise HTTPException(
                status_code=404,
                detail=f"Nenhum artigo encontrado para diagnóstico: {paciente.diagnostico}"
            )
        
        # Gera sugestões usando RAG
        sugestoes = RAGEngine.gerar_sugestoes_conduta(paciente, artigos)
        
        return {
            "paciente_id": paciente.id,
            "diagnostico": paciente.diagnostico,
            "sugestoes": [s.dict() for s in sugestoes],
            "total_artigos_consultados": len(artigos),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Erro ao processar sugestões: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/predicao-reabilitacao")
async def obter_predicao_reabilitacao(paciente: PacienteData) -> dict:
    """
    Obtém previsão de sucesso da reabilitação usando Deep Learning
    
    Retorna:
    - Probabilidade de sucesso (0-1)
    - Risco de lesão (0-1)
    - Tempo estimado de recuperação
    - Fatores positivos e de risco
    - Recomendações de ajuste no plano terapêutico
    """
    try:
        logger.info(f"Processando previsão para paciente {paciente.id}")
        
        predicao = DeepLearningModel.predict_rehabilitation_success(paciente)
        
        return {
            "paciente_id": paciente.id,
            "diagnostico": paciente.diagnostico,
            "predicao": predicao.dict(),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Erro ao processar previsão: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/recomendacoes-leitura")
async def obter_recomendacoes_leitura(paciente: PacienteData) -> dict:
    """
    Obtém recomendações de leitura personalizadas para o caso
    
    Baseado em:
    - Diagnóstico
    - Histórico clínico
    - Evolução atual
    - Nível de evidência científica
    """
    try:
        logger.info(f"Processando recomendações de leitura para paciente {paciente.id}")
        
        # Busca artigos por diagnóstico
        artigos = vector_db.search_by_diagnosis(paciente.diagnostico, limite=10)
        
        # Cria recomendações com motivo personalizado
        recomendacoes = []
        for artigo in artigos[:5]:
            recomendacao = RecomendacaoLeitura(
                artigo=artigo,
                relevancia=0.9 if artigo.nivel_evidencia == "A" else 0.75,
                motivo=f"Altamente relevante para {paciente.diagnostico}. Nível de evidência {artigo.nivel_evidencia}.",
                secoes_recomendadas=["Resumo", "Métodos", "Resultados", "Conclusões"]
            )
            recomendacoes.append(recomendacao)
        
        return {
            "paciente_id": paciente.id,
            "diagnostico": paciente.diagnostico,
            "recomendacoes": [r.dict() for r in recomendacoes],
            "total_recomendacoes": len(recomendacoes),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Erro ao processar recomendações: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/artigos")
async def listar_artigos(diagnostico: Optional[str] = None, limite: int = 10) -> dict:
    """
    Lista artigos científicos disponíveis
    Filtro opcional por diagnóstico
    """
    try:
        if diagnostico:
            artigos = vector_db.search_by_diagnosis(diagnostico, limite=limite)
        else:
            artigos = vector_db.artigos[:limite]
        
        return {
            "total": len(artigos),
            "artigos": [a.dict() for a in artigos],
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Erro ao listar artigos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# INTEGRAÇÃO COM BACKEND PRINCIPAL
# ============================================================================

@app.post("/api/v1/analise-completa")
async def analise_completa(paciente: PacienteData) -> dict:
    """
    Análise completa: combina sugestões, previsão e recomendações
    """
    try:
        logger.info(f"Processando análise completa para paciente {paciente.id}")
        
        # Busca artigos
        artigos = vector_db.search_by_diagnosis(paciente.diagnostico)
        
        # Gera sugestões
        sugestoes = RAGEngine.gerar_sugestoes_conduta(paciente, artigos)
        
        # Gera previsão
        predicao = DeepLearningModel.predict_rehabilitation_success(paciente)
        
        # Gera recomendações de leitura
        recomendacoes = []
        for artigo in artigos[:3]:
            recomendacoes.append({
                "artigo": artigo.dict(),
                "relevancia": 0.9,
                "motivo": f"Fundamental para {paciente.diagnostico}"
            })
        
        return {
            "paciente_id": paciente.id,
            "diagnostico": paciente.diagnostico,
            "sugestoes_conduta": [s.dict() for s in sugestoes],
            "predicao_reabilitacao": predicao.dict(),
            "recomendacoes_leitura": recomendacoes,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Erro na análise completa: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
