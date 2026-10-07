import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";

export const metadata: Metadata = {
  title: "SFS Oplate | B2B Inženjerska Platforma za Oplatu i Skele",
  description:
    "Standard Formwork Systems (sfs-oplate.com) - Zidna oplata, pločna oplata H20, građevinski podupirači, tipske i ringlock skele. Brzi proračun, specifikacije i dispečerski centar Dobanovci.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning className="dark">
      <body className="antialiased selection:bg-amber-500 selection:text-slate-950 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
