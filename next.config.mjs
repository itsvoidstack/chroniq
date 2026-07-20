/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // AniList CDN
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/file/anilistcdn/**",
      },
      // TMDB images
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      // Jikan / MAL CDN
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
