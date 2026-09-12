"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AuthResponse, AuthUser, LoginFormData, RegisterFormData } from "@/types/auth";
import { UserRole } from "@/types/database";

const SESSION_COOKIE_NAME = "campushub_session";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server-side validation for registration
 */
function validateRegistration(data: RegisterFormData): string | null {
  if (!data.fullName || data.fullName.trim().length < 2) {
    return "Full name must be at least 2 characters long.";
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    return "Please provide a valid institutional email address.";
  }
  if (!data.password || data.password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!data.departmentId) {
    return "Please select your academic department.";
  }
  if (!data.year || data.year < 1 || data.year > 5) {
    return "Please select a valid academic year.";
  }
  if (!data.section || data.section.trim().length === 0) {
    return "Please select your class section.";
  }
  if (data.cgpa !== undefined && data.cgpa !== null) {
    if (isNaN(data.cgpa) || data.cgpa < 0 || data.cgpa > 10) {
      return "Current CGPA must be a valid number between 0.00 and 10.00.";
    }
  }
  return null;
}

/**
 * Server-side validation for login
 */
function validateLogin(data: LoginFormData): string | null {
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!data.password || data.password.length === 0) {
    return "Password cannot be empty.";
  }
  return null;
}

/**
 * Helper to determine redirect route according to user role
 */
export async function getRedirectForRole(role: UserRole): Promise<string> {
  switch (role) {
    case "coordinator":
      return "/coordinator/dashboard";
    case "hod":
      return "/hod/dashboard";
    case "faculty":
      return "/faculty/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "student":
    default:
      return "/dashboard";
  }
}

/**
 * Register User Server Action
 * STRICT RULE: Self-registration can NEVER grant 'admin' role.
 */
export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  // 1. Validate on server
  const validationError = validateRegistration(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const email = data.email.trim().toLowerCase();
  const role: UserRole = "student"; // STRICT: Always student on registration

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check if live Supabase is configured
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      // Real Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            role: "student",
            department_id: data.departmentId,
            year: data.year,
            section: data.section,
            phone: data.phone?.trim() || null,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") || authError.message.includes("exists")) {
          return { success: false, error: "An account with this email address already exists. Please sign in." };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "Failed to create user account. Please try again." };
      }
    }

    // Prepare auth user
    const authUser: AuthUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      email,
      fullName: data.fullName.trim(),
      role: "student",
      profile: {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        full_name: data.fullName.trim(),
        email,
        phone: data.phone || null,
        role: "student",
        department_id: data.departmentId,
        year: data.year,
        section: data.section,
        current_cgpa: data.cgpa ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    // Safely write session cookie if inside request context
    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(authUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } catch {
      // Running outside Next.js request context (e.g. test scripts)
    }

    return {
      success: true,
      redirectUrl: "/dashboard",
      user: authUser,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected registration error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Login User Server Action
 */
export async function loginUser(data: LoginFormData): Promise<AuthResponse> {
  // 1. Validate on server
  const validationError = validateLogin(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const email = data.email.trim().toLowerCase();
  const password = data.password;

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    let role: UserRole = "student";
    let fullName = "Campus User";
    let userId = "usr-" + Math.random().toString(36).substring(2, 9);

    if (isLiveSupabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: "Invalid email or password. Please check your credentials." };
      }

      if (authData.user) {
        userId = authData.user.id;
        // Fetch role from profiles table
        const { data: profileResult } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", authData.user.id)
          .single();

        const profile = profileResult as { role?: UserRole; full_name?: string } | null;
        if (profile?.role) {
          role = profile.role;
          fullName = profile.full_name || fullName;
        }
      }
    } else {
      // Intelligent fallback for development & local testing
      if (email.includes("admin")) {
        role = "admin";
        fullName = "Dean / Admin Office";
      } else if (email.includes("coordinator") || email.includes("tpo") || email.includes("placement")) {
        role = "coordinator";
        fullName = "Dr. Lakshmi (Placement Coordinator)";
      } else if (email.includes("faculty")) {
        role = "faculty";
        fullName = "Prof. K. Sharma";
      } else {
        role = "student";
        fullName = email.split("@")[0].replace(".", " ");
        fullName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
      }
    }

    const redirectUrl = await getRedirectForRole(role);

    const authUser: AuthUser = {
      id: userId,
      email,
      fullName,
      role,
    };

    // Safely write session cookie if inside request context
    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(authUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } catch {
      // Running outside Next.js request context (e.g. test scripts)
    }

    return {
      success: true,
      redirectUrl,
      user: authUser,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected login error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Logout User Server Action
 */
export async function logoutUser(): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut().catch(() => {});

    try {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch {
      // outside request context
    }

    return { success: true, redirectUrl: "/login" };
  } catch {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch {
      // outside request context
    }
    return { success: true, redirectUrl: "/login" };
  }
}

/**
 * Get current session user from server cookies
 */
export async function getCurrentSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const user = JSON.parse(sessionCookie.value) as AuthUser;
    return user;
  } catch {
    return null;
  }
}

/**
 * Switch active role session for instant previewing
 */
export async function switchRole(role: UserRole): Promise<{ success: boolean; redirectUrl: string; user: AuthUser }> {
  let email = "student@college.edu";
  let fullName = "Alex Johnson";
  if (role === "faculty") {
    email = "faculty@college.edu";
    fullName = "Prof. K. Sharma";
  } else if (role === "coordinator") {
    email = "coordinator@college.edu";
    fullName = "Dr. Lakshmi (Placement Coordinator)";
  } else if (role === "admin") {
    email = "admin@college.edu";
    fullName = "Dean / Admin Office";
  } else if (role === "hod") {
    email = "hod.cse@college.edu";
    fullName = "Dr. Ramesh (HOD - CSE)";
  }

  const authUser: AuthUser = {
    id: `usr-${role}-demo`,
    email,
    fullName,
    role,
  };

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(authUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {}

  const redirectUrl = await getRedirectForRole(role);
  return { success: true, redirectUrl, user: authUser };
}
