import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const locale = params?.locale || 'en'
  const title = "Crewset - Protect your recurring revenue"
  const description = "Freelancer & Agency Contract Renewal and Revenue Protection platform."
  const canonicalPath = `/${locale}`
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Crewset"
    },
    description,
    icons: {
      icon: "/favicon.jpg"
    },
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en",
        tr: "/tr",
      }
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title,
      description,
      siteName: "Crewset",
      locale,
      images: [
        {
          url: "/favicon.jpg",
          alt: "Crewset",
        }
      ]
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/favicon.jpg"]
    },
    robots: {
      index: true,
      follow: true
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      themeColor: "#ffffff"
    }
  }
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
