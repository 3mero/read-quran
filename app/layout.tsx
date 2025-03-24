import type React from "react"
import type { Metadata } from "next"
import { Amiri } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
})

export const metadata: Metadata = {
  title: "القرآن الكريم",
  description: "تطبيق القرآن الكريم - إدارة الأحزاب والأجزاء وتقسيم الصفحات",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${amiri.className} bg-background`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="container mx-auto px-4 pt-20 pb-8">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'