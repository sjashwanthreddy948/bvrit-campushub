/**
 * B.V. Raju Institute of Technology (BVRIT), Narsapur
 * Comprehensive Institutional Knowledge Base
 * 
 * Location: Vishnupur, Narsapur, Medak District, Telangana - 502313
 * Society: Sri Vishnu Educational Society (SVES)
 * Established: 1997 | Status: UGC Autonomous, NAAC 'A+' Grade, NBA Accredited
 * Affiliation: Jawaharlal Nehru Technological University Hyderabad (JNTUH)
 */

export interface CampusDepartment {
  code: string;
  name: string;
  established: number;
  degree: "B.Tech" | "M.Tech" | "MBA";
  hod: string;
  intake?: number;
  description: string;
  keyLabs: string[];
}

export interface BusRoute {
  routeNumber: number;
  routeName: string;
  stops: string[];
  departureTime: string;
  inChargeContact: string;
}

export interface KeyContact {
  designation: string;
  name: string;
  officeLocation: string;
  email: string;
  phone?: string;
  roleDescription: string;
}

export interface CampusFacility {
  name: string;
  category: "Academic" | "Innovation" | "Living" | "Sports" | "Dining" | "Healthcare" | "Banking";
  location: string;
  timings: string;
  description: string;
  highlights: string[];
}

export interface PlacementStats {
  academicYear: string;
  highestPackage: string;
  averagePackage: string;
  totalOffers: string;
  topRecruiters: string[];
  trainingInitiatives: string[];
}

export interface ExamRegulation {
  title: string;
  details: string;
  rules: string[];
}

export const BVRIT_INSTITUTION_PROFILE = {
  fullName: "B.V. Raju Institute of Technology (BVRIT)",
  shortName: "BVRIT Narsapur",
  society: "Sri Vishnu Educational Society (SVES)",
  founder: "Late Padma Bhushan Dr. B.V. Raju",
  chairman: "Sri K.V. Vishnu Raju",
  viceChairman: "Sri Ravichandran Rajagopal",
  established: 1997,
  campusSize: "110 Acres (Lush Green Eco-Friendly Campus)",
  location: "Vishnupur, Narsapur, Medak District, Telangana - 502313",
  status: "UGC Autonomous Institution",
  affiliation: "Affiliated with Jawaharlal Nehru Technological University Hyderabad (JNTUH)",
  approvals: "Approved by All India Council for Technical Education (AICTE), New Delhi",
  accreditation: "NAAC Accredited with 'A+' Grade | NBA Accredited Tier-I Programs",
  nirfStatus: "Ranked among top engineering institutions in Telangana and national NIRF band",
  motto: "Knowledge, Character, and Wisdom for Global Leadership",
  vedicPortalUrl: "https://vedicai.student.edwisely.com/",
  officialWebsite: "https://bvrit.ac.in",
};

export const BVRIT_DEPARTMENTS: CampusDepartment[] = [
  {
    code: "CSE",
    name: "Computer Science and Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. K. Dasaradha Ramaiah",
    intake: 360,
    description: "The flagship computing department focused on Algorithms, Software Systems, Cloud Computing, and Scalable Architectures. Accredited by NBA.",
    keyLabs: ["Advanced Java Lab", "Cloud Computing Lab", "Open Source Software Lab", "Data Structures Lab", "Full Stack Development Lab"],
  },
  {
    code: "IT",
    name: "Information Technology",
    established: 1999,
    degree: "B.Tech",
    hod: "Dr. G. Shanthi",
    intake: 180,
    description: "Specialized program in Internet technologies, Mobile computing, Cyber Security, and Enterprise Software Systems.",
    keyLabs: ["Web Technologies Lab", "Information Security Lab", "Network Programming Lab", "Mobile App Development Lab"],
  },
  {
    code: "AIML",
    name: "CSE (Artificial Intelligence and Machine Learning)",
    established: 2020,
    degree: "B.Tech",
    hod: "Dr. A. Charan Kumari",
    intake: 180,
    description: "Cutting-edge curriculum in Deep Learning, Natural Language Processing, Computer Vision, and Generative AI systems.",
    keyLabs: ["AI and Deep Learning Lab", "GPU Accelerated Computing Lab", "Cognitive Systems Lab", "NLP & Vision Lab"],
  },
  {
    code: "AIDS",
    name: "CSE (Data Science)",
    established: 2020,
    degree: "B.Tech",
    hod: "Dr. P. Madhavi",
    intake: 120,
    description: "Focused on Big Data Analytics, Statistical Modeling, Machine Learning pipelines, and Business Intelligence.",
    keyLabs: ["Big Data Analytics Lab", "Data Mining & Visualization Lab", "Python & R Data Science Lab"],
  },
  {
    code: "ECE",
    name: "Electronics and Communication Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. J. Naga Vishnu Vardhan",
    intake: 240,
    description: "Renowned department specializing in VLSI Design, Embedded Systems, IoT, Microwave Communication, and Signal Processing.",
    keyLabs: ["VLSI Design Lab", "Embedded Systems & IoT Lab", "Digital Signal Processing Lab", "Microwave & Optical Lab"],
  },
  {
    code: "EEE",
    name: "Electrical and Electronics Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. Ch. Sunil Kumar",
    intake: 120,
    description: "Excellence in Power Systems, Renewable Solar/Wind Energy, Electric Vehicle (EV) Powertrains, and Industrial Automation.",
    keyLabs: ["Power Electronics Lab", "Electric Drives Lab", "Renewable Energy Research Lab", "PLC & SCADA Automation Lab"],
  },
  {
    code: "ME",
    name: "Mechanical Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. V. Murali Krishna",
    intake: 60,
    description: "Comprehensive mechanical education in CAD/CAM, Robotics, Thermal Engineering, Automotive Technology, and 3D Rapid Prototyping.",
    keyLabs: ["CAD/CAM Centre", "Robotics & CNC Machining Lab", "Thermal & Heat Transfer Lab", "Additive Manufacturing Lab"],
  },
  {
    code: "CE",
    name: "Civil Engineering",
    established: 2010,
    degree: "B.Tech",
    hod: "Dr. M. Vasudeva Naidu",
    intake: 60,
    description: "Structural Engineering, Environmental Engineering, Geotechnical Soil Analysis, and Smart Infrastructure Design.",
    keyLabs: ["Strength of Materials Lab", "Geotechnical Engineering Lab", "Environmental Engineering Lab", "GIS & Surveying Lab"],
  },
  {
    code: "CHE",
    name: "Chemical Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. P. S. V. Ramana Rao",
    intake: 60,
    description: "Pioneer program in Process Design, Petrochemicals, Reaction Engineering, and Industrial Pollution Abatement.",
    keyLabs: ["Mass Transfer Lab", "Heat Transfer Operations Lab", "Chemical Reaction Engineering Lab", "Process Instrumentation Lab"],
  },
  {
    code: "BME",
    name: "Biomedical Engineering",
    established: 1997,
    degree: "B.Tech",
    hod: "Dr. M. Sridevi",
    intake: 60,
    description: "Pioneering Biomedical program in Telangana, bridging Medical Instrumentation, Healthcare Electronics, Hospital internships, Assistive Devices, and Medical Imaging.",
    keyLabs: ["Biomedical Instrumentation Lab", "Medical Imaging Lab", "Assistive Technology Lab (ATL)", "Biosignal Processing Lab"],
  },
  {
    code: "PHE",
    name: "Pharmaceutical Engineering",
    established: 2007,
    degree: "B.Tech",
    hod: "Dr. B. K. Satyanarayana",
    intake: 60,
    description: "Unique interdisciplinary engineering curriculum integrating Drug Formulation, Bioprocessing, and Pharmaceutical Plant Automation.",
    keyLabs: ["Pharmaceutical Technology Lab", "Bioanalytical Chemistry Lab", "Microbiology & Fermentation Lab"],
  },
  {
    code: "MBA",
    name: "Department of Management Studies",
    established: 2006,
    degree: "MBA",
    hod: "Dr. K. Srinivas Rao",
    intake: 60,
    description: "Postgraduate business administration program offering dual specializations in Finance, Marketing, HR, and Business Analytics.",
    keyLabs: ["Business Analytics Lab", "Management Simulation Lab"],
  },
];

export const BVRIT_FACILITIES: CampusFacility[] = [
  {
    name: "Dr. B.V. Raju Knowledge Centre (Central Library)",
    category: "Academic",
    location: "Knowledge Centre Building (Near Administrative Block)",
    timings: "8:00 AM – 8:00 PM (Monday to Saturday); 9:00 AM – 2:00 PM (Sundays & Holidays)",
    description: "State-of-the-art air-conditioned multi-story central library spanning 35,000+ sq.ft with over 75,000 volumes, 12,000 titles, and national/international print and e-journals.",
    highlights: [
      "Digital Library with 60 high-speed multimedia systems",
      "Subscriptions to IEEE Xplore, ACM Digital Library, Springer, Elsevier ScienceDirect, ASCE, ASME",
      "DELNET, NPTEL video course servers, and NDLI (National Digital Library) access",
      "Dedicated reference section, quiet study reading halls, and dissertation archive",
    ],
  },
  {
    name: "Atal Incubation Centre (AIC-BVRIT)",
    category: "Innovation",
    location: "Vishnu Innovation Centre, 2nd Floor",
    timings: "9:00 AM – 7:00 PM",
    description: "Flagship startup incubator established with support from Atal Innovation Mission (AIM), NITI Aayog, Government of India. AIC-BVRIT nurtures tech entrepreneurship among students, faculty, and grassroots innovators.",
    highlights: [
      "Seed funding and investor demo day access",
      "Rapid prototyping fabrication lab with 3D printers, laser cutters, and electronics workstations",
      "One-on-one mentorship from industry veterans, patent filing support, and legal advisory",
      "Over 40+ startups incubated across IoT, AgriTech, HealthTech, and AI",
    ],
  },
  {
    name: "Assistive Technology Lab (ATL)",
    category: "Innovation",
    location: "Biomedical Engineering Block, Ground Floor",
    timings: "9:00 AM – 5:30 PM",
    description: "World-recognized research lab developed in collaboration with international universities, dedicated to creating affordable assistive technologies and mobility aids for individuals with special needs.",
    highlights: [
      "Student-led research on smart wheelchairs, voice-activated prosthetics, and sensory aids",
      "Global collaborative workshops and international design patents",
      "Direct deployment to rehabilitation centres and NGOs across India",
    ],
  },
  {
    name: "Student Hostels (Vishnu Nilayam)",
    category: "Living",
    location: "On-Campus (Separate Boys Hostels & Girls Hostels)",
    timings: "Open 24/7 (In-time: 6:30 PM for Girls, 8:00 PM for Boys with warden permission for labs)",
    description: "Spacious, hygienic on-campus residential accommodation for over 2,500 students with round-the-clock security, resident wardens, and high-speed campus Wi-Fi.",
    highlights: [
      "Hygienic multi-cuisine dining hall serving nutritious South and North Indian meals",
      "Continuous solar hot water system and RO purified drinking water stations on each floor",
      "Modern indoor gymnasium, indoor sports room (Table Tennis, Carrom, Chess), and TV lounge",
      "24/7 CCTV surveillance, biometric attendance, and resident warden support",
    ],
  },
  {
    name: "Sports Complex & Athletic Stadium",
    category: "Sports",
    location: "Eastern Campus Zone",
    timings: "6:00 AM – 8:30 AM & 4:30 PM – 7:00 PM",
    description: "Expansive multi-sport grounds supporting competitive tournaments, physical fitness, and annual national sports fests like the Vishnu Trophy.",
    highlights: [
      "Full-sized cricket ground with turf pitch and spectator pavilions",
      "400-meter standard athletic track and football stadium",
      "Floodlit basketball courts, volleyball courts, and tennis courts",
      "Indoor sports arena with four wooden badminton courts and fitness gym",
    ],
  },
  {
    name: "Campus Health Centre & 24/7 Ambulance",
    category: "Healthcare",
    location: "Near Main Gate & Girls Hostel Block",
    timings: "24 Hours / 7 Days a Week",
    description: "Dedicated primary healthcare facility providing immediate medical attention, first aid, routine consultations, and emergency patient transport.",
    highlights: [
      "Resident Medical Officer (RMO) and qualified nursing staff on campus",
      "Essential pharmacy medicines, observation beds, oxygen support, and ECG facilities",
      "24/7 on-campus ambulance with priority hospital tie-up at Narsapur and Hyderabad",
      "Annual health and dental screening drives for all students and faculty",
    ],
  },
  {
    name: "Cafeteria, Food Court & Nescafe Hub",
    category: "Dining",
    location: "Central Student Amenities Building",
    timings: "7:30 AM – 8:30 PM",
    description: "Vibrant dining hub offering affordable, hygienic breakfast, south/north Indian meals, fast foods, beverages, and bakery items.",
    highlights: [
      "Main college cafeteria serving breakfast, thalis, biryanis, and snacks",
      "Nescafe kiosk serving hot coffees, teas, smoothies, and ice creams",
      "Bakery corner with fresh sandwiches, cakes, and quick snacks",
      "Spacious shaded open-air seating for student discussions and group study",
    ],
  },
  {
    name: "State Bank of India (SBI) Branch & 24/7 ATM",
    category: "Banking",
    location: "Near Campus Main Entrance",
    timings: "Branch: 10:00 AM – 4:00 PM (Weekdays); ATM: 24/7",
    description: "Full-service on-campus branch of State Bank of India catering to student fee payments, accounts, educational loans, and instant cash withdrawals.",
    highlights: [
      "Zero-balance student savings account opening facility",
      "Educational loan facilitation and scholarship disbursement desk",
      "24-hour ATM kiosk for cash withdrawals and mini-statements",
    ],
  },
];

export const BVRIT_TRANSPORT_ROUTES: BusRoute[] = [
  {
    routeNumber: 1,
    routeName: "Kukatpally / JNTU / Miyapur Express",
    stops: ["KPHB Colony", "JNTU Main Gate", "Nizampet X Roads", "Miyapur Allwyn X Road", "Madeenaguda", "Chanda Nagar", "BVRIT Campus"],
    departureTime: "7:15 AM",
    inChargeContact: "+91 94400 12301",
  },
  {
    routeNumber: 2,
    routeName: "Secunderabad / Balanagar / Jeedimetla Route",
    stops: ["Secunderabad Station", "Paradise", "Bowenpally", "Ferozguda", "Balanagar", "Shapur Nagar", "Chintal", "Gandi Maisamma", "Narsapur", "BVRIT"],
    departureTime: "6:50 AM",
    inChargeContact: "+91 94400 12302",
  },
  {
    routeNumber: 3,
    routeName: "Dilsukhnagar / Mehdipatnam / Ameerpet",
    stops: ["Dilsukhnagar", "Malakpet", "Koti", "Lakdikapul", "Mehdipatnam", "Punjagutta", "Ameerpet", "SR Nagar", "Moosapet", "BVRIT"],
    departureTime: "6:40 AM",
    inChargeContact: "+91 94400 12303",
  },
  {
    routeNumber: 4,
    routeName: "ECIL / Alwal / Kompally Route",
    stops: ["ECIL X Roads", "Neredmet", "Tirumalagiri", "Alwal", "Suchitra", "Kompally", "Medchal Checkpost", "Gundlapochampally", "BVRIT"],
    departureTime: "6:45 AM",
    inChargeContact: "+91 94400 12304",
  },
  {
    routeNumber: 5,
    routeName: "Patancheru / BHEL / Sangareddy Route",
    stops: ["Sangareddy Old Bus Stand", "Patancheru", "RC Puram", "BHEL", "Beeramguda", "Muthangi", "Gummadidala", "Narsapur", "BVRIT"],
    departureTime: "7:20 AM",
    inChargeContact: "+91 94400 12305",
  },
  {
    routeNumber: 6,
    routeName: "Medak Town / Shivampet Route",
    stops: ["Medak Bus Depot", "Ramayampet", "Shivampet", "Tupakula", "Narsapur Bus Stand", "BVRIT Campus"],
    departureTime: "7:30 AM",
    inChargeContact: "+91 94400 12306",
  },
];

export const BVRIT_PLACEMENTS: PlacementStats = {
  academicYear: "2024–2025 (Ongoing & Recent Batches)",
  highestPackage: "₹44.14 LPA (Offered by Amazon & Top Tech Giants)",
  averagePackage: "₹6.20 LPA across B.Tech branches",
  totalOffers: "1,500+ Campus Placement Offers",
  topRecruiters: [
    "Amazon",
    "Microsoft",
    "Adobe",
    "Qualcomm",
    "TCS (Ninja & Digital)",
    "Cognizant",
    "Infosys",
    "Capgemini",
    "Virtusa",
    "Accenture",
    "Tech Mahindra",
    "Darwinbox",
    "ValueLabs",
    "Optum",
    "Modak Analytics",
    "L&T Technology Services",
  ],
  trainingInitiatives: [
    "Campus Recruitment Training (CRT) starting from 2nd year B.Tech",
    "Data Structures, Competitive Coding, and LeetCode problem solving workshops",
    "Specialized faculty and student training by VEDIC (Vishnu Educational Development and Innovation Centre)",
    "Mock technical interviews, group discussions, and resume clinics led by industry alumni",
    "Mandatory 6-8 week summer industry internships",
  ],
};

export const BVRIT_EXAM_REGULATIONS: ExamRegulation[] = [
  {
    title: "Autonomous Choice-Based Credit System (CBCS)",
    details: "BVRIT follows the UGC autonomous credit framework with continuous internal evaluation and semester-end examinations.",
    rules: [
      "Total credits required for award of B.Tech Degree: 160 Credits",
      "Continuous Internal Evaluation (CIE) weightage: 40% (Mid-terms, quizzes, Vedic.ai assignments, lab continuous evaluation)",
      "Semester End Examination (SEE) weightage: 60%",
      "Mandatory capstone project, mini-projects, and industrial summer internship",
    ],
  },
  {
    title: "Attendance & Condonation Rules",
    details: "Attendance is tracked systematically on a daily basis via institutional attendance registers and digital portals.",
    rules: [
      "Minimum required aggregate attendance: 75% in the semester",
      "Condonation between 65% and 75% on genuine medical grounds (valid medical certificate submitted within 3 days and condonation fee)",
      "Students with below 65% aggregate attendance are strictly DETAINED (Detention) and not eligible to write semester-end examinations",
      "Must repeat the semester when offered next",
    ],
  },
  {
    title: "Grading System & CGPA Calculation",
    details: "10-point absolute grading scale according to autonomous UGC/JNTUH standards.",
    rules: [
      "O (Outstanding): 10 Grade Points (Marks >= 90%)",
      "A+ (Excellent): 9 Grade Points (Marks 80-89%)",
      "A (Very Good): 8 Grade Points (Marks 70-79%)",
      "B+ (Good): 7 Grade Points (Marks 60-69%)",
      "B (Above Average): 6 Grade Points (Marks 50-59%)",
      "C (Pass): 5 Grade Points (Marks 40-49%)",
      "F (Fail): 0 Grade Points (Marks < 40% or absent)",
      "CGPA = Sum of (Course Credits × Grade Points) / Total Registered Credits",
    ],
  },
  {
    title: "Revaluation & Supplementary Examinations",
    details: "Autonomous Controller of Examinations (CoE) facilitates challenge evaluation and rapid supplementary exams.",
    rules: [
      "Revaluation applications must be submitted within 10 days of results declaration",
      "Fee for revaluation: Stated on circular per subject via college portal",
      "Supplementary exams conducted at the end of even/odd semesters to prevent academic backlog delays",
    ],
  },
];

export const BVRIT_KEY_CONTACTS: KeyContact[] = [
  {
    designation: "Principal",
    name: "Dr. Sanjay Dubey",
    officeLocation: "Administrative Block, 1st Floor",
    email: "principal@bvrit.ac.in",
    phone: "+91 8458 222000",
    roleDescription: "Chief Institutional Executive, overseeing academic governance, statutory accreditations, and overall campus administration.",
  },
  {
    designation: "Dean, Academics",
    name: "Dr. K. V. N. Srinivasa Rao",
    officeLocation: "Administrative Block, 2nd Floor",
    email: "dean.academics@bvrit.ac.in",
    phone: "+91 8458 222002",
    roleDescription: "Manages autonomous academic regulations, curriculum design, academic calendar, and faculty workload coordination.",
  },
  {
    designation: "Dean, Student Affairs",
    name: "Dr. P. Rajendra Prasad",
    officeLocation: "Student Welfare Centre, Ground Floor",
    email: "dean.studentaffairs@bvrit.ac.in",
    phone: "+91 8458 222004",
    roleDescription: "Oversees student welfare, cultural clubs, anti-ragging compliance, annual fests, and student discipline.",
  },
  {
    designation: "Controller of Examinations (CoE)",
    name: "Dr. G. B. Radhika",
    officeLocation: "Autonomous Examination Branch, Administrative Block",
    email: "coe@bvrit.ac.in",
    phone: "+91 8458 222005",
    roleDescription: "Responsible for autonomous timetable scheduling, conduct of mid-term & semester exams, evaluation, and grade card issuance.",
  },
  {
    designation: "Dean, Training & Placement (T&P)",
    name: "Mr. K. Subba Raju",
    officeLocation: "T&P Cell, Knowledge Centre Building, 3rd Floor",
    email: "placements@bvrit.ac.in",
    phone: "+91 8458 222010",
    roleDescription: "Leads campus recruitments, corporate partnerships, industry internships, and student CRT training.",
  },
  {
    designation: "CEO, Atal Incubation Centre (AIC-BVRIT)",
    name: "Mr. Rajesh Gona",
    officeLocation: "AIC-BVRIT Hub, 2nd Floor",
    email: "ceo@aicbvrit.res.in",
    phone: "+91 8458 222050",
    roleDescription: "Directs startup incubation, grants, prototyping support, and innovation commercialization.",
  },
  {
    designation: "Chief Warden (Boys Hostels)",
    name: "Prof. S. Ramakrishna",
    officeLocation: "Vishnu Nilayam Block A Office",
    email: "boyshostel@bvrit.ac.in",
    phone: "+91 94400 99801",
    roleDescription: "Manages boys hostel allocations, mess quality, room maintenance, and night security.",
  },
  {
    designation: "Chief Warden (Girls Hostels)",
    name: "Dr. M. Sravanthi",
    officeLocation: "Vishnu Nilayam Block C Office",
    email: "girlshostel@bvrit.ac.in",
    phone: "+91 94400 99802",
    roleDescription: "Manages girls hostel allocations, student safety, mess coordination, and medical assistance.",
  },
  {
    designation: "Transport In-charge",
    name: "Mr. P. Nageswara Rao",
    officeLocation: "Transport Depot Office (Near Bus Parking)",
    email: "transport@bvrit.ac.in",
    phone: "+91 94400 12300",
    roleDescription: "Coordinates 60+ college bus routes, route schedules, bus passes, and student driver support.",
  },
  {
    designation: "Anti-Ragging Committee & Helpline",
    name: "Autonomous Anti-Ragging Flying Squad",
    officeLocation: "Security Control & Student Affairs Office",
    email: "antiragging@bvrit.ac.in",
    phone: "1800-180-5522 (National Toll Free) / +91 94400 99999",
    roleDescription: "Zero-tolerance anti-ragging monitoring squad ensuring safe, harassment-free campus life.",
  },
  {
    designation: "Women Protection & Internal Complaints Cell (ICC)",
    name: "Dr. K. Sujatha (Presiding Officer)",
    officeLocation: "Administrative Block, Room 108",
    email: "icc@bvrit.ac.in",
    phone: "+91 8458 222018",
    roleDescription: "Grievance redressal cell ensuring safety, dignity, and gender equality across campus.",
  },
  {
    designation: "Campus Medical Centre & Ambulance",
    name: "Resident Medical Officer (Dr. K. Anitha)",
    officeLocation: "Health Centre Building",
    email: "healthcentre@bvrit.ac.in",
    phone: "+91 94400 99108 (24/7 Emergency Ambulance)",
    roleDescription: "Immediate medical emergency response, doctor consultations, and hospital referral transport.",
  },
];

export const BVRIT_CLUBS_AND_FESTS = [
  {
    name: "Promethean (Annual National Technical Symposium)",
    category: "Technical Fest",
    description: "The flagship national-level technical festival of BVRIT featuring 50+ inter-college competitions: Hackathons, Paper Presentations, Robo-Wars, Code-A-Thons, and Circuit Debugging. Held annually in February/March.",
  },
  {
    name: "Sanskriti (Annual Cultural Extravaganza)",
    category: "Cultural Fest",
    description: "Two-day grand cultural festival celebrating arts, music, dance, fashion showcases, and celebrity musical concerts. Draws thousands of participants from engineering colleges across Telangana.",
  },
  {
    name: "Vishnu Trophy (National Sports Meet)",
    category: "Sports Fest",
    description: "Inter-collegiate sports tournament with tournaments in Cricket, Basketball, Volleyball, Tennis, Athletics, and Badminton.",
  },
  {
    name: "BVRIT Coding Club (CodeHub)",
    category: "Student Club",
    description: "Active student community organizing weekly algorithm contests, competitive programming bootcamps on Codeforces and LeetCode, and open-source hackathons.",
  },
  {
    name: "IEEE Student Branch (BVRIT STB)",
    category: "Student Chapter",
    description: "One of the most active IEEE student branches in Hyderabad Section conducting tech seminars, humanitarian technology challenges, and WIE (Women in Engineering) initiatives.",
  },
  {
    name: "V-Clicks (Photography & Cinematography Club)",
    category: "Creative Club",
    description: "The official media and visual storytelling club documenting campus life, fests, film competitions, and photography exhibitions.",
  },
  {
    name: "NSS & UBA (National Service Scheme & Unnat Bharat Abhiyan)",
    category: "Social Outreach",
    description: "Community development wing organizing blood donation camps, village digital literacy drives around Narsapur, tree plantation drives, and social health awareness.",
  },
];

export const BVRIT_QUICK_CATEGORIES = [
  {
    id: "academics",
    label: "Academics & Departments",
    icon: "GraduationCap",
    summary: "11+ B.Tech programs, M.Tech, MBA, HODs, laboratories, and intake.",
    sampleQueries: [
      "Tell me about the CSE Department and its labs.",
      "What B.Tech programs are offered at BVRIT?",
      "Who is the HOD of ECE and what are their specializations?",
      "What is the Biomedical Engineering program at BVRIT?",
    ],
  },
  {
    id: "placements",
    label: "Placements & Careers",
    icon: "Briefcase",
    summary: "Highest packages (₹44+ LPA), average package, top recruiters, and CRT training.",
    sampleQueries: [
      "What is the highest package at BVRIT Narsapur?",
      "Which top companies recruit from BVRIT?",
      "What is Campus Recruitment Training (CRT)?",
      "What is the average package across branches?",
    ],
  },
  {
    id: "transport",
    label: "Buses & Transport",
    icon: "Bus",
    summary: "60+ GPS college buses covering Kukatpally, Miyapur, Secunderabad, Medak, etc.",
    sampleQueries: [
      "Which bus route goes to Kukatpally and Miyapur?",
      "What are the morning bus timings?",
      "How do I contact the Transport In-charge?",
      "Are buses available from Secunderabad and Dilsukhnagar?",
    ],
  },
  {
    id: "hostels",
    label: "Hostels & Dining",
    icon: "Home",
    summary: "Separate Boys & Girls hostels, mess timings, gym, solar water, and cafeterias.",
    sampleQueries: [
      "What are the hostel facilities and mess timings?",
      "What are the hostel curfew and in-time rules?",
      "Tell me about the on-campus cafeterias and food court.",
      "Who are the hostel wardens and how do I contact them?",
    ],
  },
  {
    id: "exams",
    label: "Exam Branch & Regulations",
    icon: "FileCheck",
    summary: "Autonomous CBCS, 75% attendance rule, CGPA calculation, and revaluation.",
    sampleQueries: [
      "What is the minimum attendance required at BVRIT?",
      "How is SGPA and CGPA calculated in autonomous regulations?",
      "What are the detention rules?",
      "How does revaluation and supplementary exam work?",
    ],
  },
  {
    id: "innovation",
    label: "AIC-BVRIT & Research Labs",
    icon: "Lightbulb",
    summary: "Atal Incubation Centre, Assistive Technology Lab (ATL), funding, and prototyping.",
    sampleQueries: [
      "What is AIC-BVRIT and how can students incubate a startup?",
      "Tell me about the Assistive Technology Lab (ATL).",
      "What Centers of Excellence are available on campus?",
      "How can faculty get research grants and seed funding?",
    ],
  },
  {
    id: "library",
    label: "Library & Knowledge Centre",
    icon: "BookOpen",
    summary: "Dr. B.V. Raju Knowledge Centre, 75,000+ volumes, IEEE subscriptions, and timings.",
    sampleQueries: [
      "What are the library timings and digital library facilities?",
      "Does BVRIT have access to IEEE Xplore and ACM digital library?",
      "How many books can a student borrow from the library?",
    ],
  },
  {
    id: "contacts",
    label: "Emergency & Directory",
    icon: "PhoneCall",
    summary: "Principal office, Deans, Examination Branch, Anti-Ragging helpline, and 24/7 Ambulance.",
    sampleQueries: [
      "What is the 24/7 campus emergency ambulance contact?",
      "What is the Anti-Ragging toll-free helpline number?",
      "How do I contact the Principal or Dean Academics?",
      "Who is the Controller of Examinations?",
    ],
  },
  {
    id: "circulars",
    label: "Circulars & Notices",
    icon: "FileText",
    summary: "Live published notices, exam notifications, and campus circulars with attachments.",
    sampleQueries: [
      "What are the latest published circulars?",
      "Show exam schedule circulars",
      "Are there any circulars for CSE department?",
    ],
  },
  {
    id: "opportunities",
    label: "Active Opportunities",
    icon: "Briefcase",
    summary: "Live internships, full-time jobs, hackathons, stipends, and application deadlines.",
    sampleQueries: [
      "What internship opportunities are open right now?",
      "Are there any Amazon or tech opportunities?",
      "Show hackathons and coding opportunities",
    ],
  },
  {
    id: "assignments",
    label: "Assignments & Vedic.ai",
    icon: "BookOpen",
    summary: "Active course assignments, submission deadlines, and direct Vedic.ai portal links.",
    sampleQueries: [
      "What assignments are due this week?",
      "Show Operating Systems assignment details",
      "Where do I submit my assignments on Vedic.ai?",
    ],
  },
  {
    id: "digest",
    label: "Campus Activity Digest",
    icon: "Sparkles",
    summary: "Unified summary of urgent deadlines, closing opportunities, and new announcements.",
    sampleQueries: [
      "Give me a full campus activity digest",
      "What are all the upcoming deadlines on campus?",
      "What's new on campus today?",
    ],
  },
];
