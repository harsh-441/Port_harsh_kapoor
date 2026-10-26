export type Project = {
  slug: string;
  name: string;
  category: "Full-stack" | "Frontend" | "Interactive";
  status: string;
  description: string;
  detail: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  year: string;
  visual: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "son-of-swad",
    name: "Son of Swad",
    category: "Full-stack",
    status: "Ongoing",
    description: "A franchise-enquiry experience for a much-loved chaat brand.",
    detail:
      "A web app designed to help people explore the brand and take the next step toward a franchise enquiry. Built with a modern full-stack foundation.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB"],
    liveUrl: "https://sonofswad.vercel.app/",
    githubUrl: "",
    year: "2026",
    visual: "swad",
    featured: true,
  },
  {
    slug: "sanjay-general-store",
    name: "Sanjay General Store",
    category: "Frontend",
    status: "Ongoing",
    description: "A clear, approachable promotional website for a neighbourhood store.",
    detail:
      "A promotional site built to give a neighbourhood general store a friendly digital storefront, with responsive layouts and straightforward navigation.",
    technologies: ["Angular", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://sanjay-general-store.vercel.app/",
    githubUrl: "",
    year: "2026",
    visual: "store",
    featured: true,
  },
  {
    slug: "rishas-collection",
    name: "Risha's Collection",
    category: "Full-stack",
    status: "Ongoing",
    description: "A responsive e-commerce experience for an independent clothing brand.",
    detail:
      "An online shopping experience with a responsive interface, product browsing, and a full-stack foundation for a clothing brand.",
    technologies: ["React", "Tailwind CSS", "JavaScript", "MongoDB"],
    liveUrl: "https://risha-collections.vercel.app/",
    githubUrl: "",
    year: "2026",
    visual: "collection",
    featured: true,
  },
  {
    slug: "aarti-sangrah",
    name: "Aarti Sangrah",
    category: "Frontend",
    status: "Live",
    description: "A devotional library of aartis, organised in an inviting card-based UI.",
    detail:
      "A devotional web app that brings aartis for multiple Hindu deities together in a simple, card-based browsing experience.",
    technologies: ["React", "JavaScript", "Tailwind CSS"],
    liveUrl: "https://aarti-sangrah-liart.vercel.app/",
    githubUrl: "",
    year: "2025",
    visual: "aarti",
  },
  {
    slug: "notebook-application",
    name: "Notebook Application",
    category: "Full-stack",
    status: "Live",
    description: "A lightweight notes manager with full CRUD and a responsive interface.",
    detail:
      "A practical notes manager for creating, reading, updating, and deleting notes in a clean, responsive interface.",
    technologies: ["React", "Tailwind CSS", "JavaScript"],
    liveUrl: "https://notesapplication-rho.vercel.app/",
    githubUrl: "",
    year: "2025",
    visual: "notebook",
  },
  {
    slug: "stone-paper-scissors",
    name: "Stone Paper Scissors",
    category: "Interactive",
    status: "Coming soon",
    description: "A browser game driven by JavaScript logic and direct DOM interaction.",
    detail:
      "A small interactive game exploring browser events, interface feedback, and JavaScript decision logic.",
    technologies: ["HTML", "CSS", "JavaScript"],
    liveUrl: "",
    githubUrl: "",
    year: "2025",
    visual: "game",
  },
];
