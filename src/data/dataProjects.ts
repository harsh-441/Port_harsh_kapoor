export type DataProject = {
  slug: string;
  name: string;
  problem: string;
  dataset: string;
  tools: string[];
  insights: string[];
  screenshot: string;
  screenshotAlt: string;
  githubUrl: string;
  dashboardUrl: string;
};

export const dataProjects: DataProject[] = [];

export const analyticsRoadmap = [
  { name: "Excel", note: "Clean, model, and communicate with spreadsheets." },
  { name: "SQL", note: "Ask better questions of structured data." },
  { name: "Python + Pandas", note: "Explore, transform, and analyse datasets." },
  { name: "Power BI / Tableau", note: "Turn analysis into clear visual stories." },
  { name: "Statistics", note: "Find signal, test assumptions, build confidence." },
];
