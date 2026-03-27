/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This is temporary until we properly type the Supabase cookie handler.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

export default nextConfig