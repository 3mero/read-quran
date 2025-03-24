import type React from "react"
import type { Metadata } from "next"
import { Amiri } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import OfflineAlert from "@/components/offline-alert"

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
})

export const metadata: Metadata = {
  title: "القرآن الكريم",
  description: "تطبيق القرآن الكريم - إدارة الأحزاب والأجزاء وتقسيم الصفحات",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#28293d" />
        <link rel="apple-touch-icon" href="/quran.png" />
      </head>
      <body className={`${amiri.className} bg-background`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="container mx-auto px-4 pt-20 pb-8">{children}</main>
          <Toaster />
          <OfflineAlert />
        </ThemeProvider>

        {/* تسجيل خدمة العامل */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(function(registration) {
                    console.log('Service Worker تم التسجيل بنجاح:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('فشل تسجيل Service Worker:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}

