import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Zap,
  BarChart3,
} from "lucide-react";

export default function SugestoesClinicas() {
  const [activeTab, setActiveTab] = useState<"sugestoes" | "predicao" | "leituras">(
    "sugestoes"
  );
  const [loading, setLoading] = useState(false);

  // Mock data
  const paciente = {
    id: 1,
    nome: "João Silva",
    diagnostico: "Lesão de LCA",
    idade: 35,
    sessoes: 5,
  };

  const sugestoes = [
    {
      id: 1,
      conduta: "Mobilização passiva",
      confianca: 0.95,
      fundamentacao: "Efetividade da Reabilitação Pós-Cirúrgica do Joelho (2023)",
      nivelEvidencia: "A",
      artigos: [
        {
          titulo: "Efetividade da Reabilitação Pós-Cirúrgica do Joelho",
          autores: "Silva et al.",
          ano: 2023,
          doi: "10.1234/jos.2023.001",
        },
      ],
    },
    {
      id: 2,
      conduta: "Fortalecimento progressivo",
      confianca: 0.92,
      fundamentacao: "Protocolo estruturado com 8 semanas de progressão",
      nivelEvidencia: "A",
      artigos: [
        {
          titulo: "Efetividade da Reabilitação Pós-Cirúrgica do Joelho",
          autores: "Silva et al.",
          ano: 2023,
          doi: "10.1234/jos.2023.001",
        },
      ],
    },
    {
      id: 3,
      conduta: "Propriocepção",
      confianca: 0.88,
      fundamentacao: "Essencial para recuperação de estabilidade articular",
      nivelEvidencia: "A",
      artigos: [
        {
          titulo: "Efetividade da Reabilitação Pós-Cirúrgica do Joelho",
          autores: "Silva et al.",
          ano: 2023,
          doi: "10.1234/jos.2023.001",
        },
      ],
    },
  ];

  const predicao = {
    probabilidadeSucesso: 0.87,
    riscoLesao: 0.13,
    tempoEstimado: 45,
    fatoresPositivos: [
      "Idade favorável para recuperação",
      "Aderência ao tratamento",
      "Ausência de comorbidades cardiovasculares",
    ],
    fatoresRisco: ["Histórico sedentário"],
    recomendacoes: [
      "Manter frequência de 3x por semana",
      "Monitorar progressão de força",
      "Aumentar atividades funcionais",
    ],
  };

  const leituras = [
    {
      titulo: "Efetividade da Reabilitação Pós-Cirúrgica do Joelho",
      autores: "Silva et al.",
      ano: 2023,
      relevancia: 0.95,
      motivo: "Altamente relevante para Lesão de LCA. Nível de evidência A.",
      secoes: ["Resumo", "Métodos", "Resultados", "Conclusões"],
    },
    {
      titulo: "Previsão de Sucesso em Reabilitação usando Machine Learning",
      autores: "Santos & Costa",
      ano: 2023,
      relevancia: 0.82,
      motivo: "Modelo preditivo aplicável ao seu caso clínico",
      secoes: ["Resumo", "Resultados"],
    },
  ];

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 0.9) return "bg-green-100 text-green-800";
    if (confianca >= 0.8) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getEvidenciaColor = (nivel: string) => {
    if (nivel === "A") return "bg-green-100 text-green-800";
    if (nivel === "B") return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Suporte à Decisão Clínica</h1>
          </div>
          <p className="text-muted-foreground">
            Análise baseada em artigos científicos e Deep Learning para {paciente.diagnostico}
          </p>
        </div>

        {/* Info do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{paciente.nome}</CardTitle>
            <CardDescription>
              {paciente.diagnostico} • {paciente.idade} anos • {paciente.sessoes} sessões
              completadas
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("sugestoes")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "sugestoes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Zap className="inline h-4 w-4 mr-2" />
            Sugestões de Conduta
          </button>
          <button
            onClick={() => setActiveTab("predicao")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "predicao"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="inline h-4 w-4 mr-2" />
            Previsão de Sucesso
          </button>
          <button
            onClick={() => setActiveTab("leituras")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "leituras"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen className="inline h-4 w-4 mr-2" />
            Recomendações de Leitura
          </button>
        </div>

        {/* Sugestões de Conduta */}
        {activeTab === "sugestoes" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Conduta Baseadas em Evidências</CardTitle>
                <CardDescription>
                  Recomendações fundamentadas em artigos científicos com nível de evidência A
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sugestoes.map((sugestao) => (
                  <div
                    key={sugestao.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {sugestao.conduta}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{sugestao.fundamentacao}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={getConfiancaColor(sugestao.confianca)}>
                          {Math.round(sugestao.confianca * 100)}% confiança
                        </Badge>
                        <Badge className={getEvidenciaColor(sugestao.nivelEvidencia)}>
                          Nível {sugestao.nivelEvidencia}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Artigos Relacionados</p>
                      {sugestao.artigos.map((artigo, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          <p className="font-medium">{artigo.titulo}</p>
                          <p className="text-gray-500">
                            {artigo.autores} ({artigo.ano}) • DOI: {artigo.doi}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Artigos Completos
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previsão de Sucesso */}
        {activeTab === "predicao" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Probabilidade de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(predicao.probabilidadeSucesso * 100)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Baseado em modelo Deep Learning com dados históricos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Risco de Lesão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(predicao.riscoLesao * 100)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Risco relativo durante reabilitação</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{predicao.tempoEstimado}d</div>
                  <p className="text-xs text-gray-600 mt-2">Dias até recuperação esperada</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Fatores Positivos
                  </h4>
                  <ul className="space-y-1">
                    {predicao.fatoresPositivos.map((fator, idx) => (
                      <li key={idx} className="text-sm text-gray-700 ml-7">
                        • {fator}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Fatores de Risco
                  </h4>
                  <ul className="space-y-1">
                    {predicao.fatoresRisco.map((fator, idx) => (
                      <li key={idx} className="text-sm text-gray-700 ml-7">
                        • {fator}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Recomendações de Ajuste
                  </h4>
                  <ul className="space-y-1">
                    {predicao.recomendacoes.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 ml-7">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recomendações de Leitura */}
        {activeTab === "leituras" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações de Leitura Personalizadas</CardTitle>
                <CardDescription>
                  Artigos científicos selecionados para seu caso clínico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {leituras.map((leitura, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{leitura.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {leitura.autores} ({leitura.ano})
                        </p>
                        <p className="text-sm text-gray-700 mt-2">{leitura.motivo}</p>
                      </div>
                      <Badge className={getConfiancaColor(leitura.relevancia)}>
                        {Math.round(leitura.relevancia * 100)}% relevância
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Seções Recomendadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {leitura.secoes.map((secao, sidx) => (
                          <Badge key={sidx} variant="outline">
                            {secao}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Acessar Artigo Completo
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Informação Importante:</strong> Estas sugestões são baseadas em análise
              de dados científicos e modelos de IA. Sempre consulte e siga as orientações de seu
              fisioterapeuta responsável. O sistema não substitui o julgamento clínico profissional.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
