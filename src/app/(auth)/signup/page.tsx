"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SignupPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Chroniq
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free forever. No credit card required.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="yourname"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            What you get:
          </p>
          <ul className="space-y-1.5">
            {[
              "Track anime, movies, TV shows, and manga",
              "Auto-sync with the browser extension",
              "Detailed statistics and watch history",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
