"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NavBar({
  initialIsAuthed,
}: {
  initialIsAuthed: boolean;
}) {
  const s = supabaseBrowser();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(initialIsAuthed);

  useEffect(() => {
    let mounted = true;

    s.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(!!data?.session);
    });

    const { data: sub } = s.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      router.refresh();
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [router, s]);

  async function signOut() {
    await s.auth.signOut();
    setIsAuthed(false);
    router.refresh();
    router.replace("/login");
  }

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
        <div className="ml-auto flex items-center gap-4">
          {isAuthed ? (
            <>
              <a href="/forms" className="hover:underline">
                Formulário
              </a>
              <a href="/dashboard" className="hover:underline">
                Dashboard
              </a>
              <button
                onClick={signOut}
                className="text-sm opacity-80 hover:opacity-100"
                aria-label="Sair"
                title="Sair"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <a href="/forms" className="hover:underline">
                Formulário
              </a>
              <a href="/login" className="hover:underline">
                Entrar
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
