"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

export function cn(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100",
        className
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
    secondary:
      "bg-brand-50 text-brand-700 hover:bg-brand-100 ring-1 ring-brand-200",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Circular progress ring for the main calorie display. */
export function CalorieRing({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const remaining = Math.max(target - consumed, 0);
  const over = consumed > target;

  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={over ? "#dc2626" : "#16a34a"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">
          {Math.round(remaining)}
        </span>
        <span className="text-xs font-medium text-slate-500">
          kcal {over ? "fazla" : "kaldı"}
        </span>
        <span className="mt-1 text-[11px] text-slate-400">
          {Math.round(consumed)} / {target}
        </span>
      </div>
    </div>
  );
}

export function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span>
          {Math.round(value)} / {target} g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
