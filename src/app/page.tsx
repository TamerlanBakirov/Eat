"use client";

import { useEffect } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { Onboarding } from "@/components/Onboarding";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const status = useAppStore((s) => s.status);
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600">
        <span className="animate-pulse text-2xl font-extrabold">🥗 Eat</span>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  if (!profile) return <Onboarding />;
  return <Dashboard profile={profile} />;
}
