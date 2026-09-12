import { SkillCategory } from "@/types/database";

export interface StandardSkill {
  name: string;
  category: SkillCategory;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming Language",
  "Frontend",
  "Backend",
  "Database",
  "Cloud",
  "AI/ML",
  "Tools",
  "Other",
];

export const STANDARD_SKILLS: StandardSkill[] = [
  // Programming Languages
  { name: "Python", category: "Programming Language" },
  { name: "JavaScript", category: "Programming Language" },
  { name: "TypeScript", category: "Programming Language" },
  { name: "Java", category: "Programming Language" },
  { name: "C++", category: "Programming Language" },
  { name: "C#", category: "Programming Language" },
  { name: "Go", category: "Programming Language" },
  { name: "Rust", category: "Programming Language" },
  { name: "SQL", category: "Programming Language" },
  { name: "PHP", category: "Programming Language" },
  { name: "Kotlin", category: "Programming Language" },
  { name: "Swift", category: "Programming Language" },
  { name: "Dart", category: "Programming Language" },
  { name: "C", category: "Programming Language" },

  // Frontend
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "HTML5 / CSS3", category: "Frontend" },
  { name: "Redux", category: "Frontend" },
  { name: "React Native", category: "Frontend" },
  { name: "Svelte", category: "Frontend" },

  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Spring Boot", category: "Backend" },
  { name: "ASP.NET Core", category: "Backend" },
  { name: "Flask", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "GraphQL", category: "Backend" },
  { name: "NestJS", category: "Backend" },

  // Database
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "MySQL", category: "Database" },
  { name: "Redis", category: "Database" },
  { name: "SQLite", category: "Database" },
  { name: "Prisma", category: "Database" },
  { name: "Supabase", category: "Database" },
  { name: "Firebase", category: "Database" },

  // Cloud
  { name: "AWS", category: "Cloud" },
  { name: "Docker", category: "Cloud" },
  { name: "Kubernetes", category: "Cloud" },
  { name: "Google Cloud (GCP)", category: "Cloud" },
  { name: "Microsoft Azure", category: "Cloud" },
  { name: "CI/CD Pipelines", category: "Cloud" },
  { name: "GitHub Actions", category: "Cloud" },
  { name: "Terraform", category: "Cloud" },

  // AI / ML
  { name: "Machine Learning", category: "AI/ML" },
  { name: "Deep Learning", category: "AI/ML" },
  { name: "PyTorch", category: "AI/ML" },
  { name: "TensorFlow", category: "AI/ML" },
  { name: "Scikit-learn", category: "AI/ML" },
  { name: "Natural Language Processing (NLP)", category: "AI/ML" },
  { name: "Computer Vision", category: "AI/ML" },
  { name: "Pandas", category: "AI/ML" },
  { name: "NumPy", category: "AI/ML" },

  // Tools
  { name: "Git", category: "Tools" },
  { name: "GitHub", category: "Tools" },
  { name: "Linux / Bash", category: "Tools" },
  { name: "Postman", category: "Tools" },
  { name: "Figma", category: "Tools" },
  { name: "VS Code", category: "Tools" },
  { name: "Jira", category: "Tools" },

  // Other
  { name: "Data Structures", category: "Other" },
  { name: "Algorithms", category: "Other" },
  { name: "Problem Solving", category: "Other" },
  { name: "System Design", category: "Other" },
  { name: "Object-Oriented Programming (OOP)", category: "Other" },
  { name: "Agile / Scrum", category: "Other" },
];

/**
 * Searches skills with optional category filter
 */
export function searchSkills(query: string, category?: SkillCategory | "All"): StandardSkill[] {
  const q = query.trim().toLowerCase();
  return STANDARD_SKILLS.filter((skill) => {
    const matchesCategory = !category || category === "All" || skill.category === category;
    const matchesQuery = !q || skill.name.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

/**
 * Infers category for a skill name by searching standard catalog or defaulting to 'Other'
 */
export function inferSkillCategory(skillName: string): SkillCategory {
  const normalized = skillName.trim().toLowerCase();
  const found = STANDARD_SKILLS.find((s) => s.name.toLowerCase() === normalized);
  if (found) return found.category;
  return "Other";
}

