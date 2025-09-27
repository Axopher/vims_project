// vims_project/frontend/src/config/routesConfig.js

import React from "react";
import {
  Users,
  Home,
  IdCard,
  BookOpen,
  Calculator,
  BookOpenCheck,
  UserCheck,
  TimerIcon,
} from "lucide-react";

/**
 * Master route list (single source of truth).
 *
 * Each route entry:
 *  - key: unique key used internally
 *  - path: relative path under /:role/
 *  - component: React.lazy component
 *  - label: text to show in the sidebar (null => hidden)
 *  - allowedRoles: array of roles (strings in lowercase) that can access this route
 *                  use ["*"] to allow all authenticated roles (useful for 'unauthorized' page)
 *  - permissions: optional array of permission strings required to access (empty or omitted = no permission check)
 *
 * Note: role names should be normalized lowercase across your backend/client.
 */

// lazy imports — keeps bundles small
const StudentsPage = React.lazy(() => import("../pages/StudentsPage"));
const CoursesPage = React.lazy(() => import("../pages/CoursesPage"));
const EmployeesPage = React.lazy(() => import("../pages/EmployeesPage"));
const FinancePage = React.lazy(() => import("../pages/FinancePage"));
const CourseDetail = React.lazy(
  () => import("../features/courses/CourseDetail"),
);
const EmployeeDetail = React.lazy(
  () => import("../features/employees/EmployeeDetail"),
);
const StudentDetail = React.lazy(
  () => import("../features/students/StudentDetail"),
);
const RoleDashboardIndex = React.lazy(
  () => import("../pages/RoleDashboardIndex"),
);
const ClassesPage = React.lazy(() => import("../pages/ClassesPage"));
const TermsPage = React.lazy(() => import("../pages/TermsPage"));
const EnrollmentsPage = React.lazy(() => import("../pages/EnrollmentsPage"));
const NotAuthorizedPage = React.lazy(
  () => import("../pages/NotAuthorizedPage"),
);

const norm = (r) => (r ? r.toLowerCase() : "");

export const routesConfig = {
  dashboard: {
    path: "dashboard",
    component: RoleDashboardIndex,
    label: "Overview",
    icon: Home,
    allowedRoles: [
      "director",
      "instructor",
      "student",
      "accountant",
      "tenant_admin",
    ],
  },
  employees: {
    path: "employees",
    component: EmployeesPage,
    label: "Employees",
    icon: Users,
    allowedRoles: ["director", "accountant", "tenant_admin"],
    permissions: ["employee:view"],
  },
  students: {
    path: "students",
    component: StudentsPage,
    label: "Students",
    icon: IdCard,
    allowedRoles: ["director", "instructor", "tenant_admin"],
    permissions: ["student:view"],
  },
  courses: {
    path: "courses",
    component: CoursesPage,
    label: "Courses",
    icon: BookOpen,
    allowedRoles: ["director", "instructor", "student", "tenant_admin"],
    permissions: ["course:view"],
  },
  courseDetail: {
    path: "courses/:idx",
    component: CourseDetail,
    label: null,
    allowedRoles: ["director", "instructor", "student", "tenant_admin"],
    permissions: [], // "course:detail:view"
  },
  employeeDetail: {
    path: "employees/:idx",
    component: EmployeeDetail,
    label: null,
    allowedRoles: ["director", "accountant", "tenant_admin"],
    permissions: ["employee:detail:view"],
  },
  studentDetail: {
    path: "students/:idx",
    component: StudentDetail,
    label: null,
    allowedRoles: ["director", "instructor", "tenant_admin"],
    permissions: [],
  },

  classes: {
    path: "classes",
    component: ClassesPage,
    label: "Classes",
    icon: BookOpenCheck,
    allowedRoles: ["director", "instructor", "tenant_admin"],
    permissions: [], // "courseclass:view"
  },
  terms: {
    path: "terms",
    component: TermsPage,
    label: "Terms",
    icon: TimerIcon,
    allowedRoles: ["director", "instructor", "tenant_admin"],
    permissions: [], // "term:view"
  },
  enrollments: {
    path: "enrollments",
    component: EnrollmentsPage,
    label: "Enrollments",
    icon: UserCheck,
    allowedRoles: ["director", "instructor", "tenant_admin"],
    permissions: [], // "enrollment:view"
  },
  finance: {
    path: "finance",
    component: FinancePage,
    label: "Finance",
    icon: Calculator,
    allowedRoles: ["director", "accountant"],
    permissions: ["finance:view"],
  },

  // a dedicated unauthorized page that is accessible to all logged-in roles
  unauthorized: {
    path: "unauthorized",
    component: NotAuthorizedPage,
    label: null,
    allowedRoles: ["*"],
  },
};

/**
 * Helpers
 */

/**
 * Return route objects allowed for a given role.
 * If role is unknown or empty, returns [].
 */
export function getRoutesForRole(role) {
  const rk = norm(role);
  return Object.values(routesConfig).filter(
    (rt) => rt.allowedRoles.includes("*") || rt.allowedRoles.includes(rk),
  );
}

/**
 * Default path for a role: first menu-visible route for that role.
 * Returns a path segment (e.g. "dashboard") or "unauthorized" if nothing available.
 */
export function getDefaultPathForRole(role) {
  const routes = getRoutesForRole(role);
  if (!routes || routes.length === 0) return routesConfig.unauthorized.path;
  // prefer first route that has a label (menu-visible)
  const firstMenu = routes.find((r) => r.label);
  return (firstMenu || routes[0]).path;
}

/**
 * Build sidebar menu entries for a role from the same config.
 * Ensures menu and routes never drift.
 */
export function getMenuForRole(role) {
  return getRoutesForRole(role)
    .filter((r) => r.label)
    .map((r) => ({ label: r.label, path: r.path, icon: r.icon }));
}
