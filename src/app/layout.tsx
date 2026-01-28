import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { FluidCursor } from "@/components/ui/fluid-cursor";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://darslinker.uz"),
  title: {
    default: "Darslinker - O'zbekiston EdTech Platformasi",
    template: "%s | Darslinker",
  },
  description:
    "Darslinker - O'zbekistonning yetakchi ta'lim platformasi. Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
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
  authors: [{ name: "Darslinker" }],
  creator: "Darslinker",
  publisher: "Darslinker",
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
    siteName: "Darslinker",
    title: "Darslinker - O'zbekiston EdTech Platformasi",
    description:
      "Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Darslinker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darslinker - O'zbekiston EdTech Platformasi",
    description:
      "Online kurslar, darsliklar va o'qituvchilar bilan o'z bilimingizni oshiring.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
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
      <body className="font-sans antialiased">
        <FluidCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
