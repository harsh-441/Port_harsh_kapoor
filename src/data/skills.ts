export type SkillGroup = {
  name: string;
  kind: "web" | "data" | "learning";
  skills: string[];
};

export const skills: SkillGroup[] = [
  {
    name: "Web development",
    kind: "web",
    skills: [
      "JavaScript",
      "React.js",
      "HTML5 / CSS3",
      "Bootstrap",
      "Tailwind CSS",
      "Node.js / Express",
      "MongoDB",
      "MySQL / SQL Server",
      "TypeScript",
      "Next.js / Angular",
      "Responsive design",
      "Git / GitHub",
      "Postman / VS Code",
      "REST APIs",
      "SDLC / Agile",
      "OOP",
      "Problem solving / debugging",
      "API integration",
    ],
  },
  {
    name: "Data foundations",
    kind: "data",
    skills: ["SQL", "Python"],
  },
  {
    name: "Currently learning",
    kind: "learning",
    skills: [
      "Excel",
      "SQL for analytics",
      "Python (Pandas, NumPy)",
      "Power BI or Tableau",
      "Data visualisation",
      "Statistics",
    ],
  },
];
