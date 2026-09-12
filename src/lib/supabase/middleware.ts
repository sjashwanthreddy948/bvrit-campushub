import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/types/database";

const SESSION_COOKIE_NAME = "campushub_session";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const path = request.nextUrl.pathname;

  // Static assets & api bypass
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".") ||
    path === "/favicon.ico"
  ) {
    return response;
  }

  // Check custom session cookie first
  const customSessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let sessionUser: { id: string; email: string; role: UserRole; fullName: string } | null = null;

  if (customSessionCookie?.value) {
    try {
      sessionUser = JSON.parse(customSessionCookie.value);
    } catch {
      sessionUser = null;
    }
  }

  // Also check Supabase SSR auth if live credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !sessionUser &&
    supabaseUrl &&
    !supabaseUrl.includes("placeholder") &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes("placeholder")
  ) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      sessionUser = {
        id: user.id,
        email: user.email || "",
        role: (user.user_metadata?.role as UserRole) || "student",
        fullName: user.user_metadata?.full_name || "Campus User",
      };
    }
  }

  // Protected Route Checks
  const isStudentRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/opportunities") ||
    path.startsWith("/saved") ||
    path.startsWith("/applications") ||
    path.startsWith("/circulars") ||
    path.startsWith("/assignments") ||
    path.startsWith("/notifications") ||
    path.startsWith("/search") ||
    path.startsWith("/profile");

  const isFacultyRoute = path.startsWith("/faculty");
  const isAdminRoute = path.startsWith("/admin");
  const isCoordinatorRoute = path.startsWith("/coordinator");
  const isHodRoute = path.startsWith("/hod");
  const isAuthRoute = path === "/login" || path === "/register";

  const isDevPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder");

  // 1. If trying to access Faculty route
  if (isFacultyRoute) {
    if (sessionUser && sessionUser.role !== "faculty" && sessionUser.role !== "admin") {
      if (isDevPlaceholder) {
        const facultyUser = {
          id: "usr-faculty-demo",
          email: "faculty@college.edu",
          fullName: "Prof. K. Sharma",
          role: "faculty" as UserRole,
        };
        response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(facultyUser), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. If trying to access Admin route
  if (isAdminRoute) {
    if (sessionUser && sessionUser.role !== "admin") {
      if (isDevPlaceholder) {
        const adminUser = {
          id: "usr-admin-demo",
          email: "admin@college.edu",
          fullName: "Dean / Admin Office",
          role: "admin" as UserRole,
        };
        response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(adminUser), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = sessionUser.role === "faculty" ? "/faculty/dashboard" : "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. If trying to access Coordinator route
  if (isCoordinatorRoute) {
    if (sessionUser && sessionUser.role !== "coordinator" && sessionUser.role !== "admin") {
      if (isDevPlaceholder) {
        const coordUser = {
          id: "usr-coordinator-demo",
          email: "coordinator@college.edu",
          fullName: "Dr. Lakshmi (Placement Coordinator)",
          role: "coordinator" as UserRole,
        };
        response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(coordUser), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    }
  }

  // 4. If trying to access HOD route
  if (isHodRoute) {
    if (sessionUser && sessionUser.role !== "hod" && sessionUser.role !== "admin") {
      if (isDevPlaceholder) {
        const hodUser = {
          id: "usr-hod-demo",
          email: "hod.cse@college.edu",
          fullName: "Dr. Ramesh (HOD - CSE)",
          role: "hod" as UserRole,
        };
        response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(hodUser), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
