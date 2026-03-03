import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "麦当劳代下单服务",
  description: "自动匹配最优会员卡，省心省钱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
