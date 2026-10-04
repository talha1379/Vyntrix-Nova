import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — VyntrixNova Workspace" },
      {
        name: "description",
        content:
          "Private sign-in for the VyntrixNova workspace — leads, projects, content and client briefs.",
      },
      { property: "og:title", content: "Sign in — VyntrixNova Workspace" },
      {
        property: "og:description",
        content: "Private administrator access to the VyntrixNova workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/admin" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Private workspace. Sign in with your workspace account.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Owner email"
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Sign in"}
          </button>
        </form>

        <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
      </main>
    </div>
  );
}
