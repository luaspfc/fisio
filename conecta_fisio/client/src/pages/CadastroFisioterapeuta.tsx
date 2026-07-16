import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function CadastroFisioterapeuta() {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    crefito: "",
    especialidades: [] as string[],
    enderecoCidade: "",
    enderecoCEP: "",
    raioAtendimento: "",
    valorHora: "",
    telefone: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const especialidadesDisponiveis = [
    "Reabilitação Pós-Cirúrgica",
    "Fisioterapia Desportiva",
    "Reabilitação Neurológica",
    "Fisioterapia Respiratória",
    "Osteopatia",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEspecialidade = (esp: string) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter((e) => e !== esp)
        : [...prev.especialidades, esp],
    }));
  };

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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Cadastro Enviado!</h2>
          <p className="mt-2 text-sm text-gray-600">Sua solicitação foi recebida com sucesso</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Próximos Passos</h3>
              <div className="space-y-3 text-sm text-gray-600 text-left">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <p>Sua documentação será analisada por nosso time administrativo</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <p>Validaremos seu CREFITO junto ao conselho profissional</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <p>Você receberá um e-mail quando seu perfil estiver ativo</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-4">Tempo estimado: 2 a 5 dias úteis</p>
                <Button className="w-full">Voltar para Home</Button>
              </div>
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
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Cadastro de Fisioterapeuta</h2>
        <p className="mt-2 text-sm text-gray-600">Preencha seus dados profissionais para começar</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 mx-1 rounded-full ${
                  step <= currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 1: Informações Básicas
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <Input
                    type="text"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CREFITO</label>
                  <Input
                    type="text"
                    name="crefito"
                    value={formData.crefito}
                    onChange={handleInputChange}
                    placeholder="Ex: 123456"
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Seu CREFITO será validado junto ao conselho profissional
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <Input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                    required
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full"
                >
                  Próximo
                </Button>
              </>
            )}

            {/* Step 2: Especialidades e Localização */}
            {currentStep === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 2: Especialidades e Localização
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Especialidades (selecione pelo menos uma)
                  </label>
                  <div className="space-y-2">
                    {especialidadesDisponiveis.map((esp) => (
                      <label key={esp} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.especialidades.includes(esp)}
                          onChange={() => toggleEspecialidade(esp)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{esp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <Input
                      type="text"
                      name="enderecoCidade"
                      value={formData.enderecoCidade}
                      onChange={handleInputChange}
                      placeholder="São Paulo"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <Input
                      type="text"
                      name="enderecoCEP"
                      value={formData.enderecoCEP}
                      onChange={handleInputChange}
                      placeholder="01310-100"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Raio de Atendimento (km)
                  </label>
                  <Input
                    type="number"
                    name="raioAtendimento"
                    value={formData.raioAtendimento}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    Próximo
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Valores */}
            {currentStep === 3 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 3: Valores e Confirmação
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor por Hora (R$)
                  </label>
                  <Input
                    type="number"
                    name="valorHora"
                    value={formData.valorHora}
                    onChange={handleInputChange}
                    placeholder="150.00"
                    step="0.01"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Resumo do Cadastro</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Nome:</span> {formData.nomeCompleto}
                    </p>
                    <p>
                      <span className="font-medium">CREFITO:</span> {formData.crefito}
                    </p>
                    <p>
                      <span className="font-medium">Especialidades:</span>{" "}
                      {formData.especialidades.join(", ")}
                    </p>
                    <p>
                      <span className="font-medium">Localização:</span> {formData.enderecoCidade}
                    </p>
                    <p>
                      <span className="font-medium">Valor/Hora:</span> R$ {formData.valorHora}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Seus dados serão verificados por nosso time. Você receberá um e-mail quando seu
                    perfil estiver ativo.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1">
                    ENVIAR CADASTRO
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao cadastrar, você concorda com nossos{" "}
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
