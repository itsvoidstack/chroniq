import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a demo user
  const userId = randomUUID();
  
  const user = await prisma.profile.upsert({
    where: { id: userId }, // This will fail if we just generate a random UUID and try to upsert since we don't have it in auth.users
    update: {},
    create: {
      id: userId,
      display_name: 'Demo User',
      bio: 'This is a seeded demo user.',
      avatar_url: 'https://i.pravatar.cc/150?u=demo',
    },
  }).catch(async (e) => {
    // If foreign key to auth.users fails, we might just bypass this or rely on a known auth user.
    // For the sake of the demo script, we'll try to find an existing user or create one if FK is disabled.
    // Since RLS and FKs might be active, in a true Supabase setup, we'd create the auth user first.
    // To make this seed robust for development, we will fetch the first existing profile to use as our seed target.
    const existing = await prisma.profile.findFirst();
    if (existing) return existing;
    throw e;
  });

  const targetUserId = user.id;
  console.log(`Using User ID: ${targetUserId}`);

  // 2. Create Content (Anime, Movies, TV Shows)
  console.log('Seeding content...');
  const contents = await Promise.all([
    // Anime
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: 16498, tmdb_id: null } },
      update: {},
      create: { type: 'anime', anilist_id: 16498 }, // Attack on Titan
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: 11061, tmdb_id: null } },
      update: {},
      create: { type: 'anime', anilist_id: 11061 }, // Hunter x Hunter
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: 21, tmdb_id: null } },
      update: {},
      create: { type: 'anime', anilist_id: 21 }, // One Piece
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: 101922, tmdb_id: null } },
      update: {},
      create: { type: 'anime', anilist_id: 101922 }, // Demon Slayer
    }),
    // Movies
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 157336 } },
      update: {},
      create: { type: 'movie', tmdb_id: 157336 }, // Interstellar
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 27205 } },
      update: {},
      create: { type: 'movie', tmdb_id: 27205 }, // Inception
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 155 } },
      update: {},
      create: { type: 'movie', tmdb_id: 155 }, // The Dark Knight
    }),
    // TV Shows
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 1399 } },
      update: {},
      create: { type: 'tv', tmdb_id: 1399 }, // Game of Thrones
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 66732 } },
      update: {},
      create: { type: 'tv', tmdb_id: 66732 }, // Stranger Things
    }),
    prisma.content.upsert({
      where: { anilist_id_tmdb_id: { anilist_id: null, tmdb_id: 1396 } },
      update: {},
      create: { type: 'tv', tmdb_id: 1396 }, // Breaking Bad
    }),
  ]);

  // 3. Create User Content (Watch Progress, Favorites, Ratings)
  console.log('Seeding user library and progress...');
  
  const userContentsData = [
    { content_id: contents[0].id, status: 'completed', progress: 87, rating: 10, favorite: true }, // AOT
    { content_id: contents[1].id, status: 'watching', progress: 45, rating: 9, favorite: true }, // HxH
    { content_id: contents[2].id, status: 'watching', progress: 1070, rating: null, favorite: false }, // One Piece
    { content_id: contents[3].id, status: 'plan_to_watch', progress: 0, rating: null, favorite: false }, // Demon Slayer
    { content_id: contents[4].id, status: 'completed', progress: 1, rating: 10, favorite: true }, // Interstellar
    { content_id: contents[5].id, status: 'completed', progress: 1, rating: 9, favorite: false }, // Inception
    { content_id: contents[6].id, status: 'on_hold', progress: 0, rating: null, favorite: false }, // Dark Knight
    { content_id: contents[7].id, status: 'completed', progress: 73, rating: 8, favorite: false }, // GoT
    { content_id: contents[8].id, status: 'watching', progress: 25, rating: 8, favorite: true }, // Stranger Things
    { content_id: contents[9].id, status: 'dropped', progress: 5, rating: 6, favorite: false }, // Breaking Bad
  ];

  for (const uc of userContentsData) {
    await prisma.userContent.upsert({
      where: { user_id_content_id: { user_id: targetUserId, content_id: uc.content_id } },
      update: uc,
      create: {
        user_id: targetUserId,
        ...uc,
      },
    });
  }

  // 4. Create Lists and Collections
  console.log('Seeding lists and collections...');
  const favoritesList = await prisma.list.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: targetUserId,
      name: 'All-Time Favorites',
      description: 'The best of the best.',
      is_public: true,
    }
  }).catch(async (e) => {
    return await prisma.list.findFirst({ where: { name: 'All-Time Favorites', user_id: targetUserId } }) 
      || await prisma.list.create({ data: { user_id: targetUserId, name: 'All-Time Favorites', description: 'The best of the best.', is_public: true } });
  });

  const animeList = await prisma.list.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      user_id: targetUserId,
      name: 'Anime Masterpieces',
      description: 'Must watch anime series.',
      is_public: false,
    }
  }).catch(async (e) => {
    return await prisma.list.findFirst({ where: { name: 'Anime Masterpieces', user_id: targetUserId } }) 
      || await prisma.list.create({ data: { user_id: targetUserId, name: 'Anime Masterpieces', description: 'Must watch anime series.', is_public: false } });
  });

  // 5. Add Items to Lists
  console.log('Seeding list items...');
  const listItemsData = [
    { list_id: favoritesList.id, content_id: contents[0].id, position: 1 }, // AOT -> Favorites
    { list_id: favoritesList.id, content_id: contents[4].id, position: 2 }, // Interstellar -> Favorites
    { list_id: animeList.id, content_id: contents[0].id, position: 1 }, // AOT -> Anime
    { list_id: animeList.id, content_id: contents[1].id, position: 2 }, // HxH -> Anime
  ];

  for (const li of listItemsData) {
    await prisma.listItem.upsert({
      where: { list_id_content_id: { list_id: li.list_id, content_id: li.content_id } },
      update: {},
      create: li,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
