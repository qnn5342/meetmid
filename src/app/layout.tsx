import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetMid — Tìm điểm hẹn ở giữa",
  description:
    "Tìm quán ăn, cafe ở giữa 2-4 người. Không cần đăng ký, nhanh và dễ dùng.",
  openGraph: {
    title: "MeetMid — Tìm điểm hẹn ở giữa",
    description: "Hẹn ở đâu cho công bằng? MeetMid giúp bạn tìm quán ở giữa mọi người.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.className} h-full`}>
      <body className="h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
