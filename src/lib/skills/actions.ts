"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { SkillCategory, StudentSkill } from "@/types/database";
import { updateApplicationProfile } from "@/lib/profile/actions";
import { updateStudentMatchingProfile } from "@/lib/matching/actions";

// In-memory student skills store for development / mock environments
let inMemorySkills: Record<string, StudentSkill[]> = {
  "demo-student-id": [
    { id: "sk-1", student_id: "demo-student-id", skill_name: "Python", skill_category: "Programming Language", created_at: new Date().toISOString() },
    { id: "sk-2", student_id: "demo-student-id", skill_name: "TypeScript", skill_category: "Programming Language", created_at: new Date().toISOString() },
    { id: "sk-3", student_id: "demo-student-id", skill_name: "React", skill_category: "Frontend", created_at: new Date().toISOString() },
    { id: "sk-4", student_id: "demo-student-id", skill_name: "Next.js", skill_category: "Frontend", created_at: new Date().toISOString() },
    { id: "sk-5", student_id: "demo-student-id", skill_name: "Node.js", skill_category: "Backend", created_at: new Date().toISOString() },
    { id: "sk-6", student_id: "demo-student-id", skill_name: "PostgreSQL", skill_category: "Database", created_at: new Date().toISOString() },
    { id: "sk-7", student_id: "demo-student-id", skill_name: "AWS", skill_category: "Cloud", created_at: new Date().toISOString() },
    { id: "sk-8", student_id: "demo-student-id", skill_name: "Data Structures", skill_category: "Other", created_at: new Date().toISOString() },
    { id: "sk-9", student_id: "demo-student-id", skill_name: "Algorithms", skill_category: "Other", created_at: new Date().toISOString() },
  ],
};

/**
 * Fetch all skills for current student
 */
export async function getStudentSkills(): Promise<StudentSkill[]> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from("student_skills")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true });

      if (data && !error) {
        return data as StudentSkill[];
      }
    }
  } catch (err) {
    console.error("Failed to query live student_skills table:", err);
  }

  return inMemorySkills[studentId] || [];
}

/**
 * Add a skill to the student's normalized career profile
 * Enforces uniqueness and category
 */
export async function addStudentSkill(
  skillName: string,
  skillCategory: SkillCategory
): Promise<{ success: boolean; skill?: StudentSkill; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";
  const cleanName = skillName.trim();

  if (!cleanName) {
    return { success: false, error: "Skill name cannot be empty." };
  }

  // Check duplicate in memory first
  const currentSkills = await getStudentSkills();
  const exists = currentSkills.some(
    (s) => s.skill_name.toLowerCase() === cleanName.toLowerCase()
  );
  if (exists) {
    return { success: false, error: `Skill "${cleanName}" is already added.` };
  }

  const newSkill: StudentSkill = {
    id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    student_id: studentId,
    skill_name: cleanName,
    skill_category: skillCategory,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      const { data, error } = await (supabase as any)
        .from("student_skills")
        .insert({
          student_id: studentId,
          skill_name: cleanName,
          skill_category: skillCategory,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505" || error.message.includes("unique")) {
          return { success: false, error: `Skill "${cleanName}" is already in your profile.` };
        }
        console.error("Supabase insert skill error:", error);
      } else if (data) {
        newSkill.id = data.id;
      }
    }
  } catch (err) {
    console.error("Live DB skill insert error:", err);
  }

  // Update in-memory
  if (!inMemorySkills[studentId]) inMemorySkills[studentId] = [];
  inMemorySkills[studentId].push(newSkill);

  // Sync to matching engine profile
  await syncSkillsToMatchingAndApplicationProfiles(studentId);

  return { success: true, skill: newSkill };
}

/**
 * Remove a skill from the student's normalized career profile
 */
export async function removeStudentSkill(
  skillIdOrName: string
): Promise<{ success: boolean; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      await (supabase as any)
        .from("student_skills")
        .delete()
        .eq("student_id", studentId)
        .or(`id.eq.${skillIdOrName},skill_name.ilike.${skillIdOrName}`);
    }
  } catch (err) {
    console.error("Live DB skill delete error:", err);
  }

  // Update in-memory
  if (inMemorySkills[studentId]) {
    inMemorySkills[studentId] = inMemorySkills[studentId].filter(
      (s) =>
        s.id !== skillIdOrName &&
        s.skill_name.toLowerCase() !== skillIdOrName.toLowerCase()
    );
  }

  // Sync to matching engine profile
  await syncSkillsToMatchingAndApplicationProfiles(studentId);

  return { success: true };
}

/**
 * Bulk save skills (used during registration or profile batch save)
 */
export async function saveStudentSkillsBulk(
  skills: { skill_name: string; skill_category: SkillCategory }[]
): Promise<{ success: boolean; skills: StudentSkill[] }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const saved: StudentSkill[] = [];
  for (const item of skills) {
    const res = await addStudentSkill(item.skill_name, item.skill_category);
    if (res.success && res.skill) {
      saved.push(res.skill);
    }
  }

  return { success: true, skills: saved };
}

/**
 * Validates and updates student's CGPA
 */
export async function updateStudentCgpa(
  cgpa: number | null
): Promise<{ success: boolean; cgpa?: number | null; error?: string }> {
  if (cgpa !== null && cgpa !== undefined) {
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return { success: false, error: "CGPA must be a valid number between 0.00 and 10.00." };
    }
  }

  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      await (supabase as any)
        .from("profiles")
        .update({ current_cgpa: cgpa, updated_at: new Date().toISOString() })
        .eq("id", studentId);
    }
  } catch (err) {
    console.error("Live DB CGPA update error:", err);
  }

  // Sync to application profile & matching profile
  await updateApplicationProfile({ cgpa });
  await updateStudentMatchingProfile({ cgpa });

  return { success: true, cgpa };
}

/**
 * Helper to sync normalized student_skills array to matching engine and application profile
 */
async function syncSkillsToMatchingAndApplicationProfiles(studentId: string) {
  try {
    const all = inMemorySkills[studentId] || [];
    const skillNames = all.map((s) => s.skill_name);
    const languages = all
      .filter((s) => s.skill_category === "Programming Language")
      .map((s) => s.skill_name);
    const techSkills = all
      .filter((s) => s.skill_category !== "Programming Language")
      .map((s) => s.skill_name);

    await updateStudentMatchingProfile({ skills: skillNames });
    await updateApplicationProfile({
      programming_languages: languages,
      technical_skills: techSkills,
    });
  } catch (err) {
    console.error("Failed to sync skills across profile stores:", err);
  }
}
