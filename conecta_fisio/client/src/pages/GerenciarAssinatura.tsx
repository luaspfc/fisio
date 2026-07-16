import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, CreditCard, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

/**
 * Página de Gerenciamento de Assinatura
 * Permite fisioterapeutas gerenciar sua assinatura Hotmart
 */
export default function GerenciarAssinatura() {
  const { user } = useAuth();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Queries
  const statusQuery = trpc.pagamentos.obterStatusAssinatura.useQuery(undefined, {
    enabled: user?.role === "fisioterapeuta",
  });

  const precoQuery = trpc.pagamentos.obterPreco.useQuery();
  const infoFaturamentoQuery = trpc.pagamentos.obterInfoFaturamento.useQuery(undefined, {
    enabled: user?.role === "fisioterapeuta",
  });

  // Mutations
  const criarCheckoutMutation = trpc.pagamentos.criarCheckout.useMutation();
  const cancelarAssinaturaMutation = trpc.pagamentos.cancelarAssinatura.useMutation();

  // Handlers
  const handleCriarCheckout = async () => {
    if (!user?.email || !user?.name) return;

    setLoading(true);
    try {
      const result = await criarCheckoutMutation.mutateAsync({
        email: user.email,
        name: user.name,
      });

      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
        // Redirecionar para Hotmart
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarAssinatura = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você não poderá mais agendar sessões.")) {
      return;
    }

    try {
      // TODO: Implementar cancelamento
      alert("Funcionalidade em desenvolvimento");
    } catch (error) {
      console.error("Erro ao cancelar:", error);
    }
  };

  if (user?.role !== "fisioterapeuta") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md p-8 shadow-xl border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-center text-gray-600">
            Apenas fisioterapeutas podem acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  const preco = precoQuery.data;
  const status = statusQuery.data;
  const isActive = status?.ativo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Assinatura</h1>
          <p className="text-gray-600">Gerencie sua assinatura e acesso à plataforma ConectaFisio</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6 p-6 shadow-xl border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Status da Assinatura</h2>

              {statusQuery.isLoading ? (
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
              ) : isActive ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Assinatura Ativa</span>
                </div>
              ) : status?.status === "nao_iniciado" ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-700 font-medium">Assinatura Não Iniciada</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Assinatura Inativa</span>
                </div>
              )}

              {status?.dataInicio && (
                <p className="text-sm text-gray-600 mt-2">
                  Data de início: {new Date(status.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              )}

              {status?.proximoBilhete && (
                <p className="text-sm text-gray-600">
                  Próximo bilhete: {new Date(status.proximoBilhete).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>

            <Badge
              variant={isActive ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {isActive ? "ATIVO" : "INATIVO"}
            </Badge>
          </div>
        </Card>

        {/* Aviso se não ativo */}
        {!isActive && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200 shadow-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Assinatura Inativa</h3>
                <p className="text-red-700 text-sm">
                  Você não pode agendar novas sessões sem uma assinatura ativa. Clique em "Ativar Assinatura" abaixo para continuar.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Plano Card */}
        {preco && (
          <Card className="mb-6 p-6 shadow-xl border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plano ConectaFisio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preço */}
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  R$ {preco.valor.toFixed(2)}
                </div>
                <p className="text-gray-600 mb-4">por mês</p>

                <div className="space-y-2 mb-6">
                  {preco.beneficios.map((beneficio: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-sm">{beneficio}</span>
                    </div>
                  ))}
                </div>

                {!isActive ? (
                  <Button
                    onClick={handleCriarCheckout}
                    disabled={loading || criarCheckoutMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loading ? "Redirecionando..." : "Ativar Assinatura"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 font-semibold py-3 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Assinatura Ativa
                  </Button>
                )}
              </div>

              {/* Informações de Faturamento */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Informações de Faturamento</h3>

                {infoFaturamentoQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : infoFaturamentoQuery.data ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Email de Faturamento</p>
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Método de Pagamento</p>
                      <p className="text-sm font-medium text-gray-900">Cartão de Crédito</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Próximo Bilhete</p>
                      <p className="text-sm font-medium text-gray-900">
                        {status?.proximoBilhete
                          ? new Date(status.proximoBilhete).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Nenhuma informação de faturamento disponível</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Histórico de Faturas */}
        <Card className="p-6 shadow-xl border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Faturas</h2>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhuma fatura disponível ainda</p>
            <p className="text-sm text-gray-500 mt-1">Suas faturas aparecerão aqui após o primeiro pagamento</p>
          </div>
        </Card>

        {/* Ações */}
        {isActive && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open("https://hotmart.com/minha-conta", "_blank")}
              className="flex-1 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Gerenciar na Hotmart
            </Button>

            <Button
              variant="destructive"
              onClick={handleCancelarAssinatura}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
            >
              Cancelar Assinatura
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
