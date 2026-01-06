import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserRole, AuthState } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (username: string, password: string, role?: UserRole) => Promise<void>;
  register: (username: string, password: string, role: UserRole, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("authState");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { userRole: null, patientId: null, isAuthenticated: false };
      }
    }
    return { userRole: null, patientId: null, isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem("authState", JSON.stringify(authState));
  }, [authState]);

  const login = useCallback(async (username: string, password: string, role?: UserRole) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await res.json();
      setAuthState({
        userRole: data.role,
        patientId: data.patient_id,
        isAuthenticated: true,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      throw error;
    }
  }, [toast]);

  const register = useCallback(async (username: string, password: string, role: UserRole, name?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Registration failed");
      }

      const data = await res.json();
      setAuthState({
        userRole: data.role,
        patientId: data.patient_id,
        isAuthenticated: true,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
      throw error;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setAuthState({
      userRole: null,
      patientId: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("authState");
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
