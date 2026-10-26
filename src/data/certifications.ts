export type Certification = {
  issuer: string;
  name: string;
  detail: string;
  year?: string;
  imageUrl?: string;
  documentUrl?: string;
  verifyUrl?: string;
};

export const certifications: Certification[] = [
  {
    issuer: "HackerRank",
    name: "Frontend Developer (React)",
    detail: "Role certification",
    year: "2026",
    imageUrl: "/certificates/hackerrank-react.jpg",
    documentUrl: "/certificates/hackerrank-react.jpg",
  },
  {
    issuer: "HackerRank",
    name: "JavaScript (Basic)",
    detail: "Skill certification",
    year: "2026",
    imageUrl: "/certificates/hackerrank-javascript-basic.jpg",
    documentUrl: "/certificates/hackerrank-javascript-basic.jpg",
  },
  {
    issuer: "HackerRank",
    name: "CSS (Basic)",
    detail: "Skill certification",
    year: "2026",
    imageUrl: "/certificates/hackerrank-css-basic.jpg",
    documentUrl: "/certificates/hackerrank-css-basic.jpg",
  },
  {
    issuer: "Itronix Solutions",
    name: "C & C++ Programming",
    detail: "Programming language certification",
    year: "2025",
    imageUrl: "/certificates/itronix-c-cpp.jpg",
    documentUrl: "/certificates/itronix-c-cpp.jpg",
  },
  {
    issuer: "Codec Technologies",
    name: "Web Developer Internship",
    detail: "One-month internship, July–August",
    year: "2025",
    imageUrl: "/certificates/codec-web-developer-internship.jpg",
    documentUrl: "/certificates/codec-web-developer-internship.jpg",
  },
  {
    issuer: "Zyntiq",
    name: "Certificate of Appreciation",
    detail: "Recognition for effort, commitment, and contribution",
    year: "2026",
    imageUrl: "/certificates/zyntiq-appreciation.jpg",
    documentUrl: "/certificates/zyntiq-appreciation.jpg",
  },
  {
    issuer: "Zyntiq",
    name: "Certificate of Excellence",
    detail: "Recognition for consistent effort and excellence",
    year: "2026",
    imageUrl: "/certificates/zyntiq-excellence.jpg",
    documentUrl: "/certificates/zyntiq-excellence.jpg",
  },
  {
    issuer: "MangosOrange Services",
    name: "Software Developer Intern",
    detail: "45-day internship, April–May",
    year: "2026",
    imageUrl: "/certificates/mangosorange-software-developer-internship.png",
    documentUrl: "/certificates/mangosorange-software-developer-internship.png",
  },
];
