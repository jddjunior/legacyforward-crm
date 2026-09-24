/** @type {import('next').NextConfig} */
const previewHost = '3000-' + process.env.BASE44_PUBLIC_HOST_SUFFIX;

const nextConfig = {
  allowedDevOrigins: [previewHost],
  experimental: {
    // Server Actions are rejected when the proxied Origin differs from the Host.
    serverActions: {
      allowedOrigins: [previewHost, '*.' + (process.env.BASE44_SANDBOX_HOST_DOMAIN || 'localhost')],
      // Document uploads go through a server action (10 MB file cap + form overhead).
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
