/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',         
  images: { unoptimized: true }, 
  experimental: { turbo: {  } },
};

export default nextConfig;
