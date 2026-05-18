import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export const metadata: Metadata = {
  title: "Growth Charts - Track Your Child's Growth",
  description: "Modern, beautiful growth charts using the CDC growth reference. Track your newborn's weight, length, and head circumference with interactive visualizations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <DisclaimerBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
