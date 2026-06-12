/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // BUG C FIX: matikan X-Powered-By header untuk keamanan
  poweredByHeader: false,
  // Supaya image external dari backend bisa di-load jika ada
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
};

export default nextConfig;
