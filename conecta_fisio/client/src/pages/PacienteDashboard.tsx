import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function PacienteDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="p-4">Acesso negado. Faça login como paciente.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Atendimentos</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo, {user?.name}! Acompanhe seus atendimentos e prontuário aqui.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Atendimento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoje</div>
              <p className="text-xs text-muted-foreground">14:00 com Fisioterapeuta Silva</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendimentos Realizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meu Prontuário</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="text-xs text-muted-foreground">Última atualização há 2 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Próximos Atendimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Atendimentos</CardTitle>
              <CardDescription>Sua agenda para os próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Fisioterapeuta Silva</p>
                    <p className="text-sm text-muted-foreground">Hoje às 14:00</p>
                    <p className="text-xs text-muted-foreground">Endereço: Rua A, 123</p>
                  </div>
                  <Button size="sm" variant="default">
                    Confirmar
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Fisioterapeuta Santos</p>
                    <p className="text-sm text-muted-foreground">Quarta às 10:00</p>
                    <p className="text-xs text-muted-foreground">Endereço: Rua B, 456</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Minha Saúde</CardTitle>
              <CardDescription>Informações sobre seu tratamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Ver Meu Prontuário
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Novo Atendimento
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Baixar Contrato Digital
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Suporte e Dúvidas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Avisos Importantes */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Avisos Importantes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Você receberá um lembrete 24h antes de cada atendimento</li>
              <li>✓ Seu prontuário é criptografado e protegido por LGPD</li>
              <li>✓ Você pode baixar seu contrato digital a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
