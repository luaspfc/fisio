import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Eye,
  Download,
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<"pendente" | "validado" | "rejeitado">(
    "pendente"
  );

  // Mock data
  const registrosPendentes = [
    {
      id: 1,
      nome: "Dr. João Silva",
      crefito: "123456",
      especialidades: ["Reabilitação Pós-Cirúrgica"],
      cidade: "São Paulo",
      dataCadastro: "2024-01-15",
      email: "joao@example.com",
      telefone: "(11) 99999-9999",
      documentos: ["CREFITO.pdf", "Identidade.pdf", "Comprovante_Endereco.pdf"],
    },
    {
      id: 2,
      nome: "Dra. Maria Santos",
      crefito: "654321",
      especialidades: ["Fisioterapia Desportiva", "Reabilitação Neurológica"],
      cidade: "Rio de Janeiro",
      dataCadastro: "2024-01-14",
      email: "maria@example.com",
      telefone: "(21) 98888-8888",
      documentos: ["CREFITO.pdf", "Identidade.pdf"],
    },
    {
      id: 3,
      nome: "Carlos Oliveira",
      crefito: "789012",
      especialidades: ["Fisioterapia Respiratória"],
      cidade: "Belo Horizonte",
      dataCadastro: "2024-01-13",
      email: "carlos@example.com",
      telefone: "(31) 97777-7777",
      documentos: ["CREFITO.pdf", "Identidade.pdf", "Comprovante_Endereco.pdf"],
    },
  ];

  const registrosValidados = [
    {
      id: 4,
      nome: "Dr. Pedro Costa",
      crefito: "345678",
      especialidades: ["Reabilitação Pós-Cirúrgica"],
      cidade: "Curitiba",
      dataValidacao: "2024-01-10",
      validadoPor: "Admin User",
      status: "Ativo",
    },
  ];

  const registrosRejeitados = [
    {
      id: 5,
      nome: "Ana Paula Ferreira",
      crefito: "999999",
      especialidades: ["Fisioterapia Geral"],
      cidade: "Salvador",
      dataRejeicao: "2024-01-08",
      motivo: "CREFITO inválido ou expirado",
      rejeitadoPor: "Admin User",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie validações de CREFITO e profissionais registrados
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrosPendentes.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando validação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrosValidados.length}</div>
              <p className="text-xs text-muted-foreground">Profissionais ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrosRejeitados.length}</div>
              <p className="text-xs text-muted-foreground">Não validados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registrosPendentes.length + registrosValidados.length + registrosRejeitados.length}
              </div>
              <p className="text-xs text-muted-foreground">Todos os registros</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciar Registros</CardTitle>
                <CardDescription>Validação de CREFITO e dados profissionais</CardDescription>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-4 border-b">
              <button
                onClick={() => setSelectedTab("pendente")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  selectedTab === "pendente"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock className="inline h-4 w-4 mr-2" />
                Pendentes ({registrosPendentes.length})
              </button>
              <button
                onClick={() => setSelectedTab("validado")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  selectedTab === "validado"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <CheckCircle2 className="inline h-4 w-4 mr-2" />
                Validados ({registrosValidados.length})
              </button>
              <button
                onClick={() => setSelectedTab("rejeitado")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  selectedTab === "rejeitado"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <XCircle className="inline h-4 w-4 mr-2" />
                Rejeitados ({registrosRejeitados.length})
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Pendentes */}
            {selectedTab === "pendente" && (
              <div className="space-y-4">
                {registrosPendentes.map((registro) => (
                  <div
                    key={registro.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{registro.nome}</h3>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                            Pendente
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">CREFITO: {registro.crefito}</p>
                      </div>
                      <p className="text-xs text-gray-500">{registro.dataCadastro}</p>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Especialidades</p>
                        <p className="font-medium">{registro.especialidades.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Localização</p>
                        <p className="font-medium">{registro.cidade}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Contato</p>
                        <p className="font-medium text-xs">{registro.email}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Documentos</p>
                      <div className="flex flex-wrap gap-2">
                        {registro.documentos.map((doc) => (
                          <button
                            key={doc}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            {doc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validados */}
            {selectedTab === "validado" && (
              <div className="space-y-4">
                {registrosValidados.map((registro) => (
                  <div
                    key={registro.id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{registro.nome}</h3>
                          <Badge className="bg-green-600">Validado</Badge>
                        </div>
                        <p className="text-sm text-gray-600">CREFITO: {registro.crefito}</p>
                      </div>
                      <p className="text-xs text-gray-500">{registro.dataValidacao}</p>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Especialidades</p>
                        <p className="font-medium">{registro.especialidades.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Localização</p>
                        <p className="font-medium">{registro.cidade}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Validado por</p>
                        <p className="font-medium text-xs">{registro.validadoPor}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil Público
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Rejeitados */}
            {selectedTab === "rejeitado" && (
              <div className="space-y-4">
                {registrosRejeitados.map((registro) => (
                  <div
                    key={registro.id}
                    className="border border-red-200 bg-red-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{registro.nome}</h3>
                          <Badge variant="destructive">Rejeitado</Badge>
                        </div>
                        <p className="text-sm text-gray-600">CREFITO: {registro.crefito}</p>
                      </div>
                      <p className="text-xs text-gray-500">{registro.dataRejeicao}</p>
                    </div>

                    <div className="mb-3 p-3 bg-white rounded border border-red-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Motivo da Rejeição</p>
                      <p className="text-sm text-gray-700">{registro.motivo}</p>
                    </div>

                    <Button size="sm" variant="outline">
                      Enviar Notificação
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
