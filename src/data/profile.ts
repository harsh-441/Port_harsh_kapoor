export const profile = {
  name: "Harsh Kapoor",
  firstName: "Harsh",
  monogram: "HK",
  title: "Full-Stack Developer · Data Analyst",
  roles: ["Full-Stack Developer", "Data Analyst"],
  photo: {
    src: "/images/harsh.jpg",
    webpSrc: "/images/harsh.webp",
    placeholderSrc: "/images/harsh-placeholder.webp",
    alt: "Harsh Kapoor, full-stack developer and aspiring data analyst",
    width: 1200,
    height: 1500,
  },
  orbitSkills: ["React.js", "Node.js / Express", "MongoDB", "SQL", "Python"],
  positioning: "Full-Stack (MERN) developer transitioning into Data Analytics.",
  summary:
    "Passionate Software Engineer with hands-on experience in full-stack development using the MERN stack (MongoDB, Express.js, React.js, Node.js). Proficient in JavaScript, Python, and SQL, building scalable web applications with REST APIs, database management, and responsive design. Strong understanding of OOP, SDLC, and Agile. Experienced with Git and GitHub. Skilled in problem-solving and debugging, writing clean and maintainable code.",
  phone: "9762325750",
  email: "harshkapoor766@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/kapoor-harsh-460b66446",
    github: "https://github.com/harsh-441/",
  },
  stats: [
    { value: 3, suffix: "", label: "Internships" },
    { value: 6, suffix: "+", label: "Projects built" },
    { value: 5, suffix: "", label: "Certifications" },
  ],
} as const;
