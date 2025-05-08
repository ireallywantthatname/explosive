"use client";

import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { SocketProvider } from "./contexts/SocketContext";
import { StoryProvider } from "./contexts/StoryContext";
import { AudioProvider } from "./contexts/AudioContext";

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
        <SocketProvider>
          <StoryProvider>
            <AudioProvider>{children}</AudioProvider>
          </StoryProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
