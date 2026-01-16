import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://darslinker.uz"),
  title: {
    default: "Dars Linker - O'zbekiston EdTech Platformasi",
    template: "%s | Dars Linker",
  },
  description:
    "Dars Linker - O'zbekistonning yetakchi ta'lim platformasi. Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
  keywords: [
    "online kurslar",
    "o'zbek tilida ta'lim",
    "edtech",
    "online o'qish",
    "darslinker",
    "ta'lim platformasi",
    "kurslar",
    "o'qituvchilar",
  ],
  authors: [{ name: "Dars Linker" }],
  creator: "Dars Linker",
  publisher: "Dars Linker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    alternateLocale: ["ru_RU", "en_US"],
    url: "https://darslinker.uz",
    siteName: "Dars Linker",
    title: "Dars Linker - O'zbekiston EdTech Platformasi",
    description:
      "Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dars Linker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dars Linker - O'zbekiston EdTech Platformasi",
    description:
      "Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
