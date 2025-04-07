import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 시 ESLint 검사 비활성화
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;