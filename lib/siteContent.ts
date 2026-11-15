/** Static copy for the personal shell (not used by Meg retrieval). */

export type SiteHighlight = {
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
};

/** Ordered by impact; the first one is shown as the large feature box. */
export const SITE_HIGHLIGHTS: SiteHighlight[] = [
  {
    metric: "$5M+",
    unit: "in renewals secured",
    story:
      "Turned around at-risk enterprise accounts through reliable delivery and proactive communication.",
    source: "Medallia",
    extras: [
      { metric: "2", unit: "at-risk enterprise accounts turned around" },
      { metric: "25+", unit: "point lift in client NPS" },
    ],
  },
  {
    metric: "25+",
    unit: "Fortune 100 implementations",
    story:
      "Delivered end to end, from discovery and data integration through launch, consistently on time or ahead of schedule.",
    source: "Medallia",
  },
  {
    metric: "10M+",
    unit: "customer records in real time",
    story:
      "Built CX data pipelines feeding live dashboards, closed-loop alerts, and CRM integrations.",
    source: "Medallia",
  },
  {
    metric: "$500K+",
    unit: "in penalties avoided",
    story:
      "Built a workforce compliance app for up to 750 union craft workers and contractors that checked skills and hours before job sign-up.",
    source: "Marathon Petroleum",
  },
  {
    metric: "40%",
    unit: "less manual feedback review",
    story:
      "Built an AI-assisted sentiment model with 84% accuracy that also flagged at-risk accounts earlier.",
    source: "Medallia",
  },
  {
    metric: "97%",
    unit: "SLA compliance",
    story:
      "Led two offshore teams of 6+ analysts and engineers across concurrent enterprise engagements.",
    source: "Medallia",
  },
];

export const SITE_ROLE_BLURBS = [
  {
    label: "Medallia · Senior Technical Consultant",
    text: "I led enterprise CX platform implementations for Fortune 100 clients — discovery through data integration, custom workflows, UAT, and launch — and partnered with Product and Engineering when the platform needed to stretch.",
  },
  {
    label: "Marathon Petroleum · Senior Business Analyst",
    text: "On site at a California refinery, I built operational tools and reporting that kept engineering, compliance, and operations aligned, including work that cut compliance penalties by $250K a year.",
  },
  {
    label: "Nasdaq / Calypso · Infrastructure Quality Engineer",
    text: "I validated trading-platform integrations and market-data flows, grew automation with BDD, and used SQL heavily in front-office QA before moving onto the infrastructure team.",
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
