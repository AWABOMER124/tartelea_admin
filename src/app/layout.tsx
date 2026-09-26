import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "إدارة المدرسة الترتيلية",
  description: "لوحة الإدارة المستقلة للمدرسة الترتيلية",
  robots: { index: false, follow: false, noarchive: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Sidebar />
        <Header />
        <main className="min-h-screen bg-app pb-8 pt-[76px] lg:pr-60 lg:pt-[72px]">
          <div className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        <Toaster position="bottom-left" reverseOrder={false} />
      </body>
    </html>
  );
}
