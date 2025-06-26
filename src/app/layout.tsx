import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Roboto 폰트 설정 (docs에서 명시된 폰트)
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "유튜브 트렌드 분석기 - YouTube Trend Analyzer",
  description: "유튜브 채널의 최신 영상 트렌드를 AI로 분석해드립니다. 채널 URL만 입력하면 빠르게 트렌드를 파악할 수 있어요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${roboto.variable} font-roboto antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
