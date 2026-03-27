import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Star, DollarSign, Calendar } from "lucide-react";

export default function BuscaFisioterapeutas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  // Mock data - será substituído por chamada tRPC real
  const fisioterapeutas = [
    {
      id: 1,
      nome: "Dr. João Silva",
      especialidade: "Reabilitação Pós-Cirúrgica",
      cidade: "São Paulo",
      distancia: 2.5,
      nota: 4.8,
      avaliacoes: 24,
      valorHora: 150,
      disponivel: true,
    },
    {
      id: 2,
      nome: "Dra. Maria Santos",
      especialidade: "Fisioterapia Desportiva",
      cidade: "São Paulo",
      distancia: 5.2,
      nota: 4.9,
      avaliacoes: 32,
      valorHora: 160,
      disponivel: true,
    },
    {
      id: 3,
      nome: "Carlos Oliveira",
      especialidade: "Reabilitação Neurológica",
      cidade: "São Paulo",
      distancia: 8.1,
      nota: 4.7,
      avaliacoes: 18,
      valorHora: 140,
      disponivel: false,
    },
  ];

  const especialidades = [
    "Reabilitação Pós-Cirúrgica",
    "Fisioterapia Desportiva",
    "Reabilitação Neurológica",
    "Fisioterapia Respiratória",
    "Osteopatia",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">Encontre um Fisioterapeuta</h1>
          <p className="text-muted-foreground">
            Conecte-se com profissionais qualificados e validados perto de você
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Fisioterapeutas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Especialidade</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Todas as especialidades</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cidade</label>
                <Input
                  placeholder="São Paulo, Rio de Janeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Buscar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Encontrados {fisioterapeutas.length} profissionais
          </div>

          {fisioterapeutas.map((fisio) => (
            <Card key={fisio.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-1">{fisio.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{fisio.especialidade}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{fisio.cidade} • {fisio.distancia} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {fisio.nota} ({fisio.avaliacoes} avaliações)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>R$ {fisio.valorHora}/hora</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1 flex flex-col items-start md:items-center justify-center">
                    {fisio.disponivel ? (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-600">Disponível</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Indisponível</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full"
                      disabled={!fisio.disponivel}
                      variant={fisio.disponivel ? "default" : "outline"}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar
                    </Button>
                    <Button variant="outline" className="w-full">
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
