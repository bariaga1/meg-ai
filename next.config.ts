import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // README opens http://127.0.0.1:3000. Next only allows `localhost` by default,
  // so dev assets 403 and the chat page never hydrates. `[::1]` covers the
  // IPv6 localhost bind when 127.0.0.1:3000 is already taken.
  allowedDevOrigins: ["127.0.0.1", "[::1]"],
};

export default nextConfig;
