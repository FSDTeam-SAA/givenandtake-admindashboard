"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from 'react';
import { loginDestination } from '@/lib/admin-session';

function SessionRecovery() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === 'SessionExpired') {
      // Credentials submitted here will replace the expired session cookie.
      if (window.location.pathname === '/login') return;
      const callback = loginDestination(window.location.pathname + window.location.search, window.location.origin);
      void signOut({ callbackUrl: `/login?callbackUrl=${encodeURIComponent(callback)}` });
    }
  }, [session?.error]);
  return null;
}
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthSessionProvider({ children }: Props) {
  return <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}><SessionRecovery />{children}</SessionProvider>;
}
