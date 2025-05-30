import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "react-hot-toast"
import Provider from "@/server/provider/queryProvider";
import { NotificationProvider } from "./context/notification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_BASEURL ?? "http://localhost:3000"),
  title: 'EduPortal - User Registration',
  description: 'Registration portal for students, teachers, and guidance counselors',
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
          <Toaster position="bottom-right" />
        </Provider>
      </body>
    </html>
  );
}
