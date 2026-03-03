import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // 静态导出
  images: {
    unoptimized: true,  // Cloudflare Pages 需要禁用图片优化
  },
  trailingSlash: true,  // 添加尾随斜杠
  typescript: {
    ignoreBuildErrors: true,  // 忽略drizzle.config.ts的类型错误
  },
};

export default nextConfig;
