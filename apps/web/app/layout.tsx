import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ["Consolas", "Monaco", "Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "Roomlocate",
  description: "Verified Rooms. Local Trust.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
    other: [
      { rel: "icon", url: "/icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <AuthProvider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}