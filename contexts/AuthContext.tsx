import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: "client" | "provider";
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  selectedRole: "client" | "provider" | null;
  setSelectedRole: (role: "client" | "provider" | null) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AUTH_DELAY_MS = 600;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function makeMockUser(params: {
  email: string;
  name?: string;
  role: "client" | "provider";
  onboardingComplete: boolean;
}): User {
  const { email, name, role, onboardingComplete } = params;
  return {
    id: `mock_${role}_${Date.now()}`,
    email,
    name: name || email.split("@")[0],
    role,
    onboardingComplete,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRoleState] = useState<"client" | "provider" | null>(null);

  const setSelectedRole = async (role: "client" | "provider" | null) => {
    setSelectedRoleState(role);
  };

  const fetchUser = async () => {
    // UI mock only: no real session lookup.
    setIsLoading(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    void password;
    const role = selectedRole || "client";
    setIsLoading(true);
    await delay(MOCK_AUTH_DELAY_MS);
    setUser(
      makeMockUser({
        email,
        role,
        onboardingComplete: true,
      })
    );
    setIsLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    void password;
    const role = selectedRole || "client";
    setIsLoading(true);
    await delay(MOCK_AUTH_DELAY_MS);
    setUser(
      makeMockUser({
        email,
        name,
        role,
        onboardingComplete: false,
      })
    );
    setIsLoading(false);
  };

  const signInWithSocial = async (provider: "google" | "apple" | "github") => {
    void provider;
    const role = selectedRole || "client";
    setIsLoading(true);
    await delay(MOCK_AUTH_DELAY_MS);
    setUser(
      makeMockUser({
        email: `${role}.mock@example.com`,
        role,
        onboardingComplete: true,
      })
    );
    setIsLoading(false);
  };

  const signInWithGoogle = () => signInWithSocial("google");
  const signInWithApple = () => signInWithSocial("apple");
  const signInWithGitHub = () => signInWithSocial("github");

  const signOut = async () => {
    setIsLoading(true);
    await delay(250);
    setUser(null);
    setSelectedRoleState(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const completeOnboarding = async () => {
    setUser((prev) => (prev ? { ...prev, onboardingComplete: true } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        selectedRole,
        setSelectedRole,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
        refreshUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
