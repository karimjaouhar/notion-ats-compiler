/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.notion.so" },
      { protocol: "https", hostname: "secure.notion-static.com" },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com" }
    ]
  }
};

export default nextConfig;
