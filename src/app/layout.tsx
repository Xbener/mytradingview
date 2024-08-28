import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TabsRouter from "./routes";
import { CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My trading view app",
  description: "My trading view app for viewing trade related stuff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CssBaseline />
        <SessionProvider>
          <TabsRouter />
        </SessionProvider>
        {children}
      </body>
    </html>
  );
}
