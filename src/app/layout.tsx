import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Amiri } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { UIProvider } from "@/context/UIContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const notoArabic = Noto_Sans_Arabic({ 
  subsets: ["arabic"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic'
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ['400', '700'],
  variable: '--font-amiri'
});

export const metadata: Metadata = {
  title: "Tartelea Admin Dashboard | Premium v1.0",
  description: "Advanced management portal for the Tartelea platform with Gold/Black Premium design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark scroll-smooth">
      <body className={`${inter.variable} ${notoArabic.variable} ${amiri.variable} antialiased bg-black`}>
        <UIProvider>
          <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen">
              <Header />
              <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                {children}
              </main>
            </div>
          </div>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#121212',
                color: '#D4AF37',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px'
              }
            }}
          />
        </UIProvider>
      </body>
    </html>
  );
}

