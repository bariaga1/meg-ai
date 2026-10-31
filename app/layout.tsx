import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";

const display = Nunito({
  variable: "--font-meg-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-meg-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Meg — ask about Omega Bariagaber",
  description:
    "Meg is an employer-facing resume chat agent for Omega Bariagaber. Ask about skills, roles, and projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${mono.variable} antialiased font-[family-name:var(--font-meg-mono)]`}
      >
        {children}
      </body>
    </html>
  );
}
