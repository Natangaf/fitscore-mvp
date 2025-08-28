import type { Metadata } from "next";
import "./globals.css";
import { supabaseServer } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "FitScore — Mini MVP",
  description: "Formulário + Dashboard de avaliação",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Lê sessão no server para o primeiro render (SSR)
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getSession();
  const initialIsAuthed = !!data?.session;

  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <NavBar initialIsAuthed={initialIsAuthed} />
        {children}
      </body>
    </html>
  );
}
