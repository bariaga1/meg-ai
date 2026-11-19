/** Static copy for the personal shell. The highlight stories also feed Meg (see lib/loadChunks.ts). */

export type SiteHighlight = {
  /** Stable id. Meg's story section is "story-<id>"; the Ask Meg button sends it. */
  id: string;
  /** The headline number, e.g. "$5M+". Counted up from zero on screen. */
  metric: string;
  /** What the number measures, read right after it. */
  unit: string;
  /** One sentence on how it happened. */
  story: string;
  /** Where it happened. */
  source: string;
  /** Supporting numbers, shown only in the large feature box. */
  extras?: { metric: string; unit: string }[];
  /** The full story, shown when the box is opened. */
  detail: {
    challenge: string;
    action: string;
    result: string;
    tags: string[];
    /** Sent to Meg by the box's "Ask Meg" button. */
    ask: string;
    /** Extra words people might use for this story, to help Meg's keyword search find it. */
    keywords: string[];
  };
};

/** Ordered by impact; the first one is shown as the large feature box. */
export const SITE_HIGHLIGHTS: SiteHighlight[] = [
  {
    id: "renewals",
    metric: "$5M+",
    unit: "in renewals secured",
    story:
      "Led technical delivery for two at-risk enterprise accounts, resolving delivery issues, getting ahead of risk, and keeping client stakeholders in the loop before they had to ask.",
    source: "Medallia",
    extras: [
      { metric: "2", unit: "at-risk enterprise accounts turned around" },
      { metric: "25+", unit: "point lift in client NPS" },
    ],
    detail: {
      challenge:
        "Two enterprise accounts, a consumer-tech client and a telecom client, were already at risk when he joined the team. Earlier quality incidents had cost their trust, and the telecom client also felt ignored.",
      action:
        "Made quality non-negotiable, delivering a continuous run of projects and ad hoc requests with no rework, and kept the telecom client informed before they had to ask.",
      result:
        "Trust was rebuilt over time, client NPS rose 25+ points, and both accounts renewed for $5M+.",
      tags: ["Client recovery", "Quality assurance", "Stakeholder communication"],
      ask: "How did he turn around the at-risk accounts?",
      keywords: ["renewals", "renewed", "at-risk", "accounts", "turnaround", "turn around", "rescue", "saved", "trust", "NPS", "quality", "client recovery", "churn"],
    },
  },
  {
    id: "implementations",
    metric: "25+",
    unit: "Fortune 100 implementations",
    story:
      "Delivered end to end, from discovery and data integration through launch, consistently on time or ahead of schedule.",
    source: "Medallia",
    detail: {
      challenge:
        "Fortune 100 clients across tech, telecom, insurance and automotive, including Apple, Comcast, T-Mobile, Anthem and Ford (North America and Europe). Projects ran from a few weeks to three-month rollouts, often several in parallel.",
      action:
        "Owned the work from discovery through design, configuration, data integration, testing and launch on lean teams of 4–6, led projects for Comcast and Apple, worked with Product and Engineering to close gaps, and trained client teams.",
      result: "25+ launches, each delivered on time or early.",
      tags: ["Implementation", "Discovery", "Data integration", "UAT"],
      ask: "What did his implementations involve?",
      keywords: ["implementations", "implementation", "Fortune 100", "clients", "Apple", "Comcast", "T-Mobile", "Anthem", "Ford", "industries", "rollouts", "launches", "project size", "team size", "parallel", "concurrent", "multiple projects"],
    },
  },
  {
    id: "pipelines",
    metric: "10M+",
    unit: "customer records in real time",
    story:
      "Built CX data pipelines feeding live dashboards, closed-loop alerts, and CRM integrations.",
    source: "Medallia",
    detail: {
      challenge:
        "Customer data came from many sources: scheduled secure flat-file transfers and SQL databases carrying point-of-sale and commerce data, website analytics, Google reviews and Facebook feedback.",
      action:
        "Built pipelines that took in those feeds and shaped them for downstream use: real-time dashboards, closed-loop alerts and CRM integrations.",
      result:
        "10M+ records in real time, plus 60+ Power BI dashboards serving 2,000+ users per account.",
      tags: ["Data pipelines", "SQL", "Power BI", "CRM integration"],
      ask: "How did he build the 10M-record pipelines?",
      keywords: ["pipelines", "pipeline", "data sources", "10M", "records", "record", "flat files", "SQL", "ETL", "ingestion", "point of sale", "commerce", "reviews", "CRM", "real time"],
    },
  },
  {
    id: "compliance-app",
    metric: "$500K+",
    unit: "in penalties avoided",
    story:
      "Built a workforce compliance app for up to 750 union craft workers and contractors that checked skills and hours before job sign-up.",
    source: "Marathon Petroleum",
    detail: {
      challenge:
        "Each season brought a wave of contractors into the refinery who signed up for extra work based on their skills and certifications. There was no reliable way to track who qualified or how many hours they had worked, which risked overtime violations.",
      action:
        "Built a web app on SQL tables. Accounts came from the badge-in system, skills and certifications were documented and kept current as workers earned new ones, extra-work hours were tracked, and sign-ups were blocked once someone hit their limit. Supervisors managed it day to day.",
      result:
        "Served up to 750 workers and contractors and avoided about $250K a year in penalties, $500K+ over two years.",
      tags: ["Web app", "SQL", "Compliance automation"],
      ask: "Tell me about the workforce compliance app",
      keywords: ["workforce compliance app", "compliance", "overtime", "contractors", "union", "craft workers", "badge", "certifications", "hours", "refinery", "sign-up", "penalties", "tracking"],
    },
  },
  {
    id: "sentiment-model",
    metric: "40%",
    unit: "less manual feedback review",
    story:
      "Helped build an AI-assisted sentiment model with 84% accuracy that also flagged at-risk accounts earlier.",
    source: "Medallia",
    detail: {
      challenge:
        "Customer Success had more survey comments and feedback than anyone could read, so patterns and unhappy accounts surfaced late.",
      action:
        "Partnered with an ML engineer: structured the feedback data, helped compare word-based TF-IDF with text embeddings (embeddings with logistic regression won), and fed the model's results into a reporting dashboard.",
      result: "84% accuracy, 40% less manual review, and at-risk accounts flagged sooner.",
      tags: ["NLP", "Python", "Model evaluation", "Dashboards"],
      ask: "How did the sentiment model work?",
      keywords: ["sentiment model", "sentiment", "classifier", "classification", "NLP", "TF-IDF", "embeddings", "logistic regression", "machine learning", "ML engineer", "feedback", "survey comments"],
    },
  },
  {
    id: "offshore-teams",
    metric: "97%",
    unit: "SLA compliance",
    story:
      "Led two offshore teams of 6+ analysts and engineers across concurrent enterprise engagements.",
    source: "Medallia",
    detail: {
      challenge:
        "A steady stream of ad hoc requests from many clients at once, handled by two offshore teams of analysts and engineers.",
      action:
        "Made sure every request was acknowledged and routed, tracked work across the teams on a shared dashboard, and ran daily stand-ups to follow up and bring in subject-matter experts when needed.",
      result: "97% SLA compliance across concurrent client engagements.",
      tags: ["Team leadership", "Offshore delivery", "SLA management"],
      ask: "How did he run the offshore teams?",
      keywords: ["offshore teams", "offshore", "SLA", "97%", "stand-ups", "standups", "ad hoc requests", "team leadership", "managed", "teams", "requests"],
    },
  },
];

/** The About section's two forward-looking cards. */
export const SITE_ABOUT_CARDS = [
  {
    label: "Lately",
    text: "It started with wanting stronger software engineering fundamentals. That grew into curiosity about what's really happening under the hood of applied AI. So I took what I learned from programming coursework and turned it into my own projects. AI helps me move faster, but I test everything, make sure I understand what it's doing, and keep the judgment calls my own. Now I keep learning the same way, by building.",
  },
  {
    label: "What's next for me",
    text: "Putting what I've been learning to work on real problems. Understanding what people need is still where I start. What's new is how much more I can do from there myself: prototype an idea quickly, test it until it holds up, and explain clearly how it works. I'm excited to keep growing that.",
  },
] as const;

export type ExperienceRole = {
  dates: string;
  company: string;
  title: string;
  location: string;
  summary: string;
  bullets: { lead: string; body: string }[];
};

export const SITE_EXPERIENCE: ExperienceRole[] = [
  {
    dates: "July 2021 – October 2025",
    company: "Medallia",
    title: "Senior Technical Consultant, Professional Services",
    location: "Remote - CA",
    summary:
      "Led enterprise CX platform implementations for Fortune 100 clients, working directly with stakeholders to understand what they needed and building the platform around it.",
    bullets: [
      {
        lead: "Full lifecycle delivery.",
        body: "Owned discovery, solution design, platform configuration, data integration, custom workflows, UAT, and launch.",
      },
      {
        lead: "Applied AI.",
        body: "Built an AI-assisted sentiment classification model (84% accuracy) that reduced manual feedback review by 40% and helped surface at-risk accounts earlier.",
      },
      {
        lead: "Team leadership.",
        body: "Managed two offshore teams across concurrent engagements while maintaining 97% SLA compliance.",
      },
      {
        lead: "Reporting at scale.",
        body: "Built and maintained 60+ Power BI dashboards with automated daily reporting for 2,000+ users per account.",
      },
    ],
  },
  {
    dates: "September 2017 – December 2020",
    company: "Marathon Petroleum",
    title: "Senior Business Analyst",
    location: "Remote / Oakland - CA",
    summary:
      "Worked on site at a California refinery, partnering with engineering, compliance, and operations on technical solutions and reporting.",
    bullets: [
      {
        lead: "Operational tools.",
        body: "Delivered web-based tools that reduced compliance penalties by $250K annually.",
      },
      {
        lead: "Predictive maintenance.",
        body: "Led predictive maintenance using OSI PI sensor data, improving safety and generating multimillion-dollar savings in reduced downtime.",
      },
      {
        lead: "Workforce compliance.",
        body: "Built an application used by up to 750 craft workers and contractors that helped avoid $500K+ in overtime penalties over two years.",
      },
    ],
  },
  {
    dates: "February 2015 – August 2017",
    company: "Nasdaq / Calypso",
    title: "Infrastructure Quality Engineer",
    location: "San Francisco - CA",
    summary:
      "Validated and maintained enterprise trading platforms, integrating third-party financial systems and real-time market data.",
    bullets: [
      {
        lead: "Market data integrations.",
        body: "Led validation of Bloomberg and Reuters interfaces for accurate data flow into trading platforms.",
      },
      {
        lead: "Test automation.",
        body: "Increased BDD automation coverage and cut regression defects by about 30%.",
      },
      {
        lead: "Front Office QA.",
        body: "Earlier as Front Office QA (July 2014 – January 2015), used SQL to reconcile trade data and validate pricing logic across order management and risk modules.",
      },
    ],
  },
  {
    dates: "January 2014 – June 2014",
    company: "Saama",
    title: "Associate Consultant / Data Analyst Intern",
    location: "San Jose - CA",
    summary:
      "International BI program focused on data architecture, ETL, and visualization.",
    bullets: [
      {
        lead: "ETL and models.",
        body: "Designed relational data models and Informatica pipelines to consolidate structured sources.",
      },
      {
        lead: "Reporting layers.",
        body: "Built Tableau dashboards and SAP BusinessObjects semantic layers for self-service reporting.",
      },
    ],
  },
];
