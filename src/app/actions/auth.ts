"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  if (!email || !password || !username) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (username.length < 3 || username.length > 30) {
    return { error: "Username must be between 3 and 30 characters." };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers, and underscores." };
  }

  // Check username availability
  const existing = await prisma.profile.findUnique({ where: { username } });
  if (existing) {
    return { error: "That username is already taken." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create profile
    await prisma.profile.create({
      data: {
        userId: data.user.id,
        username,
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: data.user.id,
      },
    });

    // Seed default tracked sites
    await prisma.trackedSite.createMany({
      data: [
        { userId: data.user.id, domain: "crunchyroll.com", label: "Crunchyroll" },
        { userId: data.user.id, domain: "hidive.com", label: "HIDIVE" },
        { userId: data.user.id, domain: "netflix.com", label: "Netflix" },
      ],
    });
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
