"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

export default function OfflineAlert() {
  const [isOnline, setIsOnline] = useState(true)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // تحديد حالة الاتصال الأولية
    setIsOnline(navigator.onLine)

    // إظهار التنبيه فقط إذا كان المستخدم غير متصل
    setShowAlert(!navigator.onLine)

    // إضافة مستمعي الأحداث للاتصال
    const handleOnline = () => {
      setIsOnline(true)
      setShowAlert(true)
      // إخفاء تنبيه "متصل" بعد 3 ثوانٍ
      setTimeout(() => setShowAlert(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // لا تعرض شيئًا إذا كان التنبيه مخفيًا
  if (!showAlert) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isOnline
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        <span className="font-medium">{isOnline ? "تم استعادة الاتصال بالإنترنت" : "أنت الآن في وضع عدم الاتصال"}</span>
      </div>
      {!isOnline && <div className="text-sm">يمكنك استخدام التطبيق بدون إنترنت</div>}
      <button
        onClick={() => setShowAlert(false)}
        className="ml-2 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="إغلاق"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

