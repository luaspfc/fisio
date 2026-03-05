import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  MapPin,
  Star,
  Shield,
  Calendar,
  FileText,
  Brain,
  Bell,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Heart,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const getDashboardUrl = () => {
    if (!user) return "/";
    if (user.role === "fisioterapeuta") return "/dashboard/fisioterapeuta";
    if (user.role === "admin") return "/dashboard/admin";
    return "/dashboard/paciente";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-blue-600 fill-blue-600" />
            <span className="text-xl font-bold text-gray-900">ConectaFisio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">Como Funciona</a>
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-blue-600 transition-colors">Planos</a>
            <a href="#contato" className="hover:text-blue-600 transition-colors">Contato</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => setLocation(getDashboardUrl())}>
                Meu Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
                <Button asChild>
                  <a href={getLoginUrl()}>Começar Grátis</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-28">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 px-4 py-1.5 text-sm">
            Plataforma Completa de Fisioterapia Domiciliar
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Conecte-se ao melhor{" "}
            <span className="text-blue-600">fisioterapeuta</span>{" "}
            perto de você
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Agenda inteligente com cálculo de deslocamento, prontuário eletrônico seguro e suporte à
            decisão clínica baseado em Inteligência Artificial. Tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8 py-6" asChild>
              <a href="/buscar">
                <MapPin className="mr-2 h-5 w-5" />
                Encontrar Fisioterapeuta
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
              <a href="/cadastro-fisioterapeuta">
                Sou Fisioterapeuta
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>CREFITO Validado</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Conformidade LGPD</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span>Avaliações Verificadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>Suporte com IA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-extrabold mb-1">500+</div>
              <div className="text-blue-200 text-sm">Fisioterapeutas</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-1">10k+</div>
              <div className="text-blue-200 text-sm">Atendimentos</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-1">4.9</div>
              <div className="text-blue-200 text-sm">Nota Média</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-1">50+</div>
              <div className="text-blue-200 text-sm">Cidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Em poucos passos você agenda sua sessão de fisioterapia domiciliar
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Busque", desc: "Encontre fisioterapeutas validados perto de você por especialidade e localização", icon: MapPin },
              { step: "2", title: "Escolha", desc: "Veja perfis, avaliações e disponibilidade de horários dos profissionais", icon: Star },
              { step: "3", title: "Agende", desc: "Escolha o horário e confirme o agendamento com cálculo automático de deslocamento", icon: Calendar },
              { step: "4", title: "Receba", desc: "Seu fisioterapeuta vai até você com prontuário digital e acompanhamento completo", icon: Heart },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">
                  {step}
                </div>
                <Icon className="h-6 w-6 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
            <p className="text-gray-600 text-lg">Funcionalidades profissionais para pacientes e fisioterapeutas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                color: "bg-blue-100 text-blue-600",
                title: "Agenda Inteligente",
                desc: "Cálculo automático de deslocamento com Google Maps. Prevenção de overbooking e gestão completa de horários.",
              },
              {
                icon: FileText,
                color: "bg-green-100 text-green-600",
                title: "Prontuário Eletrônico",
                desc: "Armazenamento seguro com criptografia AES-256-GCM. Histórico de evolução, anexos e compartilhamento controlado.",
              },
              {
                icon: Brain,
                color: "bg-purple-100 text-purple-600",
                title: "Suporte com IA",
                desc: "Sugestões clínicas baseadas em artigos científicos usando RAG e Deep Learning. Recomendações personalizadas.",
              },
              {
                icon: Shield,
                color: "bg-red-100 text-red-600",
                title: "Segurança LGPD",
                desc: "Conformidade total com a Lei Geral de Proteção de Dados. Auditoria completa e controle de acesso por papéis.",
              },
              {
                icon: Bell,
                color: "bg-yellow-100 text-yellow-600",
                title: "Lembretes Automáticos",
                desc: "Notificações via WhatsApp e Email 24h antes dos atendimentos. Reduza faltas e melhore o engajamento.",
              },
              {
                icon: Award,
                color: "bg-indigo-100 text-indigo-600",
                title: "Avaliação Ética",
                desc: "Sistema de avaliações anônimas sem ranking público. Selos automáticos de qualidade baseados em aspectos éticos.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <Card key={title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For physios section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100 border-0">
                Para Fisioterapeutas
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Gerencie sua prática com eficiência
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                ConectaFisio oferece todas as ferramentas que você precisa para administrar sua
                agenda, acompanhar pacientes e crescer profissionalmente.
              </p>
              <ul className="space-y-4">
                {[
                  "Dashboard completo com agenda e estatísticas",
                  "Validação automática de CREFITO",
                  "Prontuário eletrônico seguro e criptografado",
                  "Cálculo automático de deslocamento e precificação",
                  "Sugestões clínicas baseadas em evidências científicas",
                  "Relatórios e análise de desempenho",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg" asChild>
                <a href="/cadastro-fisioterapeuta">
                  Cadastrar como Fisioterapeuta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="space-y-4">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Pacientes Ativos</div>
                      <div className="text-2xl font-bold text-blue-600">12</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">+2 novos este mês</div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Agendamentos</div>
                      <div className="text-2xl font-bold text-green-600">4 hoje</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">João S. - 14:00</Badge>
                    <Badge variant="outline" className="text-xs">Maria L. - 16:30</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600 fill-yellow-500" />
                    </div>
                    <div>
                      <div className="font-semibold">Sua Avaliação</div>
                      <div className="text-2xl font-bold text-yellow-600">4.8 ⭐</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Baseado em 24 avaliações verificadas</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-gray-600 text-lg">Escolha o plano ideal para você</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Paciente - Grátis */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <Badge className="w-fit mx-auto mb-3 bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
                  Paciente
                </Badge>
                <CardTitle className="text-2xl">Grátis</CardTitle>
                <CardDescription>Para quem busca atendimento</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Buscar fisioterapeutas",
                    "Agendamento online",
                    "Visualizar prontuário",
                    "Avaliações e feedbacks",
                    "Lembretes automáticos",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <a href={getLoginUrl()}>Criar Conta Grátis</a>
                </Button>
              </CardContent>
            </Card>

            {/* Fisioterapeuta - R$99,99 */}
            <Card className="border-2 border-blue-500 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-0 px-4">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <Badge className="w-fit mx-auto mb-3 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">
                  Fisioterapeuta
                </Badge>
                <CardTitle className="text-2xl">R$ 99,99</CardTitle>
                <CardDescription>por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Perfil verificado com CREFITO",
                    "Agenda inteligente completa",
                    "Prontuário eletrônico criptografado",
                    "Sugestões clínicas com IA",
                    "Notificações automáticas",
                    "Relatórios e estatísticas",
                    "Suporte prioritário",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" asChild>
                  <a href="/cadastro-fisioterapeuta">Começar Agora</a>
                </Button>
              </CardContent>
            </Card>

            {/* Clínica */}
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <Badge className="w-fit mx-auto mb-3 bg-purple-100 text-purple-600 hover:bg-purple-100 border-0">
                  Clínica
                </Badge>
                <CardTitle className="text-2xl">Personalizado</CardTitle>
                <CardDescription>Para equipes e clínicas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Tudo do plano Fisioterapeuta",
                    "Múltiplos profissionais",
                    "Painel administrativo",
                    "Relatórios avançados",
                    "Integração com sistemas",
                    "SLA garantido",
                    "Gerente de conta dedicado",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <a href="#contato">Falar com Vendas</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">O que dizem nossos usuários</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Lima",
                role: "Paciente",
                city: "São Paulo, SP",
                stars: 5,
                text: "Encontrei um ótimo fisioterapeuta em menos de 5 minutos. O agendamento foi simples e o profissional chegou no horário certo. Recomendo!",
              },
              {
                name: "Dr. Pedro Costa",
                role: "Fisioterapeuta",
                city: "Rio de Janeiro, RJ",
                stars: 5,
                text: "O sistema de agenda inteligente economizou horas do meu dia. O cálculo de deslocamento é preciso e nunca mais tive problemas de sobreposição de horários.",
              },
              {
                name: "Carla Mendes",
                role: "Paciente",
                city: "Curitiba, PR",
                stars: 5,
                text: "A facilidade de acessar meu prontuário digital e ver o histórico das sessões me dá muita segurança. A plataforma é excelente!",
              },
            ].map(({ name, role, city, stars, text }) => (
              <Card key={name} className="border-0 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic leading-relaxed">"{text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{name}</div>
                    <div className="text-sm text-gray-500">{role} • {city}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de pacientes e fisioterapeutas que já usam o ConectaFisio
            para um atendimento mais eficiente e seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-base px-8 py-6" asChild>
              <a href="/buscar">
                <MapPin className="mr-2 h-5 w-5" />
                Encontrar Fisioterapeuta
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 text-base px-8 py-6" asChild>
              <a href="/cadastro-fisioterapeuta">
                Cadastrar como Profissional
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400 fill-blue-400" />
                <span className="text-white font-bold text-lg">ConectaFisio</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Plataforma inteligente que conecta pacientes e fisioterapeutas com tecnologia de ponta.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/buscar" className="hover:text-white transition-colors">Buscar Fisioterapeutas</a></li>
                <li><a href="/cadastro-fisioterapeuta" className="hover:text-white transition-colors">Seja um Profissional</a></li>
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>suporte@conectafisio.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>+55 (11) 98765-4321</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 ConectaFisio. Todos os direitos reservados.
            </p>
            <p className="text-sm text-gray-500">
              Desenvolvido com ❤️ para a saúde do Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
