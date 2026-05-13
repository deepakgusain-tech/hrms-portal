import { NextResponse } from "next/server";

import { auth } from "@/auth";

const employeeAllowedPaths = [
  "/employee-dashboard",
  "/employee-profiles",
  "/department",
  "/job-roles",
  "/work-location",
  "/employee-documents",
  "/attendance",
  "/leave-requests",
  "/transfer-promotion",
];

type AuthenticatedRequest = {
  nextUrl: {
    pathname: string;
  };
  url: string;
  auth?: {
    user?: {
      id?: string | null;
      role?: string | null;
    };
  } | null;
};

export default auth((req: AuthenticatedRequest) => {
  const pathname = req.nextUrl.pathname;
  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname === "/employee-dashboard" ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/module") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/employers") ||
    pathname.startsWith("/employee-profiles") ||
    pathname.startsWith("/employee-documents") ||
    pathname.startsWith("/department") ||
    pathname.startsWith("/job-roles") ||
    pathname.startsWith("/work-location") ||
    pathname.startsWith("/transfer-promotion") ||
    pathname.startsWith("/leave-requests") ||
    pathname.startsWith("/attendance");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    req.auth.user.role?.toLowerCase() === "employee" &&
    !employeeAllowedPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/employee-dashboard", req.url));
  }

  if (
    req.auth.user.role?.toLowerCase() === "employer" &&
    pathname !== "/dashboard"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard",
    "/employee-dashboard",
    "/users/:path*",
    "/roles/:path*",
    "/module/:path*",
    "/companies/:path*",
    "/employers/:path*",
    "/employee-profiles/:path*",
    "/employee-documents/:path*",
    "/department/:path*",
    "/job-roles/:path*",
    "/work-location/:path*",
    "/transfer-promotion/:path*",
    "/leave-requests/:path*",
    "/attendance/:path*",
  ],
};
