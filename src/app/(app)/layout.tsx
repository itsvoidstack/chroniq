import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/shell/sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { UserHydrator } from "@/components/shell/user-hydrator";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session server-side (middleware already guards routes,
  // but we also need the user data for the shell)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile from DB
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { username: true, avatarUrl: true, bio: true, userId: true },
  });

  // Edge case: authenticated but no profile yet (shouldn't happen after signup)
  if (!profile) redirect("/login");

  return (
    <>
      {/* Hydrate Zustand store with user data */}
      <UserHydrator
        userId={profile.userId}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bio={profile.bio}
      />

      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content — offset by sidebar width on md+ */}
        <div className="flex-1 flex flex-col md:ml-60 min-w-0">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </>
  );
}
