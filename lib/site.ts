/** Canonical public URL for metadata / OG (override after custom domain). */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://127.0.0.1:3000";
}

export const SITE_NAME = "Omega Bariagaber";
export const SITE_TITLE = "Omega Bariagaber — work, projects, and Meg";
export const SITE_DESCRIPTION =
  "Technical implementation leader building applied AI and data integrations. Meet Meg, a resume chat grounded in public work history, plus side projects.";

export const SITE_EMAIL = "omegabariagaber@gmail.com";
export const SITE_LINKEDIN = "https://www.linkedin.com/in/obariagaber/";
export const SITE_ROLE = "Technical Implementation Leader | Applied AI & Data Integration";
