"use client";

import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Bolt, ShieldCheck } from "lucide-react";

import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mapAuthErrorMessage(raw: string) {
    if (raw.includes("auth/configuration-not-found")) {
      return "Authentication is not initialized in Firebase yet. Enable Authentication and Email/Password provider in Firebase Console.";
    }
    if (raw.includes("auth/operation-not-allowed")) {
      return "Email/Password sign-in is disabled. Enable it in Firebase Authentication providers.";
    }
    if (raw.includes("auth/invalid-credential") || raw.includes("auth/invalid-login-credentials")) {
      return "Invalid email or password.";
    }
    if (raw.includes("auth/email-already-in-use")) {
      return "This email is already registered. Try logging in instead.";
    }
    return raw;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase Auth is not available yet. Please refresh and try again.");
      }

      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (submitError) {
      const rawMessage =
        submitError instanceof Error ? submitError.message : "Authentication failed. Please check your details.";
      setError(mapAuthErrorMessage(rawMessage));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.15),transparent_40%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(15,23,42,0.85),rgba(2,6,23,0.95))]" />
      <Card className="relative z-10 w-full max-w-4xl border-slate-700/70 bg-slate-950/80 shadow-[0_20px_70px_-30px_rgba(16,185,129,0.7)] backdrop-blur">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-slate-700/60 p-8 md:border-b-0 md:border-r">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
              <Bolt className="h-3.5 w-3.5 text-teal-300" />
              Enersave Access
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-100">Run smarter energy operations.</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
              Monitor live demand, automate control decisions, and keep facility usage efficient with secured account access.
            </p>
            <div className="mt-6 rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-teal-300">
                <ShieldCheck className="h-4 w-4" />
                Access policy
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Every dashboard session requires account authentication. New users can create an account below in seconds.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
        <CardHeader>
              <div className="grid grid-cols-2 rounded-lg border border-slate-700/60 bg-slate-900/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`h-9 rounded-md text-sm transition ${
                    mode === "login" ? "bg-teal-500 text-slate-950" : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`h-9 rounded-md text-sm transition ${
                    mode === "signup" ? "bg-teal-500 text-slate-950" : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  Sign up
                </button>
              </div>
              <CardTitle className="pt-3 text-2xl text-slate-100">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {mode === "signup" ? "Create a secure account to access Enersave." : "Log in to continue to the dashboard."}
              </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none ring-offset-2 transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50"
              />
            </div>
            <div className="space-y-2">
                  <label className="text-sm text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none ring-offset-2 transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50"
              />
            </div>

                {mode === "signup" ? (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300" htmlFor="confirm-password">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none ring-offset-2 transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50"
                    />
                  </div>
                ) : null}

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                <Button className="h-11 w-full text-base font-semibold" type="submit" disabled={busy}>
                  {busy ? (mode === "signup" ? "Creating account..." : "Signing in...") : mode === "signup" ? "Create account" : "Login"}
            </Button>
          </form>
        </CardContent>
          </div>
        </div>
      </Card>
    </main>
  );
}
