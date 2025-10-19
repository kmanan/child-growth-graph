import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CDC Growth Charts - Track Your Child's Growth",
  description: "Modern, beautiful growth charts using WHO and CDC standards. Track your newborn's weight, length, and head circumference with interactive visualizations.",
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
