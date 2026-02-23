import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!(session as any)?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: (session as any).user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
