/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.appDir if not using app directory features
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  output: 'export',      // static export
  trailingSlash: true,   // for Firebase hosting
  distDir: 'out',        // build output folder
};

export default nextConfig;
