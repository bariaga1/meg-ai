import type { HistoryTurn } from "../../lib/megRetrieve";

export type GroundingCase = {
  id: string;
  question: string;
  history?: HistoryTurn[];
  /** Chunk id substrings that must appear in retrieval. */
  mustRetrieveIds: string[];
  /** Plain strings that must appear in formatted resume context. */
  mustAppearInContext: string[];
  /** When set, expect at least two job chunks (not a single-employer trap). */
  mustNotBeOnlyJob?: string;
};

/** Recruiter-style questions — assertions hit retrieval only (no model spend). */
export const GROUNDING_CASES: GroundingCase[] = [
  // --- Medallia / current role ---
  {
    id: "medallia-role",
    question: "What did you do at Medallia?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["Medallia", "July 2021", "October 2025"],
  },
  {
    id: "medallia-title-dates",
    question: "What was your title at Medallia and when were you there?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: [
      "Senior Technical Consultant",
      "July 2021",
      "October 2025",
    ],
  },
  {
    id: "medallia-power-bi",
    question: "Did you build dashboards at Medallia?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["Power BI", "Medallia"],
  },
  {
    id: "medallia-sentiment",
    question: "Tell me about the sentiment classification work at Medallia.",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["sentiment", "84%"],
  },
  {
    id: "medallia-offshore",
    question: "Have you managed offshore teams?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["offshore", "97%"],
  },
  {
    id: "medallia-implementations",
    question: "What kind of implementations did you lead in Professional Services?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["Medallia", "implementations"],
  },

  // --- Career walk / other roles ---
  {
    id: "other-roles-after-medallia",
    question: "What other roles did you have?",
    history: [
      {
        role: "user",
        text: "What did you do at Medallia?",
      },
      {
        role: "assistant",
        text: "At Medallia, Omega was a Senior Technical Consultant from July 2021 to October 2025.",
      },
    ],
    mustRetrieveIds: ["medallia", "marathon", "nasdaq", "saama"],
    mustAppearInContext: [
      "Medallia",
      "Marathon Petroleum",
      "Nasdaq",
      "Saama",
    ],
    mustNotBeOnlyJob: "Medallia",
  },
  {
    id: "where-else-worked",
    question: "Where else did you work?",
    history: [
      { role: "user", text: "Tell me about Medallia" },
      {
        role: "assistant",
        text: "Omega worked at Medallia as a Senior Technical Consultant.",
      },
    ],
    mustRetrieveIds: ["marathon", "nasdaq"],
    mustAppearInContext: ["Marathon Petroleum", "Nasdaq"],
  },
  {
    id: "walk-me-through-career",
    question: "Walk me through your career.",
    mustRetrieveIds: ["medallia", "marathon"],
    mustAppearInContext: ["Medallia", "Marathon"],
    mustNotBeOnlyJob: "Medallia",
  },
  {
    id: "previous-roles",
    question: "What were your previous roles before Medallia?",
    mustRetrieveIds: ["marathon", "nasdaq", "saama"],
    mustAppearInContext: ["Marathon Petroleum", "Nasdaq", "Saama"],
  },
  {
    id: "how-many-years",
    question: "How many years of experience do you have?",
    mustRetrieveIds: ["summary"],
    mustAppearInContext: ["10+ years"],
  },

  // --- Marathon ---
  {
    id: "marathon",
    question: "What did you do at Marathon Petroleum?",
    mustRetrieveIds: ["marathon"],
    mustAppearInContext: ["Marathon Petroleum", "September 2017"],
  },
  {
    id: "marathon-compliance",
    question: "Any work on compliance or environmental reporting?",
    mustRetrieveIds: ["marathon"],
    mustAppearInContext: ["Marathon", "compliance"],
  },
  {
    id: "marathon-savings",
    question: "Did you deliver cost savings at Marathon?",
    mustRetrieveIds: ["marathon"],
    mustAppearInContext: ["$250K"],
  },

  // --- Nasdaq / Calypso ---
  {
    id: "nasdaq",
    question: "What did you do at Nasdaq?",
    mustRetrieveIds: ["nasdaq"],
    mustAppearInContext: ["Nasdaq", "July 2014"],
  },
  {
    id: "calypso",
    question: "Tell me about your Calypso experience.",
    mustRetrieveIds: ["nasdaq"],
    mustAppearInContext: ["Calypso"],
  },
  {
    id: "trading-qa",
    question: "Have you done QA on trading platforms?",
    mustRetrieveIds: ["nasdaq"],
    mustAppearInContext: ["trading", "Bloomberg"],
  },
  {
    id: "bdd-automation",
    question: "What testing or automation experience do you have?",
    mustRetrieveIds: ["nasdaq"],
    mustAppearInContext: ["BDD"],
  },

  // --- Saama ---
  {
    id: "saama",
    question: "What was the Saama internship?",
    mustRetrieveIds: ["saama"],
    mustAppearInContext: ["Saama", "Tableau"],
  },

  // --- Projects ---
  {
    id: "independent-projects",
    question: "What independent projects have you built?",
    mustRetrieveIds: ["park", "careeros", "storefront"],
    mustAppearInContext: [
      "Can I Park Here",
      "CareerOS",
      "Storefront Studio",
    ],
  },
  {
    id: "projects-follow-up",
    question: "What else?",
    history: [
      {
        role: "user",
        text: "What independent projects have you built?",
      },
      {
        role: "assistant",
        text: "Omega built Can I Park Here?, CareerOS, and Storefront Studio.",
      },
    ],
    mustRetrieveIds: ["park", "careeros", "storefront"],
    mustAppearInContext: ["Can I Park Here", "CareerOS", "Storefront Studio"],
  },
  {
    id: "park-project",
    question: "Tell me about Can I Park Here?",
    mustRetrieveIds: ["park"],
    mustAppearInContext: ["Can I Park Here", "OCR"],
  },
  {
    id: "park-stack",
    question: "What tech stack is Can I Park Here built with?",
    mustRetrieveIds: ["park"],
    mustAppearInContext: ["React Native", "TypeScript"],
  },
  {
    id: "park-rules",
    question: "How does Can I Park Here decide the verdict?",
    mustRetrieveIds: ["park"],
    mustAppearInContext: ["strictest", "Uncertain", "OCR"],
  },
  {
    id: "careeros",
    question: "What is CareerOS?",
    mustRetrieveIds: ["careeros"],
    mustAppearInContext: ["CareerOS", "OpenAI"],
  },
  {
    id: "careeros-scoring",
    question: "How does CareerOS score job fits?",
    mustRetrieveIds: ["careeros"],
    mustAppearInContext: ["fit scoring", "GPT-4o-mini", "0.55"],
  },
  {
    id: "careeros-gate",
    question: "How does CareerOS decide which jobs the model scores?",
    mustRetrieveIds: ["careeros"],
    mustAppearInContext: ["alignment gate", "GPT-4o-mini"],
  },
  {
    id: "storefront-studio",
    question: "What does Storefront Studio do?",
    mustRetrieveIds: ["storefront"],
    mustAppearInContext: ["Storefront Studio", "n8n"],
  },
  {
    id: "storefront-architecture",
    question: "How is Storefront Studio architected?",
    mustRetrieveIds: ["storefront"],
    mustAppearInContext: ["CONTEXT.md", "Git Data API", "honeypot"],
  },
  {
    id: "ai-projects",
    question: "Any AI projects I should know about?",
    mustRetrieveIds: ["careeros", "storefront", "park", "medallia"],
    mustAppearInContext: ["CareerOS", "Storefront Studio", "Can I Park Here", "84%"],
  },
  {
    id: "ai-related-work",
    question: "What AI related work have you done?",
    mustRetrieveIds: ["medallia", "careeros", "storefront", "park", "technical-skills"],
    mustAppearInContext: [
      "CareerOS",
      "GPT-4o-mini",
      "Storefront Studio",
      "Can I Park Here",
      "84%",
      "n8n",
    ],
  },
  {
    id: "ai-experience",
    question: "Tell me about your experience with AI",
    mustRetrieveIds: ["medallia", "careeros", "storefront", "park"],
    mustAppearInContext: ["CareerOS", "Storefront Studio", "84%"],
  },

  // --- Skills / tools ---
  {
    id: "skills",
    question: "Which skills show up across roles?",
    mustRetrieveIds: ["technical-skills", "medallia", "marathon", "nasdaq", "saama"],
    mustAppearInContext: ["Python", "SQL", "scripts", "web-based"],
  },
  {
    id: "python",
    question: "Do you know Python?",
    mustRetrieveIds: ["technical-skills"],
    mustAppearInContext: ["Python"],
  },
  {
    id: "typescript",
    question: "Have you used TypeScript?",
    mustRetrieveIds: ["technical-skills"],
    mustAppearInContext: ["TypeScript"],
  },
  {
    id: "power-bi-skill",
    question: "What's your Power BI experience?",
    mustRetrieveIds: ["technical-skills"],
    mustAppearInContext: ["Power BI"],
  },
  {
    id: "salesforce",
    question: "Have you worked with Salesforce?",
    mustRetrieveIds: ["technical-skills"],
    mustAppearInContext: ["Salesforce"],
  },
  {
    id: "ai-tools",
    question: "Which AI coding tools do you use?",
    mustRetrieveIds: ["technical-skills"],
    mustAppearInContext: ["Cursor", "Claude"],
  },

  // --- Highlights / impact ---
  {
    id: "biggest-impact",
    question: "What's a highlight from your career?",
    mustRetrieveIds: ["career-highlights"],
    mustAppearInContext: ["$5M+"],
  },
  {
    id: "fortune-100",
    question: "Have you worked with Fortune 100 customers?",
    mustRetrieveIds: ["career-highlights"],
    mustAppearInContext: ["Fortune 100"],
  },

  // --- Background ---
  {
    id: "summary",
    question: "Give me a quick overview of your background.",
    mustRetrieveIds: ["summary"],
    mustAppearInContext: ["10+ years", "Fortune 100"],
  },
  {
    id: "education",
    question: "Where did you go to school?",
    mustRetrieveIds: ["education"],
    mustAppearInContext: ["Michigan State University"],
  },
  {
    id: "degree",
    question: "What did you study?",
    mustRetrieveIds: ["education"],
    mustAppearInContext: ["Media & Communication Technology"],
  },
  {
    id: "certifications",
    question: "Do you have any certifications?",
    mustRetrieveIds: ["certifications"],
    mustAppearInContext: ["Medallia Product Certification", "Lean Six Sigma"],
  },
  {
    id: "location",
    question: "Where are you based?",
    mustRetrieveIds: ["header"],
    mustAppearInContext: ["San Jose"],
  },
  {
    id: "languages",
    question: "What languages do you speak?",
    mustRetrieveIds: ["languages"],
    mustAppearInContext: ["Tigrinya", "Amharic"],
  },
  {
    id: "competencies",
    question: "What are your core strengths?",
    mustRetrieveIds: ["core-competencies"],
    mustAppearInContext: ["Stakeholder Management"],
  },
  {
    id: "his-strengths",
    question: "What are his strengths?",
    mustRetrieveIds: ["core-competencies"],
    mustAppearInContext: ["Stakeholder Management"],
  },
  {
    id: "strengths-listed",
    question: "What are his strengths should be listed",
    mustRetrieveIds: ["core-competencies"],
    mustAppearInContext: ["Client-Facing Consulting"],
  },

  // --- Contact / logistics ---
  {
    id: "contact",
    question: "How can I contact you?",
    mustRetrieveIds: ["header"],
    mustAppearInContext: ["omegabariagaber@gmail.com"],
  },
  {
    id: "email",
    question: "What's your email?",
    mustRetrieveIds: ["header"],
    mustAppearInContext: ["omegabariagaber@gmail.com"],
  },
  {
    id: "remote",
    question: "Are you open to remote work?",
    mustRetrieveIds: ["medallia"],
    mustAppearInContext: ["Remote"],
  },
  {
    id: "linkedin",
    question: "Do you have a LinkedIn?",
    mustRetrieveIds: ["header"],
    mustAppearInContext: ["LinkedIn"],
  },
];
