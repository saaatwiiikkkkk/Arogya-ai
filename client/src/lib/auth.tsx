import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserRole, AuthState } from "@shared/schema";

interface AuthContextType extends AuthState {
  login: (role: UserRole, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generatePatientId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "PAT-";
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  const login = useCallback((role: UserRole, _email: string) => {
    const patientId = role === "patient" ? generatePatientId() : null;
    setAuthState({
      userRole: role,
      patientId,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      userRole: null,
      patientId: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("authState");
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
