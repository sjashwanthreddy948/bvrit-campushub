/**
 * CampusHub — Today's Placement Activity Store
 * 
 * Official in-memory data store for placement company activities, multi-round
 * schedules, and deterministic student awareness.
 */

import {
  PlacementActivity,
  StudentPlacementProfile,
  TodaysPlacementAwarenessResult,
  PlacementActivityWithMatch,
} from "./types";
import { evaluatePlacementActivityMatch } from "./matching";

function getLocalDateString(offsetDays: number = 0): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const INITIAL_ACTIVITIES: PlacementActivity[] = [
  {
    id: "act-today-1",
    companyName: "Microsoft India",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    companyWebsite: "https://careers.microsoft.com",
    role: "Software Engineer (SDE-1)",
    employmentType: "Full-Time",
    packageCtc: "₹24.00 LPA",
    stipend: "₹1,25,000 / month",
    location: "Hyderabad / Bengaluru",
    workMode: "Hybrid",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    otherRequirements: "No active backlogs. Clean academic track record.",
    requiredSkills: ["Python", "DSA", "SQL", "OOP"],
    preferredSkills: ["Azure", "System Architecture", "TypeScript"],
    importantPreparationSkills: ["Binary Trees & Graphs", "Dynamic Programming", "SQL Query Optimization", "Concurrency Basics"],
    activityType: "Company Visit / Placement Drive",
    date: getLocalDateString(0), // Today
    startTime: "10:00 AM",
    endTime: "05:30 PM",
    venue: "BVRIT Main Auditorium & Lab 3",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/bvrit-microsoft-drive",
    selectionRounds: [
      "Round 1: Online Coding Assessment (90 mins)",
      "Round 2: Technical Interview 1 (DSA & Architecture)",
      "Round 3: Technical Interview 2 (System Design & Problem Solving)",
      "Round 4: AA & Leadership Discussion",
    ],
    instructions: "Arrive at Main Auditorium by 09:30 AM with college ID card and 2 physical copies of your ATS resume. Laptops are allowed for the online coding assessment.",
    attachments: [
      { name: "Microsoft_SDE_JD_2026.pdf", url: "https://example.com/jd-microsoft.pdf" },
      { name: "Online_Assessment_Rules.pdf", url: "https://example.com/rules-microsoft.pdf" },
    ],
    registrationLink: "https://campushub.bvrit.ac.in/opportunities/opp-3",
    driveId: "drive-microsoft-2026",
    status: "Published",
    createdBy: "coord-tpo",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-today-2",
    companyName: "Amazon Web Services (AWS)",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    companyWebsite: "https://amazon.jobs",
    role: "Cloud Support Associate",
    employmentType: "Full-Time",
    packageCtc: "₹19.50 LPA",
    stipend: "₹80,000 / month",
    location: "Hyderabad, Telangana",
    workMode: "Hybrid",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE", "EEE"],
    eligibleYears: [3, 4],
    minCgpa: 7.0,
    otherRequirements: "Strong aptitude in Linux and networking.",
    requiredSkills: ["Linux", "Networking", "Python", "Problem Solving"],
    preferredSkills: ["AWS Fundamentals", "Shell Scripting"],
    importantPreparationSkills: ["OSI Model", "TCP/IP & DNS", "Linux CLI Troubleshooting"],
    activityType: "Online Assessment",
    date: getLocalDateString(0), // Today
    startTime: "02:30 PM",
    endTime: "04:30 PM",
    venue: "BVRIT Online Lab 1 & 2 / HackerRank Proctored",
    meetingLink: "https://hackerrank.com/bvrit-aws-assessment-2026",
    selectionRounds: [
      "Round 1: Proctored Online Assessment (MCQ & Coding)",
      "Round 2: Technical Interview (Networking & Linux)",
      "Round 3: Bar Raiser & Amazon Leadership Principles",
    ],
    instructions: "Proctored HackerRank assessment. Chrome browser with webcam and microphone required. Ensure you log in 15 minutes before 02:30 PM.",
    attachments: [
      { name: "AWS_Assessment_Guidelines.pdf", url: "https://example.com/aws-guidelines.pdf" },
    ],
    registrationLink: "https://campushub.bvrit.ac.in/opportunities/opp-1",
    driveId: "drive-amazon-2026",
    status: "Published",
    createdBy: "coord-tpo",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-today-3",
    companyName: "JPMorgan Chase & Co.",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/07/J_P_Morgan_Chase_Logo_2008_1.svg",
    companyWebsite: "https://careers.jpmorgan.com",
    role: "Software Engineer Associate",
    employmentType: "Full-Time",
    packageCtc: "₹19.75 LPA",
    stipend: "₹75,000 / month",
    location: "Hyderabad / Bengaluru",
    workMode: "Hybrid",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    otherRequirements: "Minimum 75% throughout 10th, 12th and B.Tech.",
    requiredSkills: ["Java", "Spring Boot", "SQL", "Data Structures"],
    preferredSkills: ["Microservices", "Docker", "AWS"],
    importantPreparationSkills: ["Collections Framework", "Concurrency in Java", "Database Indexing"],
    activityType: "Registration Deadline",
    date: getLocalDateString(0), // Today
    startTime: "11:59 PM",
    venue: "CampusHub Placement Portal",
    selectionRounds: [
      "Registration & Resume Screening",
      "HackerRank Coding Challenge",
      "Code for Good Hackathon / Interview",
    ],
    instructions: "Final deadline to register and complete your single-column ATS resume verification on CampusHub.",
    attachments: [],
    registrationLink: "https://campushub.bvrit.ac.in/opportunities/opp-6",
    status: "Published",
    createdBy: "coord-tpo",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-tomorrow-1",
    companyName: "Oracle Cloud Infrastructure (OCI)",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    companyWebsite: "https://www.oracle.com/careers",
    role: "Associate Software Engineer",
    employmentType: "Full-Time",
    packageCtc: "₹18.00 LPA",
    stipend: "₹65,000 / month",
    location: "Hyderabad, Telangana",
    workMode: "Hybrid",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "IT"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    requiredSkills: ["Java", "C++", "DSA", "Distributed Systems"],
    preferredSkills: ["Kubernetes", "Linux Kernel"],
    importantPreparationSkills: ["B-Trees", "Hash Tables", "Multi-threading"],
    activityType: "Technical Interview",
    date: getLocalDateString(1), // Tomorrow
    startTime: "10:30 AM",
    endTime: "01:30 PM",
    venue: "BVRIT TPO Boardroom B & Zoom Video",
    meetingLink: "https://oracle.zoom.us/j/bvrit-tech-interviews",
    selectionRounds: [
      "Round 1: Online Assessment (Cleared)",
      "Round 2: Technical Interview 1 (Tomorrow)",
      "Round 3: Technical Interview 2 & Bar Raiser",
    ],
    instructions: "Individual interview slots will be shared via email to shortlisted candidates. Keep your live coding environment ready.",
    attachments: [],
    status: "Published",
    createdBy: "coord-tpo",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-in3days-1",
    companyName: "Cisco Systems",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    companyWebsite: "https://jobs.cisco.com",
    role: "Software Consulting Engineer",
    employmentType: "Full-Time",
    packageCtc: "₹21.00 LPA",
    stipend: "₹75,000 / month",
    location: "Bengaluru, Karnataka",
    workMode: "Hybrid",
    eligibleDepartments: ["CSE", "ECE", "IT", "EEE"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    requiredSkills: ["Networking", "Python", "Linux", "C++"],
    preferredSkills: ["Cloud", "Docker", "DevOps"],
    importantPreparationSkills: ["Routing & Switching", "Socket Programming", "Scripting"],
    activityType: "Pre-Placement Talk",
    date: getLocalDateString(3), // In 3 days
    startTime: "03:00 PM",
    endTime: "04:30 PM",
    venue: "Main Auditorium / Cisco Webex",
    meetingLink: "https://cisco.webex.com/meet/bvrit-campus",
    selectionRounds: [
      "Pre-Placement Talk",
      "Online Written Test",
      "Technical & Managerial Interviews",
    ],
    instructions: "Attendance is strongly recommended for all eligible 3rd and 4th year students.",
    attachments: [],
    status: "Published",
    createdBy: "coord-tpo",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-draft-1",
    companyName: "Uber Technologies",
    role: "Backend Engineer Intern",
    employmentType: "Internship",
    packageCtc: "₹38.00 LPA",
    location: "Hyderabad, Telangana",
    workMode: "On-site",
    eligibleDepartments: ["CSE", "CSM"],
    eligibleYears: [3],
    minCgpa: 8.0,
    requiredSkills: ["Golang", "Java", "DSA", "Distributed Systems"],
    preferredSkills: ["Kafka", "Redis"],
    importantPreparationSkills: ["Concurrency", "Microservices Architecture"],
    activityType: "Company Visit / Placement Drive",
    date: getLocalDateString(5),
    startTime: "09:30 AM",
    venue: "TPO Complex",
    selectionRounds: ["OA", "Tech 1", "Tech 2", "HR"],
    instructions: "Draft circular pending recruiter confirmation.",
    attachments: [],
    status: "Draft",
    createdBy: "coord-tpo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "act-cancelled-1",
    companyName: "Startup Labs India",
    role: "Frontend Developer",
    employmentType: "Internship",
    packageCtc: "₹8.00 LPA",
    location: "Remote",
    workMode: "Remote",
    eligibleDepartments: ["CSE", "ECE"],
    eligibleYears: [3, 4],
    minCgpa: 6.5,
    requiredSkills: ["HTML", "CSS", "JavaScript"],
    preferredSkills: ["React"],
    importantPreparationSkills: ["DOM manipulation"],
    activityType: "Company Visit / Placement Drive",
    date: getLocalDateString(0),
    startTime: "11:00 AM",
    venue: "Google Meet",
    selectionRounds: ["Interview"],
    instructions: "Cancelled due to recruiter scheduling conflict.",
    attachments: [],
    status: "Cancelled",
    createdBy: "coord-tpo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let placementActivities: PlacementActivity[] = [...INITIAL_ACTIVITIES];

export function getAllPlacementActivities(
  role: string = "student",
  filter?: { status?: string; type?: string; company?: string }
): PlacementActivity[] {
  let list = [...placementActivities];

  // Security: Students only see Published and Updated activities
  if (role !== "coordinator" && role !== "admin") {
    list = list.filter((a) => a.status === "Published" || a.status === "Updated");
  }

  if (filter?.status && filter.status !== "all") {
    list = list.filter((a) => a.status === filter.status);
  }

  if (filter?.type && filter.type !== "all") {
    list = list.filter((a) => a.activityType === filter.type);
  }

  if (filter?.company) {
    const q = filter.company.toLowerCase();
    list = list.filter((a) => a.companyName.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
  }

  // Sort: earlier dates first, then by start time
  return list.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getPlacementActivityById(id: string, role: string = "student"): PlacementActivity | null {
  const activity = placementActivities.find((a) => a.id === id);
  if (!activity) return null;

  // Security: If student, restrict access if Draft or Cancelled
  if (role !== "coordinator" && role !== "admin") {
    if (activity.status === "Draft" || activity.status === "Cancelled") {
      return null;
    }
  }

  return activity;
}

export function getTodaysPlacementActivities(
  studentProfile?: StudentPlacementProfile
): TodaysPlacementAwarenessResult {
  const todayStr = getLocalDateString(0);

  // Filter only published activities visible to students
  const published = placementActivities.filter(
    (a) => a.status === "Published" || a.status === "Updated"
  );

  const tomorrowStr = getLocalDateString(1);

  // Helper to parse time in minutes from midnight for today's comparison
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const parts = timeStr.trim().split(" ");
      const [hoursStr, minsStr] = parts[0].split(":");
      let h = parseInt(hoursStr, 10);
      const m = parseInt(minsStr, 10);
      const isPm = (parts[1] || "").toUpperCase() === "PM";
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      return h * 60 + m;
    } catch {
      return 12 * 60;
    }
  };

  const nowMinutes = (() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  })();

  // 1. Today's activities
  const todayRaw = published
    .filter((a) => a.date === todayStr)
    .sort((a, b) => {
      // Priority 3: Starting soon (within next 180 minutes)
      const diffA = parseTimeToMinutes(a.startTime) - nowMinutes;
      const diffB = parseTimeToMinutes(b.startTime) - nowMinutes;
      const isSoonA = diffA > 0 && diffA <= 180;
      const isSoonB = diffB > 0 && diffB <= 180;

      if (isSoonA && !isSoonB) return -1;
      if (!isSoonA && isSoonB) return 1;

      // Priority 1: Official placement drives / assessments / interviews
      // Priority 2: Registration deadlines
      const priorityOrder: Record<string, number> = {
        "Company Visit / Placement Drive": 1,
        "Online Assessment": 2,
        "Technical Interview": 3,
        "HR Interview": 4,
        "Group Discussion": 5,
        "Final Results": 6,
        "Registration Deadline": 7,
        "Pre-Placement Talk": 8,
      };
      const pA = priorityOrder[a.activityType] || 99;
      const pB = priorityOrder[b.activityType] || 99;
      if (pA !== pB) return pA - pB;
      return a.startTime.localeCompare(b.startTime);
    });

  // 2. Upcoming activities (Priority 4: Tomorrow, Priority 5: Beyond)
  const upcomingRaw = published
    .filter((a) => a.date > todayStr)
    .sort((a, b) => {
      const isTomorrowA = a.date === tomorrowStr;
      const isTomorrowB = b.date === tomorrowStr;
      if (isTomorrowA && !isTomorrowB) return -1;
      if (!isTomorrowA && isTomorrowB) return 1;

      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  // Calculate deterministic match for each
  const defaultProfile: StudentPlacementProfile = studentProfile || {
    name: "Alex Johnson",
    department: "CSE",
    year: 3,
    cgpa: 8.42,
    skills: ["Python", "DSA", "Java", "SQL", "React", "AWS", "Algorithms", "Data Structures", "Problem Solving", "C++"],
  };

  const todayActivities: PlacementActivityWithMatch[] = todayRaw.map((act) => ({
    ...act,
    match: evaluatePlacementActivityMatch(defaultProfile, act),
  }));

  const nextUpcomingActivity: PlacementActivityWithMatch | null =
    upcomingRaw.length > 0
      ? {
          ...upcomingRaw[0],
          match: evaluatePlacementActivityMatch(defaultProfile, upcomingRaw[0]),
        }
      : null;

  return {
    todayActivities,
    nextUpcomingActivity,
    totalTodayCount: todayActivities.length,
  };
}

export function createPlacementActivity(
  data: Omit<PlacementActivity, "id" | "createdAt" | "updatedAt">
): PlacementActivity {
  const newActivity: PlacementActivity = {
    ...data,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  placementActivities.unshift(newActivity);
  return newActivity;
}

export function updatePlacementActivity(
  id: string,
  updates: Partial<PlacementActivity>
): PlacementActivity | null {
  const index = placementActivities.findIndex((a) => a.id === id);
  if (index === -1) return null;

  placementActivities[index] = {
    ...placementActivities[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return placementActivities[index];
}

export function deletePlacementActivity(id: string): boolean {
  const initialLength = placementActivities.length;
  placementActivities = placementActivities.filter((a) => a.id !== id);
  return placementActivities.length < initialLength;
}

/**
 * Testing Helpers
 */
export function clearTodayActivitiesForTesting(): void {
  const todayStr = getLocalDateString(0);
  placementActivities = placementActivities.map((a) =>
    a.date === todayStr ? { ...a, date: getLocalDateString(10) } : a
  );
}

export function restoreDefaultActivities(): void {
  placementActivities = [...INITIAL_ACTIVITIES];
}
