"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { getOpportunities, OpportunityCardData } from "@/lib/opportunities/actions";
import { ApplicationStatus, Opportunity } from "@/types/database";

export interface StudentSectionRecord {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  section: string;
  cgpa: number;
  email: string;
  phone: string;
  skills: string[];
  applied: boolean;
  status?: ApplicationStatus;
  appliedAt?: string;
}

export interface SectionBreakdown {
  sectionName: string;
  totalStudents: number;
  appliedCount: number;
  notAppliedCount: number;
  participationRate: number; // 0 - 100%
  appliedStudents: StudentSectionRecord[];
  notAppliedStudents: StudentSectionRecord[];
}

export interface OpportunityCoordinatorData extends OpportunityCardData {
  totalEligible: number;
  totalApplied: number;
  totalNotApplied: number;
  overallParticipationRate: number;
  sections: Record<string, SectionBreakdown>;
}

import {
  COLLEGE_DEPARTMENTS,
  ALL_COLLEGE_SECTIONS,
  CollegeDepartmentConfig,
} from "./constants";
export { COLLEGE_DEPARTMENTS, ALL_COLLEGE_SECTIONS };
export type { CollegeDepartmentConfig };

// Name and skill seed pools for realistic student cohort simulation
const FIRST_NAMES = [
  "Aarav", "Alex", "Aditya", "Ananya", "Arjun", "Bhavana", "Divya", "Harish", "Karthik",
  "Kavya", "Kunal", "Meera", "Meghana", "Neha", "Pooja", "Priya", "Rakesh", "Rohan",
  "Sai", "Sandeep", "Sneha", "Swathi", "Tejaswini", "Varun", "Vikram", "Yash", "Zoya",
  "Nikhil", "Tarun", "Shreya", "Rhea", "Gautam", "Abhishek", "Deepak", "Chaitanya", "Vamsi"
];

const LAST_NAMES = [
  "Sharma", "Reddy", "Gupta", "Kulkarni", "Varma", "Patel", "Rao", "Deshmukh", "Nair",
  "Madhavan", "Sundaram", "Nanduri", "Chowdary", "Koushik", "Pillai", "Murthy", "Bandaru",
  "Tanguturi", "Konidela", "Pasupuleti", "Chenna", "Babu", "Mishra", "Verma", "Iyer"
];

const SKILL_POOLS: Record<string, string[][]> = {
  CSE: [["Python", "DSA", "AWS"], ["Java", "Spring", "SQL"], ["React", "TypeScript", "Node.js"], ["C++", "Docker", "Go"]],
  CSM: [["Python", "Machine Learning", "PyTorch"], ["TensorFlow", "Deep Learning", "NLP"], ["Computer Vision", "Python", "Flask"]],
  CSD: [["Python", "Data Science", "Pandas"], ["SQL", "PowerBI", "Tableau"], ["R", "Statistics", "Machine Learning"]],
  AIDS: [["Python", "AI Algorithms", "TensorFlow"], ["Data Mining", "SQL", "Spark"], ["Neural Networks", "FastAPI", "Python"]],
  DS: [["Python", "Data Analysis", "SQL"], ["Tableau", "Excel", "ETL"], ["BigData", "Spark", "Python"]],
  PHE: [["Bioprocess", "Data Analysis", "Python"], ["Quality Control", "Regulatory Affairs", "HPLC"], ["Pharma Analytics", "Bioinformatics"]],
  EEE: [["MATLAB", "Circuit Design", "Power Systems"], ["Embedded C", "Microcontrollers", "IoT"], ["PLC", "SCADA", "Python"]],
  ECE: [["Embedded Systems", "Verilog", "VLSI"], ["IoT", "C++", "Microcontrollers"], ["Signal Processing", "MATLAB", "Python"]],
  MECH: [["AutoCAD", "SolidWorks", "ANSYS"], ["Thermodynamics", "Python", "MATLAB"], ["CNC", "Robotics", "CATIA"]],
  CIVIL: [["AutoCAD", "STAAD Pro", "Revit"], ["Structural Analysis", "GIS", "Surveying"], ["Estimation", "Construction Management", "Excel"]],
};

// Generate deterministic realistic student cohort across all 27 college sections
function generateAllCohortStudents(): StudentSectionRecord[] {
  const students: StudentSectionRecord[] = [];
  let studentCounter = 100;

  ALL_COLLEGE_SECTIONS.forEach((secKey, secIdx) => {
    const parts = secKey.split("-");
    const dept = parts[0];
    const secLetter = parts[1] || "A";
    const skillList = SKILL_POOLS[dept] || SKILL_POOLS["CSE"];

    // 8 students per section to create balanced, highly realistic cohorts
    for (let i = 0; i < 8; i++) {
      studentCounter++;
      const nameIndex = (secIdx * 5 + i) % FIRST_NAMES.length;
      const lastNameIndex = (secIdx * 3 + i * 2) % LAST_NAMES.length;
      const firstName = FIRST_NAMES[nameIndex];
      const lastName = LAST_NAMES[lastNameIndex];
      const fullName = `${firstName} ${lastName}`;
      const rollNumber = `22${dept}${String((secIdx + 1) * 10 + i + 1).padStart(3, "0")}`;
      const cgpa = parseFloat((7.2 + ((secIdx * 7 + i * 11) % 25) * 0.09).toFixed(2));
      const skills = skillList[i % skillList.length];

      students.push({
        id: `st-${secKey.toLowerCase().replace("-", "")}-${i + 1}`,
        name: fullName,
        rollNumber,
        department: dept,
        year: 3,
        section: secLetter,
        cgpa,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`,
        phone: `+91 98${String((secIdx * 13 + i * 17) % 90000000 + 10000000).padStart(8, "0")}`,
        skills,
        applied: false,
      });
    }
  });

  return students;
}

const MOCK_COHORT_STUDENTS: StudentSectionRecord[] = generateAllCohortStudents();

/**
 * Fetch all placement opportunities with comprehensive section-wise applicant analytics
 */
export async function getCoordinatorOpportunities(sectionFilter?: string): Promise<{
  opportunities: OpportunityCoordinatorData[];
  totalDrives: number;
  totalApplications: number;
  overallRate: number;
  availableSections: string[];
}> {
  const oppsResponse = await getOpportunities({ pageSize: 50, deadlineFilter: "all" });
  const rawOpps = oppsResponse.opportunities;

  const sectionKeys = ALL_COLLEGE_SECTIONS;

  const enrichedOpps: OpportunityCoordinatorData[] = rawOpps.map((opp, idx) => {
    // Deterministic distribution per opportunity based on index
    const sections: Record<string, SectionBreakdown> = {};
    let totalEligible = 0;
    let totalApplied = 0;

    sectionKeys.forEach((secKey, secIdx) => {
      const parts = secKey.split("-");
      const dept = parts[0];
      const secLetter = parts[1] || "A";
      const students = MOCK_COHORT_STUDENTS.filter(
        (s) => s.department === dept && s.section === secLetter
      );

      // Deterministically vary applied students per opportunity
      const appliedStudents: StudentSectionRecord[] = [];
      const notAppliedStudents: StudentSectionRecord[] = [];

      students.forEach((student, sIdx) => {
        // Vary who applied based on student id and opportunity index
        const hash = (student.name.charCodeAt(0) + idx * 7 + sIdx * 3 + secIdx) % 10;
        const hasApplied = hash >= 4; // roughly 60% participation

        if (hasApplied) {
          const statuses: ApplicationStatus[] = ["applied", "applied", "interview", "selected", "assessment"];
          const status = statuses[(sIdx + idx + secIdx) % statuses.length];
          appliedStudents.push({
            ...student,
            applied: true,
            status,
            appliedAt: new Date(Date.now() - (idx * 2 + sIdx) * 3600000 * 12).toISOString(),
          });
        } else {
          notAppliedStudents.push({
            ...student,
            applied: false,
          });
        }
      });

      const secTotal = students.length;
      const secApplied = appliedStudents.length;
      const secNotApplied = notAppliedStudents.length;
      const secRate = secTotal > 0 ? Math.round((secApplied / secTotal) * 100) : 0;

      sections[secKey] = {
        sectionName: secKey,
        totalStudents: secTotal,
        appliedCount: secApplied,
        notAppliedCount: secNotApplied,
        participationRate: secRate,
        appliedStudents,
        notAppliedStudents,
      };

      totalEligible += secTotal;
      totalApplied += secApplied;
    });

    const totalNotApplied = totalEligible - totalApplied;
    const overallParticipationRate = totalEligible > 0
      ? Math.round((totalApplied / totalEligible) * 100)
      : 0;

    return {
      ...opp,
      totalEligible,
      totalApplied,
      totalNotApplied,
      overallParticipationRate,
      sections,
    };
  });

  const totalDrives = enrichedOpps.length;
  const totalApplications = enrichedOpps.reduce((acc, o) => acc + o.totalApplied, 0);
  const totalEligibleAll = enrichedOpps.reduce((acc, o) => acc + o.totalEligible, 0);
  const overallRate = totalEligibleAll > 0
    ? Math.round((totalApplications / totalEligibleAll) * 100)
    : 0;

  return {
    opportunities: enrichedOpps,
    totalDrives,
    totalApplications,
    overallRate,
    availableSections: sectionKeys,
  };
}
