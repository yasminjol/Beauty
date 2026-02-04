import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { authClient, setBearerToken, clearAuthTokens } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: 'client' | 'provider';
  onboardingComplete?: boolean;
}

const USER_ROLE_KEY = 'EWAJI_user_role';
const ONBOARDING_COMPLETE_KEY = 'EWAJI_onboarding_complete';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  selectedRole: 'client' | 'provider' | null;
  setSelectedRole: (role: 'client' | 'provider' | null) => Promise<void>;
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

function openOAuthPopup(provider: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Failed to open popup. Please allow popups."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        reject(new Error(event.data.error || "OAuth failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRoleState] = useState<'client' | 'provider' | null>(null);

  const setSelectedRole = async (role: 'client' | 'provider' | null) => {
    setSelectedRoleState(role);
    if (role) {
      // Store role in persistent storage
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_ROLE_KEY, role);
      } else {
        await SecureStore.setItemAsync(USER_ROLE_KEY, role);
      }
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for deep links (e.g. from social auth redirects)
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("Deep link received, refreshing user session");
      // Allow time for the client to process the token if needed
      setTimeout(() => fetchUser(), 500);
    });

    // POLLING: Refresh session every 5 minutes to keep SecureStore token in sync
    // This prevents 401 errors when the session token rotates
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing user session to sync token...");
      fetchUser();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const baseUser = session.data.user as User;
        
        // Sync token to SecureStore for utils/api.ts
        if (session.data.session?.token) {
          await setBearerToken(session.data.session.token);
        }

        // Get role and onboarding status from storage
        let role: 'client' | 'provider' | undefined;
        let onboardingComplete = false;

        if (Platform.OS === 'web') {
          role = (localStorage.getItem(USER_ROLE_KEY) as 'client' | 'provider') || selectedRole || undefined;
          onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
        } else {
          const storedRole = await SecureStore.getItemAsync(USER_ROLE_KEY);
          role = (storedRole as 'client' | 'provider') || selectedRole || undefined;
          const storedOnboarding = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
          onboardingComplete = storedOnboarding === 'true';
        }

        setUser({
          ...baseUser,
          role,
          onboardingComplete,
        });
      } else {
        setUser(null);
        await clearAuthTokens();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await authClient.signIn.email({ email, password });
      await fetchUser();
    } catch (error) {
      console.error("Email sign in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      await authClient.signUp.email({
        email,
        password,
        name,
        // Ensure name is passed in header or logic if required, usually passed in body
      });
      await fetchUser();
    } catch (error) {
      console.error("Email sign up failed:", error);
      throw error;
    }
  };

  const signInWithSocial = async (provider: "google" | "apple" | "github") => {
    try {
      if (Platform.OS === "web") {
        const token = await openOAuthPopup(provider);
        await setBearerToken(token);
        await fetchUser();
      } else {
        // Native: Use expo-linking to generate a proper deep link
        const callbackURL = Linking.createURL("/onboarding/client-name");
        await authClient.signIn.social({
          provider,
          callbackURL,
        });
        // Note: The redirect will reload the app or be handled by deep linking.
        // fetchUser will be called on mount or via event listener if needed.
        // For simple flow, we might need to listen to URL events.
        // But better-auth expo client handles the redirect and session storage?
        // We typically need to wait or rely on fetchUser on next app load.
        // For now, call fetchUser just in case.
        await fetchUser();
      }
    } catch (error) {
      console.error(`${provider} sign in failed:`, error);
      throw error;
    }
  };

  const signInWithGoogle = () => signInWithSocial("google");
  const signInWithApple = () => signInWithSocial("apple");
  const signInWithGitHub = () => signInWithSocial("github");

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed (API):", error);
    } finally {
       // Always clear local state
       setUser(null);
       setSelectedRoleState(null);
       await clearAuthTokens();
       
       // Clear role and onboarding status
       if (Platform.OS === 'web') {
         localStorage.removeItem(USER_ROLE_KEY);
         localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
       } else {
         await SecureStore.deleteItemAsync(USER_ROLE_KEY);
         await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
       }
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const completeOnboarding = async () => {
    console.log('[AuthContext] Onboarding completed');
    // Mark onboarding as complete in storage
    if (Platform.OS === 'web') {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } else {
      await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true');
    }
    // Update user state
    if (user) {
      setUser({ ...user, onboardingComplete: true });
    }
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
