export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
};

export const experience: Experience[] = [
  {
    role: "Web Developer Intern",
    company: "MangoesOrange Group",
    location: "Noida",
    period: "Apr 2026 — May 2026",
    description: "Built and maintained full-stack experiences across the MERN stack.",
    highlights: [
      "Developed and maintained full-stack web applications using the MERN stack.",
      "Designed responsive, mobile-friendly user interfaces.",
      "Built and consumed RESTful APIs for frontend-backend integration.",
      "Designed MongoDB collections and handled CRUD operations and data management.",
      "Troubleshot bugs to improve performance and reliability.",
      "Used Git and GitHub for version control.",
    ],
  },
  {
    role: "Web Developer Intern",
    company: "Codec Technologies Pvt. Ltd.",
    location: "Remote",
    period: "Jul 2025 — Aug 2025",
    description: "Created accessible, responsive web pages with a focus on usability.",
    highlights: [
      "Developed and maintained responsive pages using HTML, CSS, and JavaScript.",
      "Designed interfaces focused on usability, accessibility, and cross-browser compatibility.",
      "Maintained clean, reusable, well-documented code.",
    ],
  },
  {
    role: "C/C++ Intern",
    company: "Itronix Solutions",
    location: "Remote",
    period: "May 2025 — Jul 2025",
    description: "Built foundational systems-programming and object-oriented skills.",
    highlights: [
      "Practiced C and C++ syntax, functions, pointers, memory management, and file handling.",
      "Applied classes, objects, inheritance, polymorphism, encapsulation, and abstraction.",
      "Collaborated with team members and followed coding best practices.",
      "Wrote well-structured, maintainable, documented code.",
    ],
  },
];
