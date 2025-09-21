import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../lib/design-system/styles/globals.css";
import { NotificationContainer } from "@/components/ui/notification";
import { Toaster } from "sonner";
import { Toaster as HotToast } from "react-hot-toast";
import { CriticalErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";
import { GlobalErrorHandler } from "@/components/error-boundaries/GlobalErrorHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Padelyzer - La Plataforma Inteligente del Padel Mexicano",
  description: "Reservas gratis forever. Widget para tu website. Pagos divididos automáticos. La revolución digital del padel en México.",
  keywords: "padel, reservas, clubes, Mexico, Puebla, pagos divididos, widget",
  icons: {
    icon: "/padelyzer-favicon.png",
    shortcut: "/padelyzer-favicon.png",
    apple: "/padelyzer-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body className={`${inter.variable} font-inter bg-gray-50 text-gray-900`}>
        <CriticalErrorBoundary context="root-layout">
          {children}
          <GlobalErrorHandler />
          <NotificationContainer />
          <Toaster />
          <HotToast />
        </CriticalErrorBoundary>
      </body>
    </html>
  );
}
