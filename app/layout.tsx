import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LPint - LP Intelligence Tracker",
  description: "Track and engage with Limited Partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex space-x-8">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  LPint
                </Link>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                  Upload CSV
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
