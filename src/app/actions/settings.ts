"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const userId   = await getAuthUserId();
  const username = (formData.get("username") as string)?.trim();
  const bio      = (formData.get("bio") as string)?.trim() ?? "";

  if (!username || username.length < 3 || username.length > 30)
    return { error: "Username must be 3–30 characters." };
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { error: "Username can only contain letters, numbers, and underscores." };

  // Check uniqueness — exclude current user
  const existing = await prisma.profile.findFirst({
    where: { username, NOT: { userId } },
  });
  if (existing) return { error: "That username is already taken." };

  await prisma.profile.update({
    where: { userId },
    data:  { username, bio: bio || null },
  });

  revalidatePath("/settings");
  revalidatePath("/home");
  return { success: true };
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function updatePassword(formData: FormData) {
  const supabase   = await createClient();
  const newPassword = (formData.get("newPassword") as string)?.trim();

  if (!newPassword || newPassword.length < 8)
    return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}

// ─── Delete account ───────────────────────────────────────────────────────────

export async function deleteAccount() {
  const userId   = await getAuthUserId();
  const supabase = await createClient();

  // Delete all user data (cascade handles child rows)
  await prisma.profile.delete({ where: { userId } });

  // Sign out
  await supabase.auth.signOut();
  redirect("/");
}

// ─── Preferences ──────────────────────────────────────────────────────────────

export async function updatePreferences(formData: FormData) {
  const userId          = await getAuthUserId();
  const theme           = (formData.get("theme") as string) ?? "system";
  const defaultMediaType = (formData.get("defaultMediaType") as string) ?? "anime";
  const autoProgress    = formData.get("autoProgress") === "true";
  const notifications   = formData.get("notifications") === "true";

  await prisma.userPreferences.upsert({
    where:  { userId },
    create: { userId, theme, defaultMediaType, autoProgress, notifications },
    update: { theme, defaultMediaType, autoProgress, notifications },
  });

  revalidatePath("/settings");
  return { success: true };
}

// ─── Tracked sites ────────────────────────────────────────────────────────────

export async function addTrackedSite(formData: FormData) {
  const userId = await getAuthUserId();
  const rawDomain = (formData.get("domain") as string)?.trim().toLowerCase();

  if (!rawDomain) return { error: "Domain is required." };

  // Strip protocol/path
  const domain = rawDomain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .trim();

  if (!domain.includes(".")) return { error: "Enter a valid domain (e.g. crunchyroll.com)." };

  const existing = await prisma.trackedSite.findUnique({
    where: { userId_domain: { userId, domain } },
  });
  if (existing) return { error: "That site is already being tracked." };

  await prisma.trackedSite.create({
    data: { userId, domain, label: domain },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function removeTrackedSite(siteId: string) {
  const userId = await getAuthUserId();
  const site   = await prisma.trackedSite.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== userId) return { error: "Not found." };
  await prisma.trackedSite.delete({ where: { id: siteId } });
  revalidatePath("/settings");
  return { success: true };
}

export async function toggleTrackedSite(siteId: string, enabled: boolean) {
  const userId = await getAuthUserId();
  const site   = await prisma.trackedSite.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== userId) return { error: "Not found." };
  await prisma.trackedSite.update({ where: { id: siteId }, data: { enabled } });
  revalidatePath("/settings");
  return { success: true };
}
