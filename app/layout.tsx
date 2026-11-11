import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
export const metadata: Metadata = { title: "CultureBridge", description: "Workshops for global etiquette, diversity and inclusion" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="font-sans antialiased"><Nav /><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></body></html>);
}
