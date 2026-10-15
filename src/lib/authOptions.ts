import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import type { JWT } from 'next-auth/jwt';

const accessExpiry = (value: string) => {
  try { return JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString()).exp * 1000; }
  catch { return 0; }
};
const refreshes = new Map<string, Promise<JWT>>();
const refreshAccess = (token: JWT): Promise<JWT> => {
  const key = token.refreshToken!;
  if (!refreshes.has(key)) {
    refreshes.set(key, (async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/refresh-token`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: key }), cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        return response.status >= 500 ? { ...token, error: 'RefreshUnavailable' }
          : { ...token, user: { ...token.user, accessToken: '' }, error: 'SessionExpired' };
      }
      return { ...token, user: { ...token.user, accessToken: result.data.accessToken },
        refreshToken: result.data.refreshToken, accessExpiresAt: accessExpiry(result.data.accessToken), error: undefined };
    })().catch(() => ({ ...token, error: 'RefreshUnavailable' })).finally(() => { refreshes.delete(key); }));
  }
  return refreshes.get(key)!;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email?.trim().toLowerCase(),
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          // Parenthesised deliberately: without it `&&` binds tighter than
          // `||` and a failed login response would still be accepted as long
          // as it happened to carry a super-admin role.
          const role = data?.data?.role;
          const isStaff = role === "admin" || role === "super-admin";

          if (data?.success && isStaff && data?.data?.accessToken) {
            return data.data;
          }
          return null;
        } catch (error) {
          console.error("Fetch login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const { refreshToken, sessionExpiresAt, ...publicUser } = user as typeof user & { refreshToken?: string; sessionExpiresAt?: number };
        token.user = publicUser;
        token.refreshToken = refreshToken;
        token.sessionExpiresAt = sessionExpiresAt ? sessionExpiresAt * 1000 : Date.now() + 12 * 3600_000;
        token.accessExpiresAt = accessExpiry(publicUser.accessToken);
      }
      if (token.sessionExpiresAt && Date.now() >= token.sessionExpiresAt) {
        return { ...token, user: { ...token.user, accessToken: '' }, error: 'SessionExpired' };
      }
      if (token.refreshToken && Date.now() >= (token.accessExpiresAt || 0) - 60_000) return refreshAccess(token);
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
