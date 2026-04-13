"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type AuthFormMode = "login" | "register";

interface AuthFormProps {
  mode: AuthFormMode;
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      default:
        return "Authentication failed. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register, authLoading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = mode === "login" ? "Sign in" : "Create account";
  const subtitle =
    mode === "login"
      ? "Use your Automix credentials to continue."
      : "Create an account to start building API test scenarios.";

  const submitLabel = mode === "login" ? "Sign in" : "Create account";
  const helperText =
    mode === "login"
      ? "Need an account?"
      : "Already have an account?";
  const helperLinkHref = mode === "login" ? "/register" : "/login";
  const helperLinkLabel = mode === "login" ? "Register" : "Sign in";

  const formDisabled = useMemo(
    () => authLoading || isSubmitting,
    [authLoading, isSubmitting]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password });
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={formDisabled}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={formDisabled}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
          />
        </label>

        {errorMessage ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" className="h-11 w-full" disabled={formDisabled}>
          {isSubmitting ? "Please wait..." : submitLabel}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {helperText}{" "}
        <Link className="font-medium text-foreground underline" href={helperLinkHref}>
          {helperLinkLabel}
        </Link>
      </p>
    </div>
  );
}
