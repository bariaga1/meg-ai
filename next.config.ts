import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // README opens http://127.0.0.1:3000. Next only allows `localhost` by default,
  // so dev assets 403 and the chat page never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
