import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bibliothekar - Buchinventar",
  description: "Verwalte deine heimische Bibliothek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-50 min-h-screen pb-20 md:pb-0`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
