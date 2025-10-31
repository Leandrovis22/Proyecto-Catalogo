import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

export const runtime = process.env.NODE_ENV === "production" ? "edge" : "nodejs";
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);