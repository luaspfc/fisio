import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Star,
  DollarSign,
  Phone,
  Calendar,
  Award,
  MessageCircle,
  Share2,
} from "lucide-react";

export default function PerfilFisioterapeuta() {
  // Mock data - será substituído por dados reais
  const fisioterapeuta = {
    id: 1,
    nome: "Dr. João Silva",
    especialidade: "Reabilitação Pós-Cirúrgica",
    crefito: "123456",
    cidade: "São Paulo",
    bairro: "Vila Mariana",
    distancia: 2.5,
    nota: 4.8,
    avaliacoes: 24,
    valorHora: 150,
    telefone: "(11) 99999-9999",
    descricao:
      "Fisioterapeuta com 15 anos de experiência em reabilitação pós-cirúrgica. Especializado em recuperação de pacientes com cirurgias ortopédicas e neurológicas.",
    especialidades: ["Reabilitação Pós-Cirúrgica", "Fisioterapia Desportiva"],
    horarios: {
      segunda: "08:00 - 18:00",
      terca: "08:00 - 18:00",
      quarta: "08:00 - 18:00",
      quinta: "08:00 - 18:00",
      sexta: "08:00 - 17:00",
      sabado: "09:00 - 13:00",
      domingo: "Fechado",
    },
    selos: ["Validado CREFITO", "Atendimento Domiciliar", "Aceita Convênios"],
    avaliacoesList: [
      {
        id: 1,
        paciente: "Maria S.",
        nota: 5,
        comentario: "Excelente profissional, muito atencioso e competente.",
        data: "2024-01-15",
      },
      {
        id: 2,
        paciente: "Carlos O.",
        nota: 5,
        comentario: "Recuperação rápida e segura. Recomendo!",
        data: "2024-01-10",
      },
      {
        id: 3,
        paciente: "Ana P.",
        nota: 4,
        comentario: "Bom profissional, pontual e dedicado.",
        data: "2024-01-05",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-xl border border-gray-100 sm:rounded-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end">
                <div className="h-32 w-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-5xl font-bold text-blue-600">
                    {fisioterapeuta.nome.charAt(0)}
                  </span>
                </div>
                <div className="ml-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{fisioterapeuta.nome}</h1>
                  <p className="text-gray-600">{fisioterapeuta.especialidade}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contato
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{fisioterapeuta.nota}</p>
                  <p className="text-xs text-gray-600">{fisioterapeuta.avaliacoes} avaliações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">R$ {fisioterapeuta.valorHora}</p>
                  <p className="text-xs text-gray-600">por hora</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{fisioterapeuta.distancia} km</p>
                  <p className="text-xs text-gray-600">de distância</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-bold">{fisioterapeuta.telefone}</p>
                  <p className="text-xs text-gray-600">Contato</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Sobre */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{fisioterapeuta.descricao}</p>
              </CardContent>
            </Card>

            {/* Especialidades */}
            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {fisioterapeuta.especialidades.map((esp) => (
                    <span
                      key={esp}
                      className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Horários */}
            <Card>
              <CardHeader>
                <CardTitle>Horários de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(fisioterapeuta.horarios).map(([dia, horario]) => (
                    <div key={dia} className="flex justify-between">
                      <span className="font-medium capitalize">{dia}:</span>
                      <span className="text-gray-600">{horario}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Avaliações */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações dos Pacientes</CardTitle>
                <CardDescription>Últimas avaliações recebidas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fisioterapeuta.avaliacoesList.map((avaliacao) => (
                  <div key={avaliacao.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{avaliacao.paciente}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < avaliacao.nota
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{avaliacao.comentario}</p>
                    <p className="text-xs text-gray-500">{avaliacao.data}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Selos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Credenciais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {fisioterapeuta.selos.map((selo) => (
                  <div key={selo} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{selo}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Atendimento
                </Button>
                <Button variant="outline" className="w-full">
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>

            {/* Info Box */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <p className="text-xs text-gray-600">
                  ✓ Profissional validado e verificado
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Dados protegidos conforme LGPD
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Atendimento seguro e profissional
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
