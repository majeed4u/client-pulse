import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

import "../index.css";
import Providers from "@/components/providers";
import { DirectionProvider } from "@client-pulse/ui/components/direction";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "ClientPulse",
  description: "Professional client portal for freelancers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <DirectionProvider direction={dir}>
            <Providers>{children}</Providers>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
