"use client";

import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { SocketProvider } from "./contexts/SocketContext";

const SpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${SpaceGrotesk.className} min-h-screen bg-slate-100 antialiased`}
      >
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
