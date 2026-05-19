import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope,Noto_Serif } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight:["400","500","600","700"]
});

const notoSerif = Noto_Serif({
  variable: "--font-notoserif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight:["400","500","600","700"]
});


export const metadata: Metadata = {
  title: "GiG Flow",
  description: "Your go to CRM to manage leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
