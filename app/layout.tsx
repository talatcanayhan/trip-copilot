import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Copilot — AI eSIM data planner",
  description:
    "Tell it your trip; it forecasts your data, recommends the right eSIM plan, and answers connectivity questions with an AI concierge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts load from Google with graceful system fallbacks if offline. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
