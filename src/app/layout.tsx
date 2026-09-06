import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Codebase Black Box", description: "Evidence-first flight recorder for AI-assisted development" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
