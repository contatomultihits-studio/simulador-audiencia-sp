import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audiência SP",
  description: "Simulador de audiência de rádio em São Paulo Capital"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
