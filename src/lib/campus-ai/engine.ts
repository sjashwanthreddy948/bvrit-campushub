/**
 * CampusHub AI — BVRIT Narsapur Intelligence Engine
 * Deterministic, Grounded Institutional & Live Platform Answering Engine
 */

import { UserRole } from "@/types/database";
import {
  BVRIT_INSTITUTION_PROFILE,
  BVRIT_DEPARTMENTS,
  BVRIT_FACILITIES,
  BVRIT_TRANSPORT_ROUTES,
  BVRIT_PLACEMENTS,
  BVRIT_EXAM_REGULATIONS,
  BVRIT_KEY_CONTACTS,
  BVRIT_CLUBS_AND_FESTS,
  CampusDepartment,
} from "./knowledge";
import { getOpportunities } from "@/lib/opportunities/actions";
import { getCirculars } from "@/lib/circulars/actions";
import { getAssignments } from "@/lib/assignments/actions";

export interface CampusAiAnswer {
  answer: string;
  category: string;
  sourceTopics: string[];
  suggestedFollowUps: string[];
}

export interface UserAcademicContext {
  department?: string;
  year?: number;
  section?: string;
}

/**
 * Main engine function to answer queries about BVRIT Narsapur and live CampusHub modules
 */
export async function queryCampusAi(
  question: string,
  role?: UserRole,
  userContext?: UserAcademicContext
): Promise<CampusAiAnswer> {
  const q = question.trim().toLowerCase();

  if (!q) {
    return {
      answer: "Please ask a question about **B.V. Raju Institute of Technology (BVRIT), Narsapur**. You can inquire about circulars, opportunities, assignments, departments, placements, transport, hostels, or exam rules.",
      category: "General",
      sourceTopics: ["BVRIT Profile"],
      suggestedFollowUps: [
        "What are the latest circulars?",
        "What active internship opportunities are open?",
        "What assignments are due soon?",
        "Tell me about BVRIT Narsapur overview",
      ],
    };
  }

  // =========================================================================
  // 1. LIVE CAMPUS DIGEST ("Everything" / All Updates / Campus Activity)
  // =========================================================================
  if (
    q.includes("digest") ||
    q.includes("everything") ||
    q.includes("what is new") ||
    q.includes("what's new") ||
    q.includes("all update") ||
    q.includes("campus update") ||
    q.includes("campus activity") ||
    q.includes("all deadline") ||
    q.includes("upcoming deadline") ||
    q.includes("what is happening") ||
    q.includes("what's happening")
  ) {
    return await generateCampusDigest(userContext);
  }

  // =========================================================================
  // FACULTY PUBLISHING & MANAGEMENT WORKFLOWS
  // =========================================================================
  if (
    q.includes("faculty dashboard") ||
    (q.includes("faculty") &&
      (q.includes("publish") ||
        q.includes("post") ||
        q.includes("create") ||
        q.includes("workflow") ||
        q.includes("manage") ||
        q.includes("upload"))) ||
    q.includes("how do i publish") ||
    q.includes("how to publish") ||
    q.includes("how do i post") ||
    q.includes("how to post") ||
    q.includes("how do i create an assignment") ||
    q.includes("how to create an assignment")
  ) {
    let ans = `### 👨‍🏫 Faculty & Coordinator Workflows\n\n`;
    ans += `CampusHub divides publishing duties to keep operations streamlined:\n\n`;
    ans += `#### 1. 📢 Publishing Official Circulars (Faculty & Admin)\n`;
    ans += `• Go to **[Faculty Dashboard](/faculty/dashboard)** and click **[New Circular](/faculty/circulars/new)**.\n`;
    ans += `• Provide Title, Description, target Department (or 'All'), Year, and Section.\n`;
    ans += `• Attach official PDF circular files (type and size validated up to 10MB).\n`;
    ans += `• Specify submission / response deadlines if applicable.\n`;
    ans += `• Click **Publish** to immediately notify targeted students and generate a direct WhatsApp sharing link.\n\n`;

    ans += `#### 2. 📝 Creating Assignments & Vedic.ai Reminders (Faculty)\n`;
    ans += `• Go to **[Faculty Dashboard](/faculty/dashboard)** and click **[New Assignment](/faculty/assignments/new)**.\n`;
    ans += `• Enter Subject Code, Subject Name, Title, and Instructions.\n`;
    ans += `• Set Cohort Targeting (Department, Year, Section) and Strict Due Date.\n`;
    ans += `• Enter the direct **Vedic.ai submission URL** (\`https://vedicai.student.edwisely.com/#/...\`) so students can submit with one tap.\n`;
    ans += `• Click **Publish** to dispatch in-app notifications, timeline alerts, and WhatsApp reminders.\n\n`;

    ans += `#### 3. 💼 Placement Drives & Section Tracking (Placement Coordinator Only)\n`;
    ans += `• Placements and internships are managed exclusively via the **[Placement Coordinator Hub](/coordinator/dashboard)**.\n`;
    ans += `• **AI Opportunity Extractor:** Paste HR announcements to auto-extract role details and eligibility.\n`;
    ans += `• **Section Turnout Tracking:** See in real time how many students across all 27 college sections (CSE A-I, CSM A-C, CSD A-B, AIDS A-B, DS A-B, ECE A-C, EEE, MECH, CIVIL A-C, PHE) have applied vs not applied.\n`;
    ans += `• **Targeted WhatsApp Reminders:** Send one-click preformatted WhatsApp reminders directly to specific sections or the entire cohort.\n\n`;

    ans += `*Tip: Normal faculty accounts manage assignments and circulars, leaving placement coordination to the TPO.*`;

    return {
      answer: ans,
      category: "Faculty Hub",
      sourceTopics: ["Faculty Dashboard", "Publishing Workflows", "AI Extractor", "Vedic.ai Integration"],
      suggestedFollowUps: [
        "Open Faculty Dashboard",
        "How does the AI Opportunity Extractor work?",
        "What are the latest student circulars?",
        "What is Vedic.ai?",
      ],
    };
  }

  // =========================================================================
  // 2. LIVE CIRCULARS & NOTICES MODULE
  // =========================================================================
  if (
    q.includes("circular") ||
    q.includes("notice") ||
    q.includes("announcement") ||
    q.includes("memo") ||
    q.includes("exam circular") ||
    q.includes("schedule circular")
  ) {
    return await queryLiveCirculars(q, userContext);
  }

  // =========================================================================
  // 3. LIVE OPPORTUNITIES & INTERNSHIPS MODULE
  // =========================================================================
  if (
    q.includes("opportunity") ||
    q.includes("opportunities") ||
    q.includes("internship") ||
    q.includes("hackathon") ||
    (q.includes("job") && !q.includes("hod")) ||
    q.includes("open role") ||
    (q.includes("hiring") && !q.includes("who is hiring")) ||
    q.includes("stipend") ||
    q.includes("active opp")
  ) {
    return await queryLiveOpportunities(q, userContext);
  }

  // =========================================================================
  // 4. LIVE ASSIGNMENTS & VEDIC.AI SUBMISSIONS MODULE
  // =========================================================================
  if (
    q.includes("assignment") ||
    q.includes("homework") ||
    q.includes("lab task") ||
    q.includes("os lab") ||
    q.includes("dbms problem") ||
    q.includes("pending assignment") ||
    q.includes("assignments due")
  ) {
    return await queryLiveAssignments(q, userContext);
  }

  // =========================================================================
  // 5. VEDIC.AI / EDWISELY PLATFORM WORKFLOW
  // =========================================================================
  if (q.includes("vedic") || q.includes("edwisely") || q.includes("obe portal")) {
    let ans = `### Vedic.ai Academic Portal at BVRIT Narsapur\n\n`;
    ans += `BVRIT utilizes the **Vedic.ai** (Edwisely) platform for outcome-based academic execution, assignment submissions, internal evaluations, and learning analytics.\n\n`;
    ans += `• **Official Student & Faculty Portal:** [https://vedicai.student.edwisely.com/](https://vedicai.student.edwisely.com/)\n`;
    ans += `• **Mobile App:** Available on Android & iOS for students and faculty.\n`;

    if (role === "faculty") {
      ans += `\n**Faculty Workflow:**\n`;
      ans += `• Faculty can create assignments, set deadlines, and attach rubrics.\n`;
      ans += `• When creating assignments in CampusHub, paste the direct Vedic.ai submission URL so students can launch it with one tap.\n`;
      ans += `• Outcome-Based Education (OBE) course outcome (CO) mapping is configured through the Vedic.ai dashboard.\n`;
    } else {
      ans += `\n**Student Submission Guidelines:**\n`;
      ans += `• In CampusHub's **Assignments** module, view assignment reminders and tap **"Submit on Vedic.ai"**.\n`;
      ans += `• Log in with your institutional student credentials (College Roll Number / Email).\n`;
      ans += `• Check real-time submission confirmations and teacher evaluations directly in the portal.\n`;
    }

    ans += `\n*Note: For faculty development and teaching methodologies, SVES also maintains the renowned **VEDIC (Vishnu Educational Development and Innovation Centre)** at Aziznagar, Hyderabad.*`;

    return {
      answer: ans,
      category: "Academics",
      sourceTopics: ["Vedic.ai", "SVES VEDIC Centre"],
      suggestedFollowUps: [
        "What assignments are due soon?",
        "What are the autonomous exam regulations?",
        "What is the 75% attendance rule?",
      ],
    };
  }

  // =========================================================================
  // 6. SPECIFIC ACADEMIC DEPARTMENT INQUIRIES
  // =========================================================================
  const deptMatch = findDepartmentMatch(q);
  if (deptMatch) {
    let ans = `### Department of ${deptMatch.name} (${deptMatch.code})\n\n`;
    ans += `• **Head of Department (HOD):** ${deptMatch.hod}\n`;
    ans += `• **Established:** ${deptMatch.established} | **Degree:** ${deptMatch.degree}\n`;
    if (deptMatch.intake) ans += `• **Annual Approved Intake:** ${deptMatch.intake} seats\n`;
    ans += `• **Program Overview:** ${deptMatch.description}\n\n`;

    ans += `**Specialized Laboratories & Research Infrastructure:**\n`;
    deptMatch.keyLabs.forEach((lab) => {
      ans += `• ${lab}\n`;
    });

    if (deptMatch.code === "BME") {
      ans += `\n*BVRIT is a pioneering engineering college in Telangana offering Biomedical Engineering with the internationally recognized Assistive Technology Lab (ATL).*`;
    } else if (deptMatch.code === "CSE" || deptMatch.code === "AIML" || deptMatch.code === "AIDS") {
      ans += `\n*The computing departments benefit from dedicated high-performance GPU clusters and incubation through AIC-BVRIT.*`;
    }

    return {
      answer: ans,
      category: "Departments",
      sourceTopics: [deptMatch.name, "Academic Laboratories"],
      suggestedFollowUps: [
        `What are placement records for ${deptMatch.code}?`,
        `Are there any circulars for ${deptMatch.code}?`,
        "What other B.Tech departments are available?",
      ],
    };
  }

  // =========================================================================
  // 7. DEPARTMENTS GENERAL / DEGREE PROGRAMS
  // =========================================================================
  if (q.includes("department") || q.includes("branch") || q.includes("programs") || q.includes("courses offered") || q.includes("intake")) {
    let ans = `### Academic Departments & Programs at BVRIT Narsapur\n\n`;
    ans += `BVRIT Narsapur offers **11 Undergraduate (B.Tech)** engineering programs, alongside postgraduate **M.Tech** and **MBA** degrees:\n\n`;
    ans += `| Dept Code | Department Name | Degree | Approved Intake |\n`;
    ans += `| :--- | :--- | :--- | :--- |\n`;
    BVRIT_DEPARTMENTS.forEach((d) => {
      ans += `| **${d.code}** | ${d.name} | ${d.degree} | ${d.intake || "60"} seats |\n`;
    });

    ans += `\n**Key Highlights:**\n`;
    ans += `• All undergraduate engineering programs are accredited by NBA Tier-I.\n`;
    ans += `• Recognized research centers affiliated with JNTU Hyderabad.\n`;
    ans += `• Choice-Based Credit System (CBCS) with multi-disciplinary electives and minors.\n`;

    return {
      answer: ans,
      category: "Departments",
      sourceTopics: ["BVRIT Departments Catalog"],
      suggestedFollowUps: [
        "Tell me about CSE Department labs",
        "Tell me about Biomedical Engineering",
        "What are the autonomous graduation requirements?",
      ],
    };
  }

  // =========================================================================
  // 8. PLACEMENTS & CAMPUS RECRUITMENT
  // =========================================================================
  if (
    q.includes("placement") ||
    q.includes("package") ||
    q.includes("highest") ||
    q.includes("average") ||
    q.includes("recruiter") ||
    q.includes("crt") ||
    q.includes("salary")
  ) {
    let ans = `### Training & Placement Cell (T&P) — BVRIT Narsapur\n\n`;
    ans += `• **Academic Year Track:** ${BVRIT_PLACEMENTS.academicYear}\n`;
    ans += `• **Highest Salary Package:** **${BVRIT_PLACEMENTS.highestPackage}**\n`;
    ans += `• **Average Salary Package:** **${BVRIT_PLACEMENTS.averagePackage}**\n`;
    ans += `• **Total Placement Offers:** **${BVRIT_PLACEMENTS.totalOffers}**\n\n`;

    ans += `**Top Marquee Recruiters:**\n`;
    ans += `${BVRIT_PLACEMENTS.topRecruiters.slice(0, 12).map((c) => `• **${c}**`).join("\n")}\n\n`;

    ans += `**Training & Career Preparation (CRT):**\n`;
    BVRIT_PLACEMENTS.trainingInitiatives.forEach((item) => {
      ans += `• ${item}\n`;
    });

    ans += `\n**T&P Contact:** Dean Placements Mr. K. Subba Raju (Office: Knowledge Centre, 3rd Floor | Email: placements@bvrit.ac.in).`;

    return {
      answer: ans,
      category: "Placements",
      sourceTopics: ["Placement Records", "Training & Placement Cell"],
      suggestedFollowUps: [
        "What internship opportunities are open right now?",
        "What is Campus Recruitment Training (CRT)?",
        "Who is the Dean of Placements?",
      ],
    };
  }

  // =========================================================================
  // 9. COLLEGE BUSES & TRANSPORT
  // =========================================================================
  if (
    q.includes("bus") ||
    q.includes("transport") ||
    q.includes("route") ||
    q.includes("kukatpally") ||
    q.includes("miyapur") ||
    q.includes("secunderabad") ||
    q.includes("patancheru") ||
    q.includes("bus timing") ||
    q.includes("bus schedule") ||
    q.includes("how to reach campus")
  ) {
    let ans = `### College Transport & Bus Network — BVRIT Narsapur\n\n`;
    ans += `BVRIT operates a dedicated fleet of **60+ GPS-tracked college buses** connecting all major hubs of Hyderabad, Secunderabad, Sangareddy, and Medak directly to the Narsapur campus.\n\n`;
    ans += `**Primary Bus Routes:**\n\n`;

    BVRIT_TRANSPORT_ROUTES.forEach((r) => {
      ans += `• **Route ${r.routeNumber} — ${r.routeName}:**\n`;
      ans += `  - *Morning Departure:* **${r.departureTime}**\n`;
      ans += `  - *Major Stops:* ${r.stops.join(" ➔ ")}\n`;
      ans += `  - *In-charge Contact:* ${r.inChargeContact}\n\n`;
    });

    ans += `**Bus Pass & Administration:**\n`;
    ans += `• Bus passes are issued semester-wise through the Transport Office near the campus bus depot.\n`;
    ans += `• **Transport Cell / Transport In-charge:** Mr. P. Nageswara Rao (Phone: +91 94400 12300 | Email: transport@bvrit.ac.in).\n`;
    ans += `• All buses depart the campus in the evening at 4:40 PM after regular class hours.`;

    return {
      answer: ans,
      category: "Transport",
      sourceTopics: ["Bus Routes & Timings", "Transport Office"],
      suggestedFollowUps: [
        "Who is the Transport In-charge?",
        "What are the hostel facilities on campus?",
        "What is the emergency ambulance contact?",
      ],
    };
  }

  // =========================================================================
  // 10. HOSTELS, ACCOMMODATION & MESS
  // =========================================================================
  if (
    q.includes("hostel") ||
    q.includes("mess") ||
    q.includes("food") ||
    q.includes("stay") ||
    q.includes("curfew") ||
    q.includes("in-time") ||
    q.includes("room") ||
    q.includes("canteen")
  ) {
    let ans = `### On-Campus Residential Hostels (Vishnu Nilayam)\n\n`;
    ans += `BVRIT provides comprehensive, safe, on-campus residential housing for over **2,500 boys and girls** across dedicated hostel complexes.\n\n`;
    ans += `**Hostel Amenities & Living Standards:**\n`;
    ans += `• **Rooms:** Well-ventilated 2-seater and 3-seater options with individual study desks, wardrobes, and high-speed campus Wi-Fi.\n`;
    ans += `• **Dining & Mess:** Hygienic modern dining halls serving nutritious vegetarian and non-vegetarian (weekly) South and North Indian meals.\n`;
    ans += `• **Hot Water & Purified Water:** 24x7 solar water heaters and multi-stage commercial RO drinking water dispensers on every floor.\n`;
    ans += `• **Recreation:** Dedicated gymnasium, indoor badminton, table tennis, carrom boards, and TV entertainment lounge.\n`;
    ans += `• **Safety & Security:** 24x7 security personnel, comprehensive CCTV coverage, biometric attendance entry, and fire safety systems.\n\n`;

    ans += `**Timings & Curfew Policy:**\n`;
    ans += `• **Girls Hostel In-Time:** 6:30 PM (Extended lab hours allowed with HOD permission).\n`;
    ans += `• **Boys Hostel In-Time:** 8:00 PM (Late library access allowed until 8:00 PM with campus ID).\n\n`;

    ans += `**Hostel Administration Contacts:**\n`;
    ans += `• Chief Warden (Boys): Prof. S. Ramakrishna (+91 94400 99801)\n`;
    ans += `• Chief Warden (Girls): Dr. M. Sravanthi (+91 94400 99802)\n`;
    ans += `• Campus Health Centre (24x7 Ambulance): +91 94400 99108`;

    return {
      answer: ans,
      category: "Living",
      sourceTopics: ["Hostels & Mess", "Student Welfare"],
      suggestedFollowUps: [
        "What are the cafeteria and food court options?",
        "What sports facilities are available on campus?",
        "What is the emergency medical contact?",
      ],
    };
  }

  // =========================================================================
  // 11. EXAM REGULATIONS, ATTENDANCE & CGPA
  // =========================================================================
  if (
    q.includes("exam") ||
    q.includes("attendance") ||
    q.includes("cgpa") ||
    q.includes("sgpa") ||
    q.includes("grade") ||
    q.includes("regulation") ||
    q.includes("detention") ||
    q.includes("revaluation") ||
    q.includes("credit")
  ) {
    let ans = `### Autonomous Academic & Examination Regulations — BVRIT\n\n`;
    ans += `BVRIT operates under the **UGC Autonomous Choice-Based Credit System (CBCS)** approved by JNTUH.\n\n`;

    BVRIT_EXAM_REGULATIONS.forEach((reg) => {
      ans += `#### ${reg.title}\n`;
      ans += `${reg.details}\n`;
      reg.rules.forEach((r) => {
        ans += `• ${r}\n`;
      });
      ans += `\n`;
    });

    ans += `**Examination Branch Office:**\n`;
    ans += `• **Controller of Examinations (CoE):** Dr. G. B. Radhika\n`;
    ans += `• **Location:** Autonomous Examination Branch, Administrative Block\n`;
    ans += `• **Email:** coe@bvrit.ac.in | **Phone:** +91 8458 222005`;

    return {
      answer: ans,
      category: "Academics",
      sourceTopics: ["Autonomous Regulations", "Examination Branch"],
      suggestedFollowUps: [
        "What is the 75% attendance rule?",
        "How is CGPA calculated?",
        "Show exam circulars on CampusHub",
      ],
    };
  }

  // =========================================================================
  // 12. AIC-BVRIT INCUBATION & RESEARCH LABS
  // =========================================================================
  if (
    q.includes("aic") ||
    q.includes("incub") ||
    q.includes("startup") ||
    q.includes("entrepreneur") ||
    q.includes("atl") ||
    q.includes("assistive") ||
    q.includes("innovation") ||
    q.includes("patent") ||
    q.includes("funding")
  ) {
    let ans = `### Atal Incubation Centre (AIC-BVRIT) & Innovation Labs\n\n`;
    ans += `**Atal Incubation Centre (AIC-BVRIT):**\n`;
    ans += `Supported by **Atal Innovation Mission (AIM), NITI Aayog**, Government of India, AIC-BVRIT is the premier tech startup incubator on campus.\n\n`;
    ans += `• **Services for Students & Faculty:**\n`;
    ans += `  - Seed grant funding and investor pitch demo days.\n`;
    ans += `  - Prototyping maker-space with 3D printers, laser engravers, PCB milling machines, and IoT sensor benches.\n`;
    ans += `  - Legal company incorporation support, trademarking, and patent filing assistance.\n`;
    ans += `  - Co-working spaces and mentorship from alumni founders.\n`;
    ans += `• **CEO:** Mr. Rajesh Gona (Email: ceo@aicbvrit.res.in | Office: AIC Hub, 2nd Floor).\n\n`;

    ans += `**Assistive Technology Lab (ATL):**\n`;
    ans += `• Located in the Biomedical Engineering Block, ATL develops globally praised assistive hardware and software for individuals with disabilities.\n`;
    ans += `• International partnerships with university research labs and healthcare NGOs across India.`;

    return {
      answer: ans,
      category: "Innovation",
      sourceTopics: ["AIC-BVRIT", "Assistive Technology Lab", "R&D"],
      suggestedFollowUps: [
        "How do faculty apply for research grants?",
        "Tell me about the Biomedical Engineering Department",
        "What are the central library timings?",
      ],
    };
  }

  // =========================================================================
  // 13. CENTRAL LIBRARY & KNOWLEDGE CENTRE
  // =========================================================================
  if (q.includes("library") || q.includes("knowledge centre") || q.includes("book") || q.includes("journal") || q.includes("ieee")) {
    const lib = BVRIT_FACILITIES.find((f) => f.category === "Academic");
    let ans = `### Dr. B.V. Raju Knowledge Centre (Central Library)\n\n`;
    ans += `• **Location:** ${lib?.location}\n`;
    ans += `• **Working Hours:** **${lib?.timings}**\n`;
    ans += `• **Collection:** Over 75,000 volumes, 12,000 distinct titles, and comprehensive national & international journals.\n\n`;

    ans += `**Digital Library & Online Access:**\n`;
    lib?.highlights.forEach((h) => {
      ans += `• ${h}\n`;
    });

    ans += `\n**Borrowing Privileges:**\n`;
    ans += `• Students can borrow up to **4 books** simultaneously for 14 days with easy renewal.\n`;
    ans += `• Faculty members can borrow up to **10 books** per semester for academic research.`;

    return {
      answer: ans,
      category: "Academic Facilities",
      sourceTopics: ["Central Library", "Digital Subscriptions"],
      suggestedFollowUps: [
        "What are the campus lab facilities?",
        "Who is the Dean of Academics?",
        "Tell me about the hostel facilities.",
      ],
    };
  }

  // =========================================================================
  // 14. STUDENT CLUBS & FESTS
  // =========================================================================
  if (q.includes("fest") || q.includes("club") || q.includes("promethean") || q.includes("sanskriti") || q.includes("event") || q.includes("sports meet")) {
    let ans = `### Student Life, Clubs & Major Annual Fests — BVRIT Narsapur\n\n`;
    ans += `BVRIT hosts vibrant student communities and national-level collegiate events throughout the academic year:\n\n`;

    BVRIT_CLUBS_AND_FESTS.forEach((item) => {
      ans += `• **${item.name}** *(${item.category})*:\n`;
      ans += `  ${item.description}\n\n`;
    });

    ans += `**Sports Complex & Athletics:**\n`;
    ans += `• Full-sized cricket ground with turf pitch, 400m athletic track, floodlit basketball & volleyball courts, and wooden indoor badminton arena.`;

    return {
      answer: ans,
      category: "Student Life",
      sourceTopics: ["Promethean", "Sanskriti", "Student Clubs"],
      suggestedFollowUps: [
        "What are the sports complex timings?",
        "Who is the Dean of Student Affairs?",
        "Tell me about BVRIT Coding Club.",
      ],
    };
  }

  // =========================================================================
  // 15. KEY CONTACTS & EMERGENCY DIRECTORY
  // =========================================================================
  if (
    q.includes("contact") ||
    q.includes("phone") ||
    q.includes("email") ||
    q.includes("principal") ||
    q.includes("dean") ||
    q.includes("emergency") ||
    q.includes("ambulance") ||
    q.includes("ragging") ||
    q.includes("women") ||
    q.includes("helpline")
  ) {
    let ans = `### Important Campus Directory & Emergency Helplines — BVRIT Narsapur\n\n`;
    ans += `| Role / Office | Name | Phone / Contact | Email |\n`;
    ans += `| :--- | :--- | :--- | :--- |\n`;

    BVRIT_KEY_CONTACTS.forEach((c) => {
      ans += `| **${c.designation}** | ${c.name} | ${c.phone || "—"} | \`${c.email}\` |\n`;
    });

    ans += `\n**🚨 Critical 24/7 Emergency Numbers:**\n`;
    ans += `• **Campus Ambulance & Health Centre:** **+91 94400 99108**\n`;
    ans += `• **Anti-Ragging Toll-Free Helpline:** **1800-180-5522** / **+91 94400 99999**\n`;
    ans += `• **Women Protection Cell (ICC):** **+91 8458 222018**\n`;
    ans += `• **Campus Main Security Gate:** **+91 8458 222099**`;

    return {
      answer: ans,
      category: "Directory",
      sourceTopics: ["Campus Contacts", "Emergency Helplines"],
      suggestedFollowUps: [
        "How do I contact the Transport In-charge?",
        "Who is the Controller of Examinations?",
        "What are the college bus routes?",
      ],
    };
  }

  // =========================================================================
  // 16. INSTITUTIONAL OVERVIEW & FOUNDER
  // =========================================================================
  if (
    q.includes("overview") ||
    q.includes("about bvrit") ||
    q.includes("about campus") ||
    q.includes("about the campus") ||
    q.includes("tell me about bvrit") ||
    q.includes("history") ||
    q.includes("founder") ||
    q.includes("chairman") ||
    q.includes("sves") ||
    q.includes("naac") ||
    q.includes("nba") ||
    q.includes("who established") ||
    q.includes("who started")
  ) {
    let ans = `### ${BVRIT_INSTITUTION_PROFILE.fullName}\n\n`;
    ans += `**${BVRIT_INSTITUTION_PROFILE.shortName}** is an esteemed engineering institution founded in **${BVRIT_INSTITUTION_PROFILE.established}** by the visionary philanthropist **${BVRIT_INSTITUTION_PROFILE.founder}** under the aegis of **${BVRIT_INSTITUTION_PROFILE.society}**.\n\n`;
    ans += `• **Leadership:** Chairman Sri K.V. Vishnu Raju; Vice Chairman Sri Ravichandran Rajagopal; Principal Dr. Sanjay Dubey.\n`;
    ans += `• **Campus:** ${BVRIT_INSTITUTION_PROFILE.campusSize}, located at ${BVRIT_INSTITUTION_PROFILE.location}.\n`;
    ans += `• **Status & Accreditations:** UGC Autonomous Institution, NAAC 'A+' Grade accredited, NBA Accredited Tier-I programs, affiliated with JNTU Hyderabad, approved by AICTE.\n`;
    ans += `• **Academic Ecosystem:** 11 B.Tech programs, M.Tech, and MBA with choice-based credit curricula.\n`;
    ans += `• **Innovation & Placements:** Host to Atal Incubation Centre (AIC-BVRIT) supported by NITI Aayog; highest packages reach ₹44+ LPA with 1,500+ placement offers annually.\n`;
    ans += `• **Official Portal:** [${BVRIT_INSTITUTION_PROFILE.officialWebsite}](${BVRIT_INSTITUTION_PROFILE.officialWebsite}) | Vedic.ai: [${BVRIT_INSTITUTION_PROFILE.vedicPortalUrl}](${BVRIT_INSTITUTION_PROFILE.vedicPortalUrl})`;

    return {
      answer: ans,
      category: "Overview",
      sourceTopics: ["BVRIT Profile", "SVES History"],
      suggestedFollowUps: [
        "What are the latest published circulars?",
        "What active opportunities are open?",
        "Show bus routes and transport facilities.",
        "What are the hostel facilities?",
      ],
    };
  }

  // =========================================================================
  // 17. FALLBACK WITH COMPREHENSIVE DIRECTORY
  // =========================================================================
  let fallback = `### CampusHub AI — BVRIT Narsapur Information\n\n`;
  fallback += `I can assist you with verified details about **B.V. Raju Institute of Technology (BVRIT), Narsapur**, as well as live platform updates.\n\n`;
  fallback += `Here are the major areas you can ask me about:\n`;
  fallback += `• **Live Circulars & Notices:** Mid-Sem schedules, academic circulars, fee notifications, and official PDFs.\n`;
  fallback += `• **Active Opportunities:** Current internships, jobs, hackathons, stipends (₹44+ LPA), and deadlines.\n`;
  fallback += `• **Course Assignments:** Pending assignments, deadlines, faculty tasks, and direct Vedic.ai submission links.\n`;
  fallback += `• **Academics & Departments:** 11 B.Tech programs (CSE, IT, AIML, AIDS, ECE, EEE, ME, Civil, Chemical, BME, PHE), M.Tech, MBA, HODs, and laboratories.\n`;
  fallback += `• **Autonomous Regulations:** CBCS credit system, 75% attendance rule, CGPA grading formulas, and revaluation.\n`;
  fallback += `• **Buses & Transport:** 60+ GPS-tracked buses covering Kukatpally, Miyapur, Secunderabad, Ameerpet, Dilsukhnagar, ECIL, Patancheru, and Medak.\n`;
  fallback += `• **Hostels & Mess:** On-campus boys and girls hostels (Vishnu Nilayam), mess food, and curfew rules.\n`;
  fallback += `• **AIC-BVRIT & Research:** Atal Incubation Centre, student startup funding, and Assistive Technology Lab (ATL).\n`;
  fallback += `• **Central Library:** Dr. B.V. Raju Knowledge Centre, 75,000+ volumes, IEEE/ACM access (8 AM – 8 PM).\n`;
  fallback += `• **Key Contacts & Helplines:** Principal, Deans, Examination Branch, and 24/7 campus ambulance (+91 94400 99108).\n\n`;
  fallback += `*Please ask any specific question or choose from the suggested prompts below:*`;

  return {
    answer: fallback,
    category: "General",
    sourceTopics: ["BVRIT Knowledge Catalog"],
    suggestedFollowUps: [
      "What are the latest published circulars?",
      "What internship opportunities are open right now?",
      "What assignments are due this week?",
      "Which college bus route goes to Kukatpally?",
    ],
  };
}

// ===========================================================================
// SUBROUTINES FOR LIVE DATA
// ===========================================================================

/**
 * Generates a unified Campus Activity Digest ("Everything" on Campus)
 */
async function generateCampusDigest(userContext?: UserAcademicContext): Promise<CampusAiAnswer> {
  try {
    const [oppsRes, circsRes, assignRes] = await Promise.all([
      getOpportunities({ pageSize: 5, deadlineFilter: "active" }),
      getCirculars({ pageSize: 5 }),
      getAssignments({ statusFilter: "all" }),
    ]);

    const activeOpps = oppsRes?.opportunities || [];
    const circulars = circsRes?.circulars || [];
    const assignments = assignRes?.assignments || [];

    let text = `### 🌟 BVRIT Campus Activity & Deadline Digest\n\n`;
    text += `Here is your unified real-time briefing across **Circulars**, **Opportunities**, and **Assignments**.\n\n`;

    // 1. Opportunities
    text += `#### 💼 Trending Opportunities (${activeOpps.length} Active):\n`;
    if (activeOpps.length === 0) {
      text += `• No active opportunities right now. Check back soon!\n\n`;
    } else {
      activeOpps.slice(0, 3).forEach((opp: any) => {
        const daysText = opp.daysRemaining !== undefined ? ` • Closes in **${opp.daysRemaining} days**` : "";
        text += `• **[${opp.title}](/opportunities/${opp.id})** at **${opp.company}** (${opp.type.toUpperCase()})\n`;
        text += `  - *Compensation:* ${opp.stipend || opp.package || "Competitive"} • *Mode:* ${opp.work_mode}${daysText}\n`;
      });
      text += `  ➔ *[Explore all opportunities on CampusHub](/opportunities)*\n\n`;
    }

    // 2. Official Circulars
    text += `#### 📢 Recent Official Circulars & Notices (${circulars.length}):\n`;
    if (circulars.length === 0) {
      text += `• No newly published circulars.\n\n`;
    } else {
      circulars.slice(0, 3).forEach((c: any) => {
        const dateStr = c.published_date ? new Date(c.published_date).toLocaleDateString() : "Recent";
        const attText = c.attachment_name ? ` 📎 *(${c.attachment_name})*` : "";
        text += `• **[${c.title}](/circulars/${c.id})**\n`;
        text += `  - *Notice No:* \`${c.circular_no}\` • *Published:* ${dateStr}${attText}\n`;
      });
      text += `  ➔ *[View all circulars on CampusHub](/circulars)*\n\n`;
    }

    // 3. Course Assignments & Vedic.ai Submissions
    text += `#### 📝 Active Assignments & Vedic.ai Reminders (${assignments.length}):\n`;
    if (assignments.length === 0) {
      text += `• No pending assignments due at this time.\n\n`;
    } else {
      assignments.slice(0, 3).forEach((a: any) => {
        const d = new Date(a.deadline);
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : a.deadline;
        text += `• **${a.subject_name} (${a.subject_code}):** ${a.title}\n`;
        text += `  - *Due Date:* **${dateStr}** • *Faculty:* ${a.faculty_name}\n`;
        if (a.submission_url) {
          text += `  - 🚀 **[Submit on Vedic.ai](${a.submission_url})**\n`;
        }
      });
      text += `  ➔ *[Review all assignments](/assignments)*\n\n`;
    }

    text += `*Tap any item to view complete details on CampusHub.*`;

    return {
      answer: text,
      category: "Live Digest",
      sourceTopics: ["Live Circulars", "Active Opportunities", "Assignments"],
      suggestedFollowUps: [
        "What are the latest published circulars?",
        "Show internship opportunities",
        "What assignments are due this week?",
        "Tell me about BVRIT placements",
      ],
    };
  } catch (err) {
    console.error("Failed to build campus digest:", err);
    return {
      answer: "Unable to retrieve live campus digest at this moment. Please check the individual Circulars, Opportunities, and Assignments tabs.",
      category: "Error",
      sourceTopics: [],
      suggestedFollowUps: ["What are the latest circulars?", "What opportunities are open?"],
    };
  }
}

/**
 * Queries live circulars from CampusHub store
 */
async function queryLiveCirculars(q: string, userContext?: UserAcademicContext): Promise<CampusAiAnswer> {
  try {
    const res = await getCirculars({ pageSize: 6 });
    let circulars = res?.circulars || [];

    // Filter if specific department is mentioned
    const deptMatch = findDepartmentMatch(q);
    if (deptMatch) {
      circulars = circulars.filter(
        (c: any) =>
          (c.department || "").toLowerCase() === "all" ||
          (c.department || "").toLowerCase() === deptMatch.code.toLowerCase()
      );
    }

    if (circulars.length === 0) {
      return {
        answer: `There are currently no published circulars matching your query. Please visit the **[Circulars Page](/circulars)** for the full official notice board.`,
        category: "Circulars",
        sourceTopics: ["Campus Circulars"],
        suggestedFollowUps: [
          "What are the autonomous exam regulations?",
          "What opportunities are open?",
          "Show my assignments",
        ],
      };
    }

    let text = `### 📢 Official Circulars & Campus Notices\n\n`;
    text += `Found **${circulars.length}** official circulars relevant to your query:\n\n`;

    circulars.forEach((c: any) => {
      const pubDate = c.published_date ? new Date(c.published_date).toLocaleDateString() : "Recent";
      const dept = c.department || "All";
      const targetAudience =
        dept.toLowerCase() === "all"
          ? "All Departments"
          : `${dept} Year ${c.year || "All"} Sec ${c.section || "All"}`;

      text += `#### [${c.title}](/circulars/${c.id})\n`;
      text += `• **Notice Number:** \`${c.circular_no}\`\n`;
      text += `• **Published Date:** ${pubDate} | **Target Audience:** ${targetAudience}\n`;
      if (c.deadline) {
        const d = new Date(c.deadline);
        text += `• **Important Deadline:** ${!isNaN(d.getTime()) ? d.toLocaleDateString() : c.deadline}\n`;
      }
      if (c.attachment_name) {
        text += `• **Attachment:** 📎 [Download ${c.attachment_name}](${c.attachment_url || "#"}) (${c.attachment_size || "PDF"})\n`;
      }
      text += `• **Signatory:** ${c.signatory || c.posted_by_name || "College Administration"}\n\n`;
    });

    text += `*Click on any circular title to open the complete reading page with official PDF attachments.*`;

    return {
      answer: text,
      category: "Circulars",
      sourceTopics: ["Official Notice Board", "Academic Circulars"],
      suggestedFollowUps: [
        "What are the autonomous exam regulations?",
        "What assignments are due soon?",
        "Show live campus digest",
      ],
    };
  } catch (err) {
    console.error("Failed to query live circulars:", err);
    return {
      answer: "Unable to retrieve live circulars right now. Please visit the **[Circulars Page](/circulars)** directly.",
      category: "Circulars",
      sourceTopics: [],
      suggestedFollowUps: ["Tell me about BVRIT placements", "Show college bus routes"],
    };
  }
}

/**
 * Queries live opportunities (internships, jobs, hackathons)
 */
async function queryLiveOpportunities(q: string, userContext?: UserAcademicContext): Promise<CampusAiAnswer> {
  try {
    let typeFilter: string | undefined = undefined;
    if (q.includes("internship")) typeFilter = "internship";
    else if (q.includes("hackathon")) typeFilter = "hackathon";
    else if (q.includes("job") || q.includes("full-time")) typeFilter = "full-time";

    const res = await getOpportunities({ pageSize: 6, type: typeFilter, deadlineFilter: "active" });
    const opps = res?.opportunities || [];

    if (opps.length === 0) {
      return {
        answer: `There are currently no active opportunities matching your query. Explore all archived or upcoming opportunities on the **[Opportunities Page](/opportunities)**.`,
        category: "Opportunities",
        sourceTopics: ["Career Opportunities"],
        suggestedFollowUps: [
          "What are the BVRIT placement records?",
          "What is Campus Recruitment Training (CRT)?",
          "What circulars are published?",
        ],
      };
    }

    let text = `### 💼 Active Campus Opportunities (${opps.length} Openings)\n\n`;
    text += `Here are the active internships, full-time roles, and hackathons currently available:\n\n`;

    opps.forEach((opp: any) => {
      const typeBadge = opp.type.toUpperCase();
      const comp = opp.stipend || opp.package || "Competitive Stipend";
      const daysText = opp.daysRemaining !== undefined ? ` (Closes in **${opp.daysRemaining} days**)` : "";

      text += `#### [${opp.title}](/opportunities/${opp.id}) — **${opp.company}**\n`;
      text += `• **Role Type:** \`${typeBadge}\` | **Work Mode:** ${opp.work_mode} (${opp.location})\n`;
      text += `• **Compensation:** **${comp}**\n`;
      if (opp.deadline) {
        const d = new Date(opp.deadline);
        text += `• **Application Deadline:** ${!isNaN(d.getTime()) ? d.toLocaleDateString() : opp.deadline}${daysText}\n`;
      }
      if (opp.skills && opp.skills.length > 0) {
        text += `• **Key Skills:** ${opp.skills.slice(0, 5).join(", ")}\n`;
      }
      text += `• **Application Link:** [View & Prepare on CampusHub](/opportunities/${opp.id})\n\n`;
    });

    text += `*Tip: On each opportunity page, use CampusHub's **"Prepare & Apply"** modal to copy your verified contact and academic info before applying!*`;

    return {
      answer: text,
      category: "Opportunities",
      sourceTopics: ["Career Hub", "Verified Postings"],
      suggestedFollowUps: [
        "What are the top placement statistics at BVRIT?",
        "What is Campus Recruitment Training (CRT)?",
        "Show my pending assignments",
      ],
    };
  } catch (err) {
    console.error("Failed to query live opportunities:", err);
    return {
      answer: "Unable to retrieve live opportunities right now. Please explore the **[Opportunities Page](/opportunities)** directly.",
      category: "Opportunities",
      sourceTopics: [],
      suggestedFollowUps: ["Tell me about BVRIT placements", "Show college bus routes"],
    };
  }
}

/**
 * Queries live assignments & Vedic.ai reminders
 */
async function queryLiveAssignments(q: string, userContext?: UserAcademicContext): Promise<CampusAiAnswer> {
  try {
    const res = await getAssignments({ statusFilter: "all" });
    const assignments = res?.assignments || [];

    if (assignments.length === 0) {
      return {
        answer: `You currently have no pending assignment reminders on CampusHub. You can also check your official course submissions on **[Vedic.ai](https://vedicai.student.edwisely.com/)**.`,
        category: "Assignments",
        sourceTopics: ["Course Assignments"],
        suggestedFollowUps: [
          "What circulars are published?",
          "What opportunities are open?",
          "How does Vedic.ai work?",
        ],
      };
    }

    let text = `### 📝 Course Assignments & Vedic.ai Submissions\n\n`;
    text += `Found **${assignments.length}** active assignment reminders:\n\n`;

    assignments.forEach((a: any) => {
      const d = new Date(a.deadline);
      const dateFormatted = !isNaN(d.getTime()) ? d.toLocaleDateString() : a.deadline;

      text += `#### **${a.subject_name} (${a.subject_code})**\n`;
      text += `**${a.title}**\n`;
      text += `• **Due Deadline:** **${dateFormatted}**\n`;
      text += `• **Faculty In-charge:** ${a.faculty_name || "Department Faculty"}\n`;
      if (a.max_marks) {
        text += `• **Evaluation:** Max ${a.max_marks} marks\n`;
      }
      if (a.attachment_name) {
        text += `• **Question Sheet:** 📎 [Download ${a.attachment_name}](${a.attachment_url || "#"})\n`;
      }
      if (a.submission_url) {
        text += `• 🚀 **[Submit Directly on Vedic.ai](${a.submission_url})**\n`;
      }
      text += `\n`;
    });

    text += `*Remember: All assignment evaluations and attendance tracking are officially recorded on **[Vedic.ai](https://vedicai.student.edwisely.com/)**.*`;

    return {
      answer: text,
      category: "Assignments",
      sourceTopics: ["Vedic.ai Portal", "Assignment Reminders"],
      suggestedFollowUps: [
        "What are the latest published circulars?",
        "What is the 75% attendance rule?",
        "Show active opportunities",
      ],
    };
  } catch (err) {
    console.error("Failed to query live assignments:", err);
    return {
      answer: "Unable to retrieve assignments right now. Please view the **[Assignments Page](/assignments)** directly.",
      category: "Assignments",
      sourceTopics: [],
      suggestedFollowUps: ["Show latest circulars", "Tell me about BVRIT placements"],
    };
  }
}

/**
 * Helper to match specific department keywords safely without colliding with English stop words
 */
function findDepartmentMatch(query: string): CampusDepartment | null {
  const q = query.toLowerCase();

  if (q.includes("biomedical") || q.includes("bio medical") || /\bbme\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "BME") || null;
  }
  if (q.includes("pharmaceutical") || q.includes("pharma") || /\bphe\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "PHE") || null;
  }
  if (q.includes("computer science") || /\bcse\b/.test(q) || q.includes("cse department") || q.includes("cse labs")) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "CSE") || null;
  }
  if (q.includes("information tech") || /\bit dept\b/.test(q) || /\bit department\b/.test(q) || /\bb\.?tech it\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "IT") || null;
  }
  if (q.includes("artificial intell") || q.includes("machine learn") || /\baiml\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "AIML") || null;
  }
  if (q.includes("data science") || /\baids\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "AIDS") || null;
  }
  if (q.includes("electronics") || q.includes("communication") || /\bece\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "ECE") || null;
  }
  if (q.includes("electrical") || /\beee\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "EEE") || null;
  }
  if (q.includes("mechanical") || /\bmech\b/.test(q) || /\bme dept\b/.test(q) || /\bme branch\b/.test(q) || /\bb\.?tech me\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "ME") || null;
  }
  if (q.includes("civil") || /\bce dept\b/.test(q) || /\bce branch\b/.test(q) || /\bb\.?tech ce\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "CE") || null;
  }
  if (q.includes("chemical") || /\bche dept\b/.test(q) || /\bche branch\b/.test(q)) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "CHE") || null;
  }
  if (q.includes("business administration") || /\bmba\b/.test(q) || q.includes("management studies")) {
    return BVRIT_DEPARTMENTS.find((d) => d.code === "MBA") || null;
  }

  return null;
}
