import "./globals.css";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.nameEn}`,
    template: `%s · ${SITE.name}`,
  },
  description: `${SITE.tagline.replace(/\n/g, " ")} — ${SITE.taglineEn.replace(/\n/g, " ")}`,
  keywords: [
    "Buddhist vegetarian",
    "素食斋",
    "释迦佛国",
    "La Habra Heights",
    "vegetarian temple",
    "Buddhist dining",
    "供斋",
    "随喜",
    "素斋",
    "California Buddhist temple",
  ],
  authors: [{ name: SITE.name }],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: `${SITE.name} · ${SITE.nameEn}`,
    description: `${SITE.tagline.replace(/\n/g, " ")} — ${SITE.taglineEn.replace(/\n/g, " ")}`,
    type: "website",
    url: SITE.url,
    locale: "zh_CN",
    alternateLocale: "en_US",
    siteName: SITE.name,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.nameEn}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.nameEn}`,
    description: `${SITE.tagline.replace(/\n/g, " ")} — ${SITE.taglineEn.replace(/\n/g, " ")}`,
    images: ["/og.svg"],
  },
  alternates: {
    canonical: SITE.url,
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "LocalBusiness"],
  name: SITE.name,
  alternateName: SITE.nameEn,
  description: SITE.taglineEn.replace(/\n/g, " "),
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "1820 Sharpless Dr",
    addressLocality: "La Habra Heights",
    addressRegion: "CA",
    postalCode: "90631",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.966,
    longitude: -117.951,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "05:00",
      closes: "21:00",
    },
  ],
  servesCuisine: ["Vegetarian", "Vegan", "Buddhist"],
  priceRange: "$",
  hasMap: SITE.mapUrl,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans-US">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
