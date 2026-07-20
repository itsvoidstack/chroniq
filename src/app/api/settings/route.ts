import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, prefs, sites] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userPreferences.findUnique({ where: { userId: user.id } }),
    prisma.trackedSite.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    email:   user.email,
    profile,
    prefs:   prefs ?? {
      theme: "system", defaultMediaType: "anime",
      autoProgress: true, notifications: true,
    },
    sites,
  });
}
