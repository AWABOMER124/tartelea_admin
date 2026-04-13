import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "بوابة إدارة ترتيلة",
  description: "واجهة الإدارة الموحدة لمنصة Tartelea عبر Backend API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Header />
        <Sidebar />
        <main className="min-h-screen bg-app pr-72 pt-20">
          <div className="mx-auto max-w-[1600px] p-6 lg:p-8">{children}</div>
        </main>
        <Toaster position="bottom-left" reverseOrder={false} />
      </body>
    </html>
  );
}
