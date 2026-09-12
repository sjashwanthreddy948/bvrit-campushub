export interface CollegeDepartmentConfig {
  code: string;
  name: string;
  sections: string[];
}

export const COLLEGE_DEPARTMENTS: CollegeDepartmentConfig[] = [
  {
    code: "CSE",
    name: "Computer Science & Engineering",
    sections: ["CSE-A", "CSE-B", "CSE-C", "CSE-D", "CSE-E", "CSE-F", "CSE-G", "CSE-H", "CSE-I"],
  },
  {
    code: "CSM",
    name: "CSE (AI & Machine Learning)",
    sections: ["CSM-A", "CSM-B", "CSM-C"],
  },
  {
    code: "CSD",
    name: "CSE (Data Science)",
    sections: ["CSD-A", "CSD-B"],
  },
  {
    code: "AIDS",
    name: "Artificial Intelligence & Data Science",
    sections: ["AIDS-A", "AIDS-B"],
  },
  {
    code: "DS",
    name: "Data Science",
    sections: ["DS-A", "DS-B"],
  },
  {
    code: "PHE",
    name: "Pharmaceutical Engineering",
    sections: ["PHE"],
  },
  {
    code: "EEE",
    name: "Electrical & Electronics Engineering",
    sections: ["EEE"],
  },
  {
    code: "ECE",
    name: "Electronics & Communication Engineering",
    sections: ["ECE-A", "ECE-B", "ECE-C"],
  },
  {
    code: "MECH",
    name: "Mechanical Engineering",
    sections: ["MECH"],
  },
  {
    code: "CIVIL",
    name: "Civil Engineering",
    sections: ["CIVIL-A", "CIVIL-B", "CIVIL-C"],
  },
];

export const ALL_COLLEGE_SECTIONS: string[] = COLLEGE_DEPARTMENTS.flatMap((d) => d.sections);
