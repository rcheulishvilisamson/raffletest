import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffleHub - Join Fair Raffles Every Day",
  description: "Win real prizes from trusted hosts in our community-powered raffle platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-white text-text_primary">
        {children}
      </body>
    </html>
  );
}
