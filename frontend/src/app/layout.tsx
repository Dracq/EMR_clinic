import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Patkar Clinic EMR",
  description: "Modern Clinic Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <Providers>
          {children}
          <CommandPalette />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
