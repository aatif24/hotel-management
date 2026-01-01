// lib/auth/helpers.ts
import { CACHE_TTL, cacheKeys, getCached } from "@lib/redis";
import { createClient } from "@lib/supabase/server";
import { prisma } from "@prisma/prisma";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user from database with role and permissions (cached)
  const dbUser = await getCached(
    cacheKeys.user(user.id),
    async () => {
      return await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    },
    CACHE_TTL.MEDIUM,
  );

  return {
    id: user.id,
    email: user.email!,
    dbUser,
  };
});

export async function getUserPermissions(userId: string) {
  return getCached(
    cacheKeys.userPermissions(userId),
    async () => {
      console.log(userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
      if (!user) return [];

      return user.role.permissions.map((rp) => rp.permission.code);
    },
    CACHE_TTL.LONG,
  );
}

export async function hasPermission(
  userId: string,
  requiredPermission: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(requiredPermission);
}

export async function requirePermission(
  userId: string,
  requiredPermission: string,
) {
  const allowed = await hasPermission(userId, requiredPermission);

  if (!allowed) {
    throw new Error("Forbidden: Insufficient permissions");
  }
}

// Sync Supabase user with Prisma database
export async function syncSupabaseUser(supabaseUser: {
  id: string;
  email: string;
  user_metadata?: { name?: string };
}) {
  // Check if user exists in database
  let dbUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
  });

  if (!dbUser) {
    // Get or create default waiter role
    let waiterRole = await prisma.role.findUnique({
      where: { name: "waiter" },
    });

    if (!waiterRole) {
      waiterRole = await prisma.role.create({
        data: { name: "waiter" },
      });
    }

    // Create user in database
    dbUser = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || null,
        roleId: waiterRole.id,
      },
    });
  }

  return dbUser;
}
