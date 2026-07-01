"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button, Card } from "./ui";

export function AuthScreen() {
  const afterAuth = useAppStore((s) => s.afterAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password);
      await afterAuth(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl font-extrabold text-brand-600">
          🥗 Eat
        </div>
        <p className="text-sm text-slate-500">
          AI destekli sağlıklı diyet & öğün planı
        </p>
      </div>

      <Card>
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          <TabButton
            active={mode === "login"}
            onClick={() => setMode("login")}
          >
            Giriş yap
          </TabButton>
          <TabButton
            active={mode === "register"}
            onClick={() => setMode("register")}
          >
            Kayıt ol
          </TabButton>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              E-posta
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@eposta.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Şifre
            </span>
            <input
              type="password"
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Lütfen bekle…"
              : mode === "login"
                ? "Giriş yap"
                : "Hesap oluştur"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400">
        Verilerin güvenli şekilde hesabına kaydedilir.
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 rounded-lg py-2 text-sm font-semibold transition " +
        (active ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")
      }
    >
      {children}
    </button>
  );
}
