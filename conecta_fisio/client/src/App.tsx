import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GerenciarAssinatura from "./pages/GerenciarAssinatura";
import SugestoesClinicas from "./pages/SugestoesClinicas";
import AvaliarAtendimento from "./pages/AvaliarAtendimento";
import AdminDashboard from "./pages/AdminDashboard";
import BuscaFisioterapeutas from "./pages/BuscaFisioterapeutas";
import CadastroFisioterapeuta from "./pages/CadastroFisioterapeuta";
import PerfilFisioterapeuta from "./pages/PerfilFisioterapeuta";
import AgendarAtendimento from "./pages/AgendarAtendimento";
import VisualizarProntuario from "./pages/VisualizarProntuario";
import FisioterapeutaDashboard from "./pages/FisioterapeutaDashboard";
import PacienteDashboard from "./pages/PacienteDashboard";
import ScholarFinder from "./pages/ScholarFinder";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/gerenciar-assinatura"} component={GerenciarAssinatura} />
      <Route path={"/dashboard/fisioterapeuta"} component={FisioterapeutaDashboard} />
      <Route path={"/dashboard/paciente"} component={PacienteDashboard} />
      <Route path={"/dashboard/admin"} component={AdminDashboard} />
      <Route path={"/buscar"} component={BuscaFisioterapeutas} />
      <Route path={"/cadastro-fisioterapeuta"} component={CadastroFisioterapeuta} />
      <Route path={"/perfil/:id"} component={PerfilFisioterapeuta} />
      <Route path={"/agendar/:id"} component={AgendarAtendimento} />
      <Route path={"/prontuario/:id"} component={VisualizarProntuario} />
      <Route path={"/avaliar/:id"} component={AvaliarAtendimento} />
      <Route path={"/sugestoes-clinicas/:id"} component={SugestoesClinicas} />
      <Route path={"/busca-cientifica"} component={ScholarFinder} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
