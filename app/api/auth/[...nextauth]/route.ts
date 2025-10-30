// Configuración base de NextAuth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import type { SessionStrategy } from "next-auth";
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Validar usuario en DB
        return null;
      }
    })
  ],
  session: { strategy: "jwt" as SessionStrategy },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
