import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteUrl } from "@/lib/site";
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

const canonical = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(canonical),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Omega Bariagaber" }],
  openGraph: {
    type: "website",
    url: canonical,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
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
