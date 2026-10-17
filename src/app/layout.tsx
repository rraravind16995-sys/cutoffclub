import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "CutoffClub | UPSC Preparation, Made Clear",
  description: "Daily current affairs, Prelims MCQs, UPSC Mains practice and model answers — organised by subject and GS paper.",
  metadataBase: new URL("https://cutoffclub.vercel.app"),
  openGraph: { title: "CutoffClub", description: "UPSC preparation, made clear.", type: "website" }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
