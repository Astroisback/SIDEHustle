import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/shared/Footer";
import AIChatWidget from "@/components/AIChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Side Hustle",
  description: "Empowering underprivileged people",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <AIChatWidget />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
