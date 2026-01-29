"use client";

import { useForm } from "@tanstack/react-form";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldError } from "@/components/ui/FieldError";
import { zodValidator } from "@/lib/form";
import { emailSchema, passwordSchema } from "@/lib/formSchemas";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (view === "sign-in") {
        await handleSignIn(value.email, value.password);
      } else {
        await handleSignUp(value.email, value.password);
      }
    },
  });

  const handleSignIn = async (email: string, password: string) => {
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

  const handleSignUp = async (email: string, password: string) => {
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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-noir-primary">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-positive/10 rounded-full blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-accent-primary p-3 rounded-card shadow-glow-accent">
            <Wallet size={32} className="text-white" />
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-heading">
          {view === "sign-in" ? "Entrar na sua conta" : "Criar nova conta"}
        </h2>
        <p className="mt-2 text-center text-sm text-body">
          Finanças<span className="text-accent-primary font-semibold">Pro</span> - Controle
          financeiro familiar
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="noir-card py-8 px-6 sm:px-10">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div>
              <form.Field
                name="email"
                validators={{
                  onBlur: zodValidator(emailSchema),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name} className="block text-sm font-medium text-heading">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`noir-input w-full ${field.state.meta.errors.length > 0 ? "border-accent-negative" : ""}`}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field
                name="password"
                validators={{
                  onBlur: zodValidator(passwordSchema),
                }}
              >
                {(field) => (
                  <>
                    <label htmlFor={field.name} className="block text-sm font-medium text-heading">
                      Senha
                    </label>
                    <div className="mt-1">
                      <input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`noir-input w-full ${field.state.meta.errors.length > 0 ? "border-accent-negative" : ""}`}
                        placeholder="••••••••"
                      />
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </>
                )}
              </form.Field>
            </div>

            {error && (
              <div className="text-accent-negative text-sm bg-accent-negative/10 border border-accent-negative/30 p-3 rounded-interactive">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="noir-btn-primary w-full py-3 text-base"
              >
                {loading ? "Carregando..." : view === "sign-in" ? "Entrar" : "Cadastrar"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-noir-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-noir-surface px-2 text-muted">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setView(view === "sign-in" ? "sign-up" : "sign-in");
                  setError(null);
                  form.reset();
                }}
                className="noir-btn-secondary w-full py-2.5"
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
