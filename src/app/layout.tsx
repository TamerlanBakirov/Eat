import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eat — AI Sağlıklı Diyet & Öğün Planı",
  description:
    "Hedeflerine göre kişiselleştirilmiş öğün planı, kalori takibi ve alışveriş listesi.",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
