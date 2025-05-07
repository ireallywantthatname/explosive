"use client";

import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { SocketProvider } from "./contexts/SocketContext";
import { AudioProvider } from "./contexts/AudioContext";
import { StoryProvider } from "./contexts/StoryContext";

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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={`${SpaceGrotesk.className} min-h-screen bg-slate-100 antialiased`}
      >
        <AudioProvider>
          <SocketProvider>
            <StoryProvider>{children}</StoryProvider>
          </SocketProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
