import type { Metadata } from "next";
import "./globals.css";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "FitScore — Mini MVP",
  description: "Formulário + Dashboard de avaliação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <nav className="bg-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex gap-4">
            <a href="/forms" className="hover:underline">Formulário</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
