"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Onboarding } from "@/components/Onboarding";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const profile = useAppStore((s) => s.profile);
  // zustand persist hydrates from localStorage on the client only;
  // wait for mount to avoid a hydration mismatch.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600">
        <span className="text-2xl font-extrabold">🥗 Eat</span>
      </div>
    );
  }

  return profile ? <Dashboard profile={profile} /> : <Onboarding />;
}
