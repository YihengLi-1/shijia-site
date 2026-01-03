import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "释迦佛国素食斋",
  description: "释迦佛国素食斋",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}