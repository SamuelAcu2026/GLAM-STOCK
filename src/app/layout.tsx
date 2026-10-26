import type { Metadata } from "next";
import { Rubik, Nunito_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

// Tipografías del design system: Rubik para títulos, Nunito Sans para el cuerpo.
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });
const nunitoSans = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glam Stock",
  description: "Control de stock de productos e insumos de cosmética",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${rubik.variable} ${nunitoSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
