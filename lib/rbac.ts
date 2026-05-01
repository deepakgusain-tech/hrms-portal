import { auth } from "@/auth";
import { prisma } from "./prisma";

export type PermissionAction = "view" | "create" | "edit" | "delete";

type RoleModulePermission = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  module: {
    route: string;
  };
};

type UserWithPermissions = {
  role?: {
    name?: string | null;
    roleModules: RoleModulePermission[];
  } | null;
};

export async function getUserPermissions() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          roleModules: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });
}

function isAdminUser(user: UserWithPermissions | null) {
  return !!user?.role?.name?.toLowerCase().includes("admin");
}

function isEmployeeUser(user: UserWithPermissions | null) {
  return user?.role?.name?.toLowerCase() === "employee";
}

function getModulePermission(
  user: UserWithPermissions | null,
  route: string
) {
  return user?.role?.roleModules.find((roleModule) => {
    return roleModule.module.route === route;
  });
}

function readPermission(
  permission: RoleModulePermission | undefined,
  action: PermissionAction
) {
  if (!permission) {
    return false;
  }

  if (action === "view") return !!permission.canView;
  if (action === "create") return !!permission.canCreate;
  if (action === "edit") return !!permission.canEdit;
  if (action === "delete") return !!permission.canDelete;

  return false;
}

export async function canAccess(route: string, action: PermissionAction) {
  const user = await getUserPermissions();

  if (!user) {
    return false;
  }

  if (isAdminUser(user)) {
    return true;
  }

  if (
    isEmployeeUser(user) &&
    (route === "/employee-documents" || route === "/attendance")
  ) {
    return action !== "delete";
  }

  const permission = getModulePermission(user, route);
  return readPermission(permission, action);
}

export async function getRoutePermissions(route: string) {
  const user = await getUserPermissions();

  if (!user) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    };
  }

  if (isAdminUser(user)) {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    };
  }

  if (
    isEmployeeUser(user) &&
    (route === "/employee-documents" || route === "/attendance")
  ) {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    };
  }

  const permission = getModulePermission(user, route);

  return {
    canView: readPermission(permission, "view"),
    canCreate: readPermission(permission, "create"),
    canEdit: readPermission(permission, "edit"),
    canDelete: readPermission(permission, "delete"),
  };
}

export async function getAllowedRoute(route: string) {
  const permissions = await getRoutePermissions(route);

  if (
    permissions.canView ||
    permissions.canCreate ||
    permissions.canEdit ||
    permissions.canDelete
  ) {
    return route;
  }

  return "";
}

export async function getAccessibleRoutes() {
  const user = await getUserPermissions();

  if (!user) {
    return [];
  }

  if (isAdminUser(user)) {
    return user.role?.roleModules.map((roleModule) => roleModule.module.route) || [];
  }

  return (
    user.role?.roleModules
      .filter((roleModule) => {
        return (
          roleModule.canView ||
          roleModule.canCreate ||
          roleModule.canEdit ||
          roleModule.canDelete
        );
      })
      .map((roleModule) => roleModule.module.route) || []
  );
}
