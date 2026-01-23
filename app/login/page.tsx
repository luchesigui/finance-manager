"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred during sign-up");
      } else {
        if (data.requiresConfirmation) {
          setError("Check your email for the confirmation link.");
        } else {
          // Auto-confirmed, redirect to home
          router.push("/");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-noir-bg-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-noir-text-heading">
          {view === "sign-in" ? "Entrar na sua conta" : "Criar nova conta"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="bg-noir-bg-surface py-8 px-4 shadow sm:rounded-card sm:px-10"
          style={{
            borderColor: "rgba(255, 255, 255, 0.05)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <form className="space-y-6" onSubmit={view === "sign-in" ? handleSignIn : handleSignUp}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-noir-text-body">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-interactive bg-noir-bg-primary text-noir-text-body px-3 py-2 placeholder-noir-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-noir-accent-primary sm:text-sm"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-noir-text-body">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-interactive bg-noir-bg-primary text-noir-text-body px-3 py-2 placeholder-noir-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-noir-accent-primary sm:text-sm"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="text-noir-accent-negative text-sm bg-noir-accent-negative/20 p-2 rounded-interactive">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-interactive bg-noir-accent-primary py-2 px-4 text-sm font-medium text-noir-text-on-accent shadow-sm hover:bg-noir-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-noir-accent-primary focus:ring-offset-2 disabled:opacity-50 glow-accent"
                style={{ borderColor: "transparent" }}
              >
                {loading ? "Carregando..." : view === "sign-in" ? "Entrar" : "Cadastrar"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full"
                  style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-noir-bg-surface px-2 text-noir-text-muted">Ou</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setView(view === "sign-in" ? "sign-up" : "sign-in");
                  setError(null);
                }}
                className="flex w-full justify-center rounded-interactive bg-noir-bg-primary py-2 px-4 text-sm font-medium text-noir-text-body shadow-sm hover:bg-noir-bg-active focus:outline-none focus:ring-2 focus:ring-noir-accent-primary focus:ring-offset-2"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                {view === "sign-in" ? "Criar uma conta" : "Já tenho uma conta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
