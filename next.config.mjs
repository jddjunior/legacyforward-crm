/** @type {import('next').NextConfig} */
const previewHost = '3000-' + process.env.BASE44_PUBLIC_HOST_SUFFIX;

const nextConfig = {
  allowedDevOrigins: [previewHost],
  experimental: {
    // Server Actions are rejected when the proxied Origin differs from the Host.
    serverActions: {
      allowedOrigins: [previewHost, '*.' + (process.env.BASE44_SANDBOX_HOST_DOMAIN || 'localhost')],
    },
  },
};

export default nextConfig;
