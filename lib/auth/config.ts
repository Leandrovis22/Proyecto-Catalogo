// import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export function getAuthOptions(db: any): any {
  return {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email y contraseña requeridos');
          }

          const user = await db.select().from(users).where(eq(users.email, credentials.email as string)).get();

          if (!user) {
            throw new Error('Usuario no encontrado');
          }

          const isValidPassword = await bcrypt.compare(String(credentials.password), String((user as any).password));

          if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
  async jwt({ token, user }: { token: any; user: any }) {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role;
        }
        return token;
      },
  async session({ session, token }: { session: any; token: any }) {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}