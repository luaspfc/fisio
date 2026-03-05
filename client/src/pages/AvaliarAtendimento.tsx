import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageCircle, CheckCircle2 } from "lucide-react";

export default function AvaliarAtendimento() {
  const [step, setStep] = useState(1);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [aspectos, setAspectos] = useState({
    profissionalismo: 0,
    pontualidade: 0,
    comunicacao: 0,
    efetividade: 0,
  });
  const [recomendaria, setRecomendaria] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Mock data
  const atendimento = {
    fisioterapeuta: "Dr. João Silva",
    data: "15 de janeiro de 2024",
    hora: "14:00",
    especialidade: "Reabilitação Pós-Cirúrgica",
  };

  const aspectosLabels = {
    profissionalismo: "Profissionalismo",
    pontualidade: "Pontualidade",
    comunicacao: "Comunicação",
    efetividade: "Efetividade do Tratamento",
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Obrigado!</h2>
          <p className="mt-2 text-sm text-gray-600">Sua avaliação foi registrada com sucesso</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Sua avaliação ajuda a melhorar a qualidade dos serviços</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">✓ Avaliação Anônima</p>
                  <p className="text-xs text-blue-800">
                    Sua identidade não é revelada ao profissional. Apenas a nota média é exibida publicamente.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 font-medium mb-2">✓ Dados Protegidos</p>
                  <p className="text-xs text-green-800">
                    Seus comentários são criptografados e protegidos conforme LGPD.
                  </p>
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
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Avalie seu Atendimento</h2>
        <p className="mt-2 text-sm text-gray-600">Sua opinião é muito importante para nós</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {/* Info do Atendimento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{atendimento.fisioterapeuta}</p>
                <p className="text-sm text-gray-600">{atendimento.especialidade}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {atendimento.data} às {atendimento.hora}
                </p>
              </div>
            </div>
          </div>

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
            {/* Step 1: Nota Geral */}
            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 1: Como foi seu atendimento?
                </h3>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Clique nas estrelas para avaliar</p>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNota(star)}
                        onMouseEnter={() => setHoverNota(star)}
                        onMouseLeave={() => setHoverNota(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-12 w-12 ${
                            star <= (hoverNota || nota)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {nota > 0 && (
                    <p className="text-lg font-semibold text-gray-900">
                      {nota === 1 && "Ruim"}
                      {nota === 2 && "Fraco"}
                      {nota === 3 && "Bom"}
                      {nota === 4 && "Muito Bom"}
                      {nota === 5 && "Excelente"}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={nota === 0}
                  className="w-full"
                >
                  Próximo
                </Button>
              </>
            )}

            {/* Step 2: Aspectos Específicos */}
            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 2: Avalie os Aspectos
                </h3>

                <div className="space-y-4">
                  {Object.entries(aspectosLabels).map(([key, label]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setAspectos({
                                ...aspectos,
                                [key]: star,
                              })
                            }
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= (aspectos[key as keyof typeof aspectos] || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  <Button type="button" onClick={() => setStep(3)} className="flex-1">
                    Próximo
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Comentários e Recomendação */}
            {step === 3 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passo 3: Comentários e Recomendação
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Você recomendaria este profissional?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRecomendaria(true)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        recomendaria === true
                          ? "border-green-600 bg-green-50 text-green-600"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <ThumbsUp className="inline h-4 w-4 mr-2" />
                      Sim, recomendo!
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecomendaria(false)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        recomendaria === false
                          ? "border-red-600 bg-red-50 text-red-600"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Não recomendo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deixe um comentário (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Compartilhe sua experiência..."
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {comentario.length}/500 caracteres
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    ℹ️ Sua avaliação é anônima. Apenas a nota média será exibida publicamente, sem
                    identificação do avaliador.
                  </p>
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
                    ENVIAR AVALIAÇÃO
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Suas avaliações ajudam a manter a qualidade dos serviços e protegem a comunidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
