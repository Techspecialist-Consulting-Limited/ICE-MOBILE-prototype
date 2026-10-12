import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NSIA ICE 2.0 Emergency Safety App",
  description: "Mobile emergency safety and incident reporting experience for NSIA staff",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}
