import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Only same-origin relative paths may be used as a post-auth destination. */
function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s['next']) }),
  head: () => ({
    meta: [
      { title: "Sign in — Prism Light Puzzle Platform" },
      {
        name: "description",
        content:
          "Sign in to Prism to sync your light-refraction puzzle progress and connect AI assistants to the Puzzle Genesis Engine.",
      },
      { property: "og:title", content: "Sign in — Prism" },
      {
        property: "og:description",
        content: "Access your Prism account and connect AI assistants to the puzzle engine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

/**
 * Accounts are optional: the whole game runs signed out. On deployments where
 * the backend keys are not configured, show a calm explanation instead of
 * letting the client throw.
 */
const accountsAvailable = Boolean(
  import.meta.env['VITE_SUPABASE_URL'] && import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],
);

function AccountsUnavailable() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight text-glow">Accounts are off in this build</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Optional accounts only sync progress across devices. Every puzzle, field mission and
          laboratory tool is fully playable signed out — your progress is saved on this device.
        </p>
        <Button asChild className="mt-6 w-full">
          <a href="/play">Start playing</a>
        </Button>
      </div>
    </main>
  );
}

function AuthPage() {
  if (!accountsAvailable) return <AccountsUnavailable />;
  return <AuthForm />;
}

function AuthForm() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(next);
    });
  }, [next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + next },
      });
      setBusy(false);
      if (err) return setError(err.message);
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) return setError(err.message);
    window.location.replace(next);
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth?next=" + encodeURIComponent(next),
    });
    if (result.error) return setError(String(result.error));
    if (result.redirected) return;
    void navigate({ href: next });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight text-glow">
          {mode === "signin" ? "Sign in to Prism" : "Create your Prism account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account authorizes AI assistants to use the Puzzle Genesis Engine.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <Button type="button" variant="outline" className="mt-3 w-full" onClick={google}>
          Continue with Google
        </Button>

        <button
          type="button"
          className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
