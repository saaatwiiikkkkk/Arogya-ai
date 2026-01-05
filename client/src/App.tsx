import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import DoctorDashboard from "@/pages/doctor";
import PatientDashboard from "@/pages/patient";

function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole: "doctor" | "patient" 
}) {
  const { isAuthenticated, userRole } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    } else if (userRole !== requiredRole) {
      navigate(userRole === "doctor" ? "/doctor" : "/patient", { replace: true });
    }
  }, [isAuthenticated, userRole, requiredRole, navigate]);

  if (!isAuthenticated || userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(userRole === "doctor" ? "/doctor" : "/patient", { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  if (isAuthenticated && userRole) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth">
        <AuthRedirect>
          <Auth />
        </AuthRedirect>
      </Route>
      <Route path="/doctor">
        <ProtectedRoute requiredRole="doctor">
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/:page">
        <ProtectedRoute requiredRole="doctor">
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/patient">
        <ProtectedRoute requiredRole="patient">
          <PatientDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/patient/:page">
        <ProtectedRoute requiredRole="patient">
          <PatientDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
