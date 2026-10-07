/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Mobile React Native components share the repository with the Next.js web showcase
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
