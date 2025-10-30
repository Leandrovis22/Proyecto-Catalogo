import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

// Este es un hack para obtener D1 en Edge Runtime
// @ts-ignore
const db = globalThis.DB ? getDb(globalThis.DB) : null;

const handler = NextAuth(getAuthOptions(db));

export const GET = async (req: Request) => {
  return handler(req);
};

export const POST = async (req: Request) => {
  return handler(req);
};