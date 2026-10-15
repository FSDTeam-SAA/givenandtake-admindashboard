"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from 'react';

function SessionRecovery() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === 'SessionExpired') {
      const callback = window.location.pathname + window.location.search;
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
