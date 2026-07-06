import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Nb3r";
import Footer from "@/components/Ft8k";
import DeveloperSignature from "@/components/Ds7f";
import { ThemeProvider } from "@/components/Tp3j";
import { _DEVELOPER_SIGNATURE, _verifyIntegrity } from "@/lib/x3";
const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOBA Arena | Retro Tournament Platform",
  description: "The ultimate retro-styled tournament platform for MOBA games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const _sig = _DEVELOPER_SIGNATURE;
  if (!_verifyIntegrity(_sig)) {
    throw new Error("Integrity check failed");
  }
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body className="min-h-screen flex flex-col" data-d={_sig}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <DeveloperSignature />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
