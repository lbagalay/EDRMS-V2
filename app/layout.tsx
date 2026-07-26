import type { Metadata } from "next";
import { Karla, Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "EDRMS v2",
  description: "Foundation Phase for the dental records management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", montserrat.variable, karla.variable, "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-[#F4FAFD] text-slate-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}