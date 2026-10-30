import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NEGOSYO READY | Business Compliance Companion",
  description:
    "A preparation and document tracking prototype for Baguio micro and small businesses.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
