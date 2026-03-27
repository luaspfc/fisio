import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Share2, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function VisualizarProntuario() {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Mock data
  const prontuario = {
    id: 1,
    paciente: "João Silva",
    dataCriacao: "2024-01-10",
    ultimaAtualizacao: "2024-01-15",
    fisioterapeuta: "Dr. Carlos Santos",
    avaliacao: {
      data: "2024-01-10",
      diagnostico: "[CRIPTOGRAFADO] Lesão de ligamento cruzado anterior",
      queixa: "Dor no joelho esquerdo após queda",
      historico: "Paciente relata queda durante atividade esportiva",
      examesFisicos: "Teste de Lachman positivo, edema presente",
    },
    planoTerapeutico: {
      data: "2024-01-10",
      objetivos: "Recuperar amplitude de movimento, reduzir dor, fortalecer musculatura",
      frequencia: "3x por semana",
      duracao: "8 semanas",
      intervencoes: "[CRIPTOGRAFADO] Terapia manual, exercícios de fortalecimento, crioterapia",
    },
    evolucoes: [
      {
        id: 1,
        data: "2024-01-15",
        sessao: 2,
        resultado: "Paciente apresenta melhora na amplitude de movimento",
        observacoes: "Continuar com protocolo atual",
        proximo: "Aumentar intensidade dos exercícios",
      },
      {
        id: 2,
        data: "2024-01-12",
        sessao: 1,
        resultado: "Sessão inicial com avaliação completa",
        observacoes: "Paciente cooperativo e motivado",
        proximo: "Iniciar exercícios de mobilização",
      },
    ],
    auditoria: {
      criacao: { data: "2024-01-10 10:30", usuario: "Dr. Carlos Santos" },
      ultimaVisualizacao: { data: "2024-01-15 14:20", usuario: "João Silva (Paciente)" },
      compartilhamentos: [
        { data: "2024-01-12", usuario: "Dra. Maria Silva (Médica)" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-xl border border-gray-100 sm:rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meu Prontuário</h1>
                  <p className="text-sm text-gray-600">
                    Paciente: {prontuario.paciente} • Criado em {prontuario.dataCriacao}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Dados Protegidos por LGPD</p>
              <p className="text-blue-800 text-xs mt-1">
                Seu prontuário é criptografado com AES-256-GCM. Todos os acessos são registrados
                para sua segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Avaliação */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliação Inicial</CardTitle>
              <CardDescription>Data: {prontuario.avaliacao.data}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Queixa Principal</h4>
                <p className="text-gray-700">{prontuario.avaliacao.queixa}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Histórico</h4>
                <p className="text-gray-700">{prontuario.avaliacao.historico}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exames Físicos</h4>
                <p className="text-gray-700">{prontuario.avaliacao.examesFisicos}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start gap-2">
                <Lock className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Diagnóstico</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {showSensitiveData
                      ? prontuario.avaliacao.diagnostico
                      : "[CRIPTOGRAFADO - Apenas você e seu fisioterapeuta podem visualizar]"}
                  </p>
                </div>
                <button
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showSensitiveData ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Terapêutico */}
          <Card>
            <CardHeader>
              <CardTitle>Plano Terapêutico</CardTitle>
              <CardDescription>Data: {prontuario.planoTerapeutico.data}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Frequência</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {prontuario.planoTerapeutico.frequencia}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {prontuario.planoTerapeutico.duracao}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Objetivo</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {prontuario.planoTerapeutico.objetivos.split(",")[0]}...
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Objetivos Terapêuticos</h4>
                <p className="text-gray-700">{prontuario.planoTerapeutico.objetivos}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start gap-2">
                <Lock className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Intervenções</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {showSensitiveData
                      ? prontuario.planoTerapeutico.intervencoes
                      : "[CRIPTOGRAFADO - Apenas você e seu fisioterapeuta podem visualizar]"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evoluções */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Tratamento</CardTitle>
              <CardDescription>Histórico de sessões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prontuario.evolucoes.map((evolucao) => (
                <div
                  key={evolucao.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Sessão {evolucao.sessao}</p>
                      <p className="text-sm text-gray-600">{evolucao.data}</p>
                    </div>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Realizada
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Resultado</p>
                      <p className="text-gray-700">{evolucao.resultado}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Observações</p>
                      <p className="text-gray-700">{evolucao.observacoes}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Próximo Passo</p>
                      <p className="text-gray-700">{evolucao.proximo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Auditoria LGPD */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Histórico de Acessos (LGPD Art. 18)</CardTitle>
              <CardDescription className="text-yellow-800">
                Registro de quem acessou seu prontuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">Criação do Prontuário</p>
                    <p className="text-sm text-gray-600">{prontuario.auditoria.criacao.usuario}</p>
                  </div>
                  <p className="text-sm text-gray-600">{prontuario.auditoria.criacao.data}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">Última Visualização</p>
                    <p className="text-sm text-gray-600">
                      {prontuario.auditoria.ultimaVisualizacao.usuario}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {prontuario.auditoria.ultimaVisualizacao.data}
                  </p>
                </div>

                {prontuario.auditoria.compartilhamentos.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">Compartilhamento</p>
                      <p className="text-sm text-gray-600">{comp.usuario}</p>
                    </div>
                    <p className="text-sm text-gray-600">{comp.data}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-yellow-800 mt-4">
                Você pode solicitar a exclusão de seus dados a qualquer momento, conforme direito
                garantido pela LGPD Art. 17.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Solicitar Cópia Completa
            </Button>
            <Button variant="outline" className="flex-1">
              Compartilhar com Profissional
            </Button>
            <Button variant="outline" className="flex-1">
              Solicitar Exclusão de Dados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
