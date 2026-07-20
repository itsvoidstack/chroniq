"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user-store";

interface UserHydratorProps {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

/**
 * Receives user data from the server layout and hydrates the Zustand store.
 * This avoids calling Supabase/Prisma from every client component.
 */
export function UserHydrator({ userId, username, avatarUrl, bio }: UserHydratorProps) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser({ userId, username, avatarUrl, bio });
  }, [userId, username, avatarUrl, bio, setUser]);

  return null;
}
