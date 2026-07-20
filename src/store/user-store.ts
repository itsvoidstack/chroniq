import { create } from "zustand";

interface UserState {
  userId: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  setUser: (user: {
    userId: string;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
  }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  avatarUrl: null,
  bio: null,
  setUser: ({ userId, username, avatarUrl, bio }) =>
    set({ userId, username, avatarUrl: avatarUrl ?? null, bio: bio ?? null }),
  clearUser: () =>
    set({ userId: null, username: null, avatarUrl: null, bio: null }),
}));
