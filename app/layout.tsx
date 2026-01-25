import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/gtag';

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ask My Grandpa | On-Demand Wisdom & Mentorship",
  description: "Connect with local mentors for hands-on help with home repairs. Ask My Grandpa matches you with skilled neighbors to fix leaky sinks, patch walls, and learn skills for life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ask My Grandpa",
    "description": "Connect with local mentors for hands-on help with home repairs. Ask My Grandpa matches you with skilled neighbors to fix leaky sinks, patch walls, and learn skills for life.",
    "url": "https://askmygrandpa.com",
    "logo": "https://askmygrandpa.com/logo.png",
    "sameAs": [
      "https://askmygrandpa.com"
    ],
    "serviceType": "Mentorship and Home Repair Guidance",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Home Repair Mentorship Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Plumbing Guidance",
            "description": "Learn to fix leaky faucets, unclog drains, and basic plumbing repairs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Home Maintenance Mentorship",
            "description": "Guidance on wall patching, painting, and general home maintenance"
          }
        },
        {
          "@type": "Service",
          "name": "DIY Skill Teaching",
          "description": "One-on-one mentorship for learning practical home repair skills"
        }
      ]
    },
    "priceRange": "Free",
    "paymentAccepted": "Coffee or Tea",
    "openingHours": "Mo-Su 00:00-23:59"
  };

  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${lora.variable} font-body antialiased flex flex-col min-h-screen`}
        style={{
          backgroundColor: '#fdfbf7',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d6ccc2' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          color: '#4a4036'
        }}
      >
        <AuthProvider>
          <AnalyticsProvider>
            <Navbar />
            {children}
            <Footer />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
