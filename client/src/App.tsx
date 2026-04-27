import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import { Suspense, lazy } from "react";

// Lazy load pages for better code splitting
const DesviosList = lazy(() => import("./pages/DesviosList"));
const DesvioNovo = lazy(() => import("./pages/DesvioNovo"));
const DesvioDetalhe = lazy(() => import("./pages/DesvioDetalhe"));
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const Obras = lazy(() => import("./pages/Obras"));
const Assistente = lazy(() => import("./pages/Assistente"));
const Relatorio = lazy(() => import("./pages/Relatorio"));
const Verificacoes = lazy(() => import("./pages/Verificacoes"));
const NovaVerificacao = lazy(() => import("./pages/NovaVerificacao"));
const VerificacaoDetalhe = lazy(() => import("./pages/VerificacaoDetalhe"));
const Administracao = lazy(() => import("./pages/Administracao"));
const Usuarios = lazy(() => import("./pages/Usuarios"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
  );
}

function Router() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/desvios" component={DesviosList} />
          <Route path="/desvios/novo" component={DesvioNovo} />
          <Route path="/desvios/:id" component={DesvioDetalhe} />
          <Route path="/fornecedores" component={Fornecedores} />
          <Route path="/obras" component={Obras} />
          <Route path="/assistente" component={Assistente} />
          <Route path="/relatorio" component={Relatorio} />
          <Route path="/verificacoes" component={Verificacoes} />
          <Route path="/verificacoes/nova" component={NovaVerificacao} />
          <Route path="/verificacoes/:id" component={VerificacaoDetalhe} />
          <Route path="/usuarios" component={Usuarios} />
          <Route path="/administracao" component={Administracao} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
