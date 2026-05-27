"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: null });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-display text-2xl font-bold text-navy">
            Cretan<span className="text-gold">Desk</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <div className="mb-8 text-center">
              <h1 className="font-display text-2xl font-bold text-navy mb-1">
                Σύνδεση
              </h1>
              <p className="text-muted text-sm">
                Συνδέσου στον λογαριασμό σου στο CretanDesk
              </p>
            </div>

            {state.error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-6 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="info@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Κωδικός πρόσβασης</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={pending}
              >
                {pending ? "Σύνδεση…" : "Σύνδεση"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Δεν έχεις λογαριασμό;{" "}
              <Link href="/register" className="text-navy font-medium hover:text-gold transition-colors">
                Εγγραφή
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
