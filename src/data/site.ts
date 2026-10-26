import { profile } from "./profile";

export const site = {
  title: `${profile.name} — From code to charts`,
  description:
    "Harsh Kapoor is a full-stack developer transitioning into data analytics, building useful products and turning data into decisions.",
  url: "https://your-domain.vercel.app",
  homePath: "/",
  email: profile.email,
  phone: profile.phone,
  resumePath: "/Harsh_Kapoor_Resume.pdf",
  socialImagePath: "/og-image.png",
  keywords: [
    "Harsh Kapoor",
    "Full-Stack Developer",
    "MERN Developer",
    "Data Analyst",
    "React",
    "JavaScript",
    "Python",
    "SQL",
  ],
  language: "en",
  themeColor: "#11120f",
  socials: [
    { label: "LinkedIn", url: profile.socials.linkedin },
    { label: "GitHub", url: profile.socials.github },
  ],
} as const;
