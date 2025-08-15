
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          // Clear user and session state immediately on sign out
          setSession(null);
          setUser(null);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Force clear local storage first to ensure we don't have stale session data
      localStorage.removeItem('supabase.auth.token');
      
      // Only attempt to call Supabase signOut if we have a session
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      toast.success("Sesión cerrada exitosamente");
    } catch (error: any) {
      console.error("Error during sign out:", error);
      
      // Even if there's an error, make sure we clear local state
      localStorage.removeItem('sb-ncmgxsrlzbqyqkowomkr-auth-token');
      
      // Check if it's a session missing error - not a critical error to show to user
      if (error.message && error.message.includes("Auth session missing")) {
        console.log("No active session to sign out from, proceeding anyway");
        toast.success("Sesión cerrada exitosamente");
      } else {
        toast.error("Error al cerrar sesión: " + (error?.message || "Error desconocido"));
      }
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
