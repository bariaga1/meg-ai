import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-meg-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Manrope({
  variable: "--font-meg-sans",
  subsets: ["latin"],
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
        className={`${display.variable} ${sans.variable} antialiased font-[family-name:var(--font-meg-sans)]`}
      >
        {children}
      </body>
    </html>
  );
}
