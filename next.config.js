/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma needs to be treated as an external package in server components
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

module.exports = nextConfig;
