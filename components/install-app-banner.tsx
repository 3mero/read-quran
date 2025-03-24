"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Smartphone, Wifi, WifiOff, X } from "lucide-react"

export function InstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed before
    const bannerDismissed = localStorage.getItem("installBannerDismissed")
    if (bannerDismissed === "true") {
      return
    }

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
    setIsAndroid(/android/.test(userAgent))

    // Show banner
    setShowBanner(true)

    // Listen for beforeinstallprompt event (for Android)
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
    })

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowBanner(false)
    })
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null)
  }

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem("installBannerDismissed", "true")
  }

  if (!showBanner || isInstalled) return null

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md mb-4 shadow-lg border-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Smartphone className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">تثبيت التطبيق على هاتفك</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissBanner} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm">يمكنك تثبيت هذا التطبيق على هاتفك للوصول السريع واستخدامه بدون إنترنت.</p>

          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <WifiOff className="h-4 w-4 mr-1" />
            <span>يعمل بدون إنترنت</span>
            <Wifi className="h-4 w-4 mx-1 opacity-30" />
            <span className="line-through opacity-50">لا يحتاج إنترنت</span>
          </div>

          {isIOS && (
            <div className="space-y-2">
              <p className="text-sm font-medium">لتثبيت التطبيق على جهاز iOS:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>
                  انقر على زر المشاركة{" "}
                  <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">شارك</span>
                </li>
                <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                <li>انقر على "إضافة"</li>
              </ol>
            </div>
          )}

          {isAndroid && deferredPrompt && (
            <Button onClick={handleInstallClick} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              تثبيت التطبيق
            </Button>
          )}

          {isAndroid && !deferredPrompt && (
            <div className="space-y-2">
              <p className="text-sm font-medium">لتثبيت التطبيق على جهاز Android:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>انقر على قائمة النقاط الثلاث ⋮</li>
                <li>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

