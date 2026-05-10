import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSyncProvider } from "@/components/providers/CartSyncProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { WishlistProvider } from "@/hooks/useWishlist";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suddenly.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Suddenly",
    template: "%s | Suddenly"
  },
  description: "The best place for lazy but smart shopping in India.",
  keywords: ["ecommerce", "online shopping", "fashion", "smart store", "india", "lazy shopping"],
  authors: [{ name: "Suddenly Team" }],
  creator: "Suddenly",
  publisher: "Suddenly",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Suddenly",
  },
  openGraph: {
    type: "website",
    locale: "en_IN", // Indian English
    url: baseUrl,
    siteName: "Suddenly",
    title: "Suddenly",
    description: "Discover the smartest way to shop. Fashion, accessories, and more for the lazy genius.",
    images: [
      {
        url: "/og-image.jpg", // Make sure this image exists or is generic
        width: 1200,
        height: 630,
        alt: "Suddenly - Smart Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suddenly",
    description: "The best place for lazy but smart shopping in India.",
    creator: "@suddenly", // Replace with actual handle if known
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "google-site-verification=YOUR_CODE_HERE", // User needs to verify this in GSC
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Suddenly',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    sameAs: [
      'https://twitter.com/suddenly',
      'https://instagram.com/suddenly',
      'https://facebook.com/suddenly'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9876543210',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: 'en'
    }
  };

  const schemaWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Suddenly',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (localTheme === 'dark' || (!localTheme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log = function() { };
                // Optional: console.info = function() { };
        // We keep warn and error for critical debugging
        `
            }}
          />
        )}
        <script
          key="schema-org"
          id="schema-org"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <script
          key="schema-website"
          id="schema-website"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebsite) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <NotificationProvider>
                <CartSyncProvider />
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 pb-24 lg:pb-0">
                    {children}
                  </main>
                  <Footer />
                  <MobileNavigation />
                  <Toaster />
                  <ErrorDialog />
                  <ChatWidget />
                </div>
              </NotificationProvider>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}

