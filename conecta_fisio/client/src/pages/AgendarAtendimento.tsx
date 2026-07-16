import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, DollarSign, CheckCircle2 } from "lucide-react";

export default function AgendarAtendimento() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Mock data
  const fisioterapeuta = {
    nome: "Dr. João Silva",
    especialidade: "Reabilitação Pós-Cirúrgica",
    valorHora: 150,
  };

  const horariosDisponiveis = [
    "08:00",
    "09:00",
    "10:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <img
            className="mx-auto h-20 w-auto"
            src="/images/logo-conectafisio.png"
            alt="ConectaFisio"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Agendamento Confirmado!</h2>
          <p className="mt-2 text-sm text-gray-600">Seu atendimento foi agendado com sucesso</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">J</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{fisioterapeuta.nome}</p>
                    <p className="text-sm text-gray-600">{fisioterapeuta.especialidade}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span>{endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>R$ {fisioterapeuta.valorHora}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 text-left mb-6">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <p>Você receberá um lembrete 24h antes do atendimento</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <p>O profissional confirmará sua disponibilidade em breve</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <p>Você pode cancelar com até 24h de antecedência</p>
                </div>
              </div>

              <Button className="w-full">Voltar para Home</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          className="mx-auto h-20 w-auto"
          src="/images/logo-conectafisio.png"
          alt="ConectaFisio"
        />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Agendar Atendimento</h2>
        <p className="mt-2 text-sm text-gray-600">com {fisioterapeuta.nome}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {/* Progress */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 mx-1 rounded-full ${
                  s <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Data */}
            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 1: Escolha a Data
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data do Atendimento
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Próximos 30 dias disponíveis
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedDate}
                  className="w-full"
                >
                  Próximo
                </Button>
              </>
            )}

            {/* Step 2: Horário */}
            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 2: Escolha o Horário
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Horários Disponíveis
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {horariosDisponiveis.map((horario) => (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => setSelectedTime(horario)}
                        className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all ${
                          selectedTime === horario
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {horario}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!selectedTime}
                    className="flex-1"
                  >
                    Próximo
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Endereço e Observações */}
            {step === 3 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 3: Endereço e Observações
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Endereço de Atendimento
                  </label>
                  <Input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, complemento, cidade"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Informações adicionais sobre seu caso..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                  />
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profissional:</span>
                      <span className="font-medium">{fisioterapeuta.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horário:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-bold text-green-600">R$ {fisioterapeuta.valorHora}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1">
                    CONFIRMAR AGENDAMENTO
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao agendar, você concorda com nossos{" "}
              <a href="#" className="underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="underline">
                Política de Privacidade (LGPD)
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
