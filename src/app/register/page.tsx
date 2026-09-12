"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle2,
  Code,
  Award,
  Plus,
  X,
  Search,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { registerUser } from "@/lib/auth/actions";
import { saveStudentSkillsBulk } from "@/lib/skills/actions";
import { STANDARD_SKILLS, SKILL_CATEGORIES, searchSkills, StandardSkill } from "@/lib/skills/catalog";
import { SkillCategory } from "@/types/database";

const departments = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "CSM", label: "CSE - AI & Machine Learning (CSM)" },
  { value: "CSD", label: "CSE - Data Science (CSD)" },
  { value: "AIDS", label: "Artificial Intelligence & Data Science (AIDS)" },
  { value: "DS", label: "Data Science (DS)" },
  { value: "ECE", label: "Electronics & Communication Engineering (ECE)" },
  { value: "EEE", label: "Electrical & Electronics Engineering (EEE)" },
  { value: "MECH", label: "Mechanical Engineering (MECH)" },
  { value: "CIVIL", label: "Civil Engineering (CIVIL)" },
  { value: "PHE", label: "Pharmaceutical Engineering (PHE)" },
  { value: "IT", label: "Information Technology (IT)" },
];

const years = [
  { value: "1", label: "1st Year (Freshman)" },
  { value: "2", label: "2nd Year (Sophomore)" },
  { value: "3", label: "3rd Year (Junior)" },
  { value: "4", label: "4th Year (Senior)" },
];

const sections = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
  { value: "E", label: "Section E" },
  { value: "F", label: "Section F" },
  { value: "G", label: "Section G" },
  { value: "H", label: "Section H" },
  { value: "I", label: "Section I" },
];

export default function RegisterPage() {
  const router = useRouter();

  // Multi-step: 1 = Basic Info, 2 = Academic Profile, 3 = Skills
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  // Step 1: Basic Information
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Step 2: Academic Profile
  const [department, setDepartment] = React.useState("CSE");
  const [year, setYear] = React.useState("3");
  const [section, setSection] = React.useState("A");
  const [cgpa, setCgpa] = React.useState("");

  // Step 3: Skills (Optional)
  const [selectedSkills, setSelectedSkills] = React.useState<
    { skill_name: string; skill_category: SkillCategory }[]
  >([
    { skill_name: "Python", skill_category: "Programming Language" },
    { skill_name: "React", skill_category: "Frontend" },
  ]);
  const [skillSearchQuery, setSkillSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SkillCategory | "All">("All");
  const [customSkillName, setCustomSkillName] = React.useState("");
  const [customSkillCategory, setCustomSkillCategory] = React.useState<SkillCategory>("Programming Language");
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // State & Feedback
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Clear specific field errors
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters.";
    }
    if (!email.trim()) {
      errs.email = "Institutional email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email format.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!department) {
      errs.department = "Department is required.";
    }
    if (!year) {
      errs.year = "Academic year is required.";
    }
    if (!section) {
      errs.section = "Section is required.";
    }
    if (cgpa.trim()) {
      const parsed = parseFloat(cgpa);
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        errs.cgpa = "CGPA must be a valid number between 0.00 and 10.00.";
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Move to Next Step
  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  // Move to Previous Step
  const handlePrev = () => {
    setError("");
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  // Skill Selection Handlers
  const handleToggleSkill = (skill: StandardSkill) => {
    const exists = selectedSkills.some(
      (s) => s.skill_name.toLowerCase() === skill.name.toLowerCase()
    );
    if (exists) {
      setSelectedSkills((prev) =>
        prev.filter((s) => s.skill_name.toLowerCase() !== skill.name.toLowerCase())
      );
    } else {
      setSelectedSkills((prev) => [
        ...prev,
        { skill_name: skill.name, skill_category: skill.category },
      ]);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.filter((s) => s.skill_name.toLowerCase() !== skillName.toLowerCase())
    );
  };

  const handleAddCustomSkill = () => {
    const clean = customSkillName.trim();
    if (!clean) return;
    const exists = selectedSkills.some(
      (s) => s.skill_name.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      setSelectedSkills((prev) => [
        ...prev,
        { skill_name: clean, skill_category: customSkillCategory },
      ]);
    }
    setCustomSkillName("");
    setShowCustomInput(false);
  };

  // Filter skills for picker
  const filteredSkills = searchSkills(skillSearchQuery, selectedCategory);

  // Submit Registration
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setLoading(true);

    const parsedCgpa = cgpa.trim() ? parseFloat(cgpa) : null;
    const parsedYear = parseInt(year, 10);

    try {
      const res = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        departmentId: department,
        year: parsedYear,
        section,
        cgpa: parsedCgpa !== null && !isNaN(parsedCgpa) ? parsedCgpa : null,
        skills: selectedSkills,
      });

      if (!res.success) {
        setError(res.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      // Save skills in background / store
      if (selectedSkills.length > 0) {
        try {
          await saveStudentSkillsBulk(selectedSkills);
        } catch (err) {
          console.error("Skills bulk save warning:", err);
        }
      }

      router.push(res.redirectUrl || "/dashboard");
    } catch {
      setError("A connection error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F6] dark:bg-[#131418] text-[#1A1D20] dark:text-[#F4EBE9] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Brand & Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1D20] dark:text-[#F4EBE9]">
          Create Student Profile <span className="text-[#F59E0B]">✦</span>
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Join CampusHub to discover verified opportunities, track circulars, and match with campus roles.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        <Card className="shadow-xs border-[#F0E4E2] dark:border-[#2B2C35] bg-white dark:bg-[#1A1D20]">
          {/* Multi-Step Progress Indicator */}
          <div className="px-4 sm:px-6 pt-5 pb-3 border-b border-[#F0E4E2] dark:border-[#2B2C35]">
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold mb-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`text-left p-2 rounded-xl transition-colors ${
                  currentStep === 1
                    ? "text-[#F59E0B] bg-[#FFF0EE] dark:bg-[#F59E0B]/15 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase">Step 1</div>
                <div className="truncate">Basic Info</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className={`text-left p-2 rounded-xl transition-colors ${
                  currentStep === 2
                    ? "text-[#F59E0B] bg-[#FFF0EE] dark:bg-[#F59E0B]/15 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase">Step 2</div>
                <div className="truncate">Dept &amp; CGPA</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1() && validateStep2()) setCurrentStep(3);
                }}
                className={`text-left p-2 rounded-xl transition-colors ${
                  currentStep === 3
                    ? "text-[#F59E0B] bg-[#FFF0EE] dark:bg-[#F59E0B]/15 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase">Step 3</div>
                <div className="truncate">Skills (AI Match)</div>
              </button>
            </div>

            {/* Visual Step Bar */}
            <div className="w-full bg-[#F0E4E2] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#F59E0B] h-full transition-all duration-300"
                style={{
                  width: currentStep === 1 ? "33.3%" : currentStep === 2 ? "66.6%" : "100%",
                }}
              />
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 1: BASIC INFORMATION */}
            {/* ============================================================ */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="pb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Personal & Account Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your name, institutional email, and secure password.
                  </p>
                </div>

                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  placeholder="e.g. Alex Johnson"
                  leftIcon={<User className="h-4 w-4" />}
                  error={fieldErrors.fullName}
                  required
                />

                <Input
                  label="College Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  placeholder="student@college.edu"
                  leftIcon={<Mail className="h-4 w-4" />}
                  helperText="Your official institutional email address."
                  error={fieldErrors.email}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  placeholder="At least 6 characters"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={fieldErrors.password}
                  required
                />

                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="For urgent placement and campus deadline notifications."
                />

                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Next Steps:</strong> You will enter your <strong>Cumulative CGPA</strong> and select your <strong>Technical Skills</strong> in Steps 2 &amp; 3 to activate instant AI Opportunity Matching!
                  </span>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Dept &amp; CGPA &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: ACADEMIC PROFILE */}
            {/* ============================================================ */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="pb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Academic Cohort &amp; Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    This determines targeted circulars, assignments, and opportunity eligibility.
                  </p>
                </div>

                <Select
                  label="Department / Branch"
                  options={departments}
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    clearFieldError("department");
                  }}
                  error={fieldErrors.department}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Current Academic Year"
                    options={years}
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      clearFieldError("year");
                    }}
                    error={fieldErrors.year}
                  />

                  <Select
                    label="Class Section"
                    options={sections}
                    value={section}
                    onChange={(e) => {
                      setSection(e.target.value);
                      clearFieldError("section");
                    }}
                    error={fieldErrors.section}
                  />
                </div>

                {/* CGPA Container with Prominent Highlight */}
                <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Cumulative CGPA &amp; Academic Standing
                    </span>
                    <Badge variant="blue" size="sm">Scale 0.00 – 10.00</Badge>
                  </div>
                  <Input
                    label="Current Cumulative CGPA (Optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => {
                      setCgpa(e.target.value);
                      clearFieldError("cgpa");
                    }}
                    placeholder="e.g. 8.45"
                    leftIcon={<Award className="h-4 w-4 text-indigo-600" />}
                    helperText="Validated on a 0.00 to 10.00 scale. Company cutoffs use this as a baseline while AI matching is 70% driven by your skills."
                    error={fieldErrors.cgpa}
                  />
                </div>

                <div className="pt-3 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="min-h-[44px]"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Skills (AI Match) &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: SKILLS (OPTIONAL) */}
            {/* ============================================================ */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Known Programming Languages &amp; Technical Skills
                    </h3>
                    <Badge variant="purple" size="sm">70% Match Weight</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your skills to activate instant AI opportunity matching. Your skills heavily drive placement recommendations!
                  </p>
                </div>

                {/* Popular Placement Skills Quick-Add Row */}
                <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    🔥 Popular for BVRIT Campus Placements (Tap to add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", "Docker", "Machine Learning"].map((sName) => {
                      const isSelected = selectedSkills.some(
                        (s) => s.skill_name.toLowerCase() === sName.toLowerCase()
                      );
                      return (
                        <button
                          key={sName}
                          type="button"
                          onClick={() => {
                            const found = STANDARD_SKILLS.find(
                              (x) => x.name.toLowerCase() === sName.toLowerCase()
                            );
                            if (found) {
                              handleToggleSkill(found);
                            } else {
                              handleToggleSkill({ name: sName, category: "Tools" as any });
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs font-semibold"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {sName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Selected Skills Chips */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-[60px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Selected Skills ({selectedSkills.length})
                    </span>
                    {selectedSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSkills([])}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {selectedSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No skills selected yet. Tap tags below to add.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((s) => (
                        <span
                          key={s.skill_name}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                        >
                          <span>{s.skill_name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s.skill_name)}
                            className="min-h-[24px] min-w-[24px] inline-flex items-center justify-center text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white rounded-full"
                            aria-label={`Remove ${s.skill_name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search & Category Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      placeholder="Search skills (e.g. Python, React, AWS)..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
                    />
                  </div>

                  {/* Category Filter Pills (Touch Friendly) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("All")}
                      className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
                        selectedCategory === "All"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {SKILL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Skill Tags Grid */}
                <div className="max-h-44 overflow-y-auto p-1 space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSkills.map((item) => {
                      const isSelected = selectedSkills.some(
                        (s) => s.skill_name.toLowerCase() === item.name.toLowerCase()
                      );
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleToggleSkill(item)}
                          className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400"
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 text-slate-400" />}
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Skill Option */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 min-h-[44px]"
                    >
                      <Plus className="h-3.5 w-3.5" /> Can't find your skill? Add a custom skill
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Add Custom Skill
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={customSkillName}
                          onChange={(e) => setCustomSkillName(e.target.value)}
                          placeholder="e.g. Solidity, Flutter"
                          className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[44px]"
                        />
                        <select
                          value={customSkillCategory}
                          onChange={(e) => setCustomSkillCategory(e.target.value as SkillCategory)}
                          className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[44px]"
                        >
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCustomInput(false)}
                          className="text-xs min-h-[44px]"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddCustomSkill}
                          className="text-xs min-h-[44px] bg-blue-600 text-white"
                        >
                          Add Skill
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Step Actions */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={loading}
                    className="min-h-[44px]"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleSubmit()}
                      disabled={loading}
                      className="min-h-[44px] text-xs text-slate-500"
                    >
                      Skip for now
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={loading}
                      className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      rightIcon={<CheckCircle2 className="h-4 w-4" />}
                    >
                      {loading ? "Creating Profile..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-center text-xs">
            <span className="text-slate-500">Already registered? </span>
            <Link href="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-500">
              Sign in to your account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
