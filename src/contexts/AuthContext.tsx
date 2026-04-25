"use client";

// Stub AuthContext — returns null user until #08 (Authentication) is implemented.
import { createContext, useContext } from "react";

interface AuthContextValue {
  user: null;
}

const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
