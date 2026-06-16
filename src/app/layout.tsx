import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfferPilot — AI 求职助手",
  description: "上传简历 + 岗位JD，AI 帮你分析匹配度、一键优化、预测录取概率、生成面试题",
  keywords: ["简历优化", "AI求职", "面试模拟", "OfferPilot", "金融科技"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
