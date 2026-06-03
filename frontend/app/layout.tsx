import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Vespera — Trustless Arisan On-Chain",
  description: "AI-governed rotating savings protocol built on Celo.",
  other: {
    "talentapp:project_verification":
      "f17fa14819588840e8506d8a9f4e6f73a1d62b0a4bee72a0d7942dca73791f5ac92204633e4a53455cc8082ba4227277de4f647dff5a4cf2251a7d82913b154e",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F5F5F5]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
