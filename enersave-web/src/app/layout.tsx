import type { Metadata } from "next";
import "./globals.css";
import { dashboardDescription, pageTitle } from "@/lib/productCopy";

export const metadata: Metadata = {
  title: pageTitle,
  description: dashboardDescription
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
