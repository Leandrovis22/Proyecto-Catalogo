
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import getServerSession from "next-auth";
import { getAuthOptions } from "@/lib/auth/config";
import { getDb } from "@/lib/db";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MiTienda - Catálogo de Productos",
  description: "Encuentra los mejores productos al mejor precio",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session (no custom DB/auth options needed for basic usage)
  // @ts-ignore
  const db = typeof globalThis.DB !== "undefined" ? getDb(globalThis.DB) : null;
  const session = db ? await getServerSession(getAuthOptions(db)) : null;
  // Ensure session has 'expires' property for SessionProvider
  const sessionWithExpires = session
    ? { ...session, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    : null;

  return (
    <html lang="es" className={inter.className}>
      <body>
  <SessionProvider session={sessionWithExpires}>
          <Header />
          <main className="container mx-auto px-4 py-6">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
