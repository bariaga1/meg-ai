/** Showcase cards for the personal shell. Swap `liveUrl` when a demo is hosted. */

export type SiteProject = {
  id: string;
  title: string;
  blurb: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
};

export const SITE_PROJECTS: SiteProject[] = [
  {
    id: "can-i-park-here",
    title: "Can I Park Here?",
    blurb:
      "Phone app that reads a parking sign with OCR and returns OK to Park, Do Not Park, or Uncertain for a chosen time.",
    stack: ["React Native", "Expo", "TypeScript", "OCR"],
    githubUrl: "https://github.com/bariaga1/can-i-park-here",
  },
  {
    id: "careeros",
    title: "CareerOS",
    blurb:
      "Job-search tool that pulls listings, scores fit with rules plus GPT-4o-mini, and keeps the judgment call behind an approval gate.",
    stack: ["Next.js", "TypeScript", "OpenAI", "SQLite"],
  },
  {
    id: "storefront-studio",
    title: "Storefront Studio",
    blurb:
      "Client intake that turns small-business inquiries into structured markdown context for an AI workflow you approve before anything moves.",
    stack: ["Next.js", "TypeScript", "n8n", "Docker"],
    githubUrl: "https://github.com/bariaga1/storefront-studio-site",
  },
];
