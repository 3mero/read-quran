"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Smartphone, WifiOff, Download } from "lucide-react"

export function InstallAppDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
    setIsAndroid(/android/.test(userAgent))

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
      setIsOpen(false)
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

  // Don't show the install button if already installed
  if (isInstalled) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <span>تثبيت التطبيق على هاتفك</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            تثبيت التطبيق على هاتفك
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            يمكنك تثبيت هذا التطبيق على هاتفك للوصول السريع واستخدامه <strong>بدون إنترنت</strong>.
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="h-4 w-4" />
            <span>يعمل بشكل كامل بدون إنترنت (محلياً)</span>
          </div>

          {isAndroid && deferredPrompt && (
            <div className="my-4">
              <Button onClick={handleInstallClick} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                تثبيت التطبيق الآن
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                انقر على الزر أعلاه لتثبيت التطبيق مباشرة
              </p>
            </div>
          )}

          {isAndroid && !deferredPrompt && (
            <div className="space-y-2">
              <p className="font-medium">لتثبيت التطبيق على هاتف Android:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>انقر على قائمة النقاط الثلاث ⋮ في متصفح Chrome</li>
                <li>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
                <li>انقر على "تثبيت"</li>
              </ol>
            </div>
          )}

          {isIOS && (
            <div className="space-y-2">
              <p className="font-medium">لتثبيت التطبيق على هاتف iPhone:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  انقر على زر المشاركة{" "}
                  <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">شارك</span>
                </li>
                <li>قم بالتمرير لأسفل واختر "إضافة إلى الشاشة الرئيسية"</li>
                <li>انقر على "إضافة"</li>
              </ol>
            </div>
          )}

          <div className="bg-primary/10 p-3 rounded-md">
            <p className="text-sm font-bold">مميزات التطبيق:</p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              <li>يعمل بدون إنترنت</li>
              <li>تخزين البيانات محلياً على جهازك</li>
              <li>سرعة الوصول من شاشة هاتفك الرئيسية</li>
              <li>تجربة مستخدم أفضل (مثل التطبيقات الأصلية)</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>إغلاق</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

