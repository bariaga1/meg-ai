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

export const SITE_NAME = "Meg";
export const SITE_TITLE = "Meg — ask about Omega Bariagaber";
export const SITE_DESCRIPTION =
  "Chat with Meg about Omega Bariagaber’s resume: roles, skills, and projects. Answers stay grounded in the public resume.";
