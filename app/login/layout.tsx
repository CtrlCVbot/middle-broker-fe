import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "로그인 - Middle Shipper",
  description: "Middle Shipper 로그인 페이지",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //<html lang="ko">
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}        
      >
        {children}
      </div>
    //</html>
  );
} 