// اسم التخزين المؤقت
const CACHE_NAME = "quran-app-v2"

// قائمة الموارد الأساسية التي يجب تخزينها
const ASSETS = ["/", "/ahzab", "/pages", "/split", "/search", "/quran.png", "/manifest.json"]

// تخزين بيانات القرآن
const QURAN_DATA = ["/lib/quran-data.ts", "/lib/quran-search-data.ts"]

// عند تثبيت خدمة العامل
self.addEventListener("install", (event) => {
  console.log("Service Worker: تم التثبيت")

  // تخزين جميع الموارد الأساسية
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: تخزين الموارد")
      return cache.addAll(ASSETS)
    }),
  )

  // التنشيط الفوري بدون انتظار
  self.skipWaiting()
})

// عند تنشيط خدمة العامل
self.addEventListener("activate", (event) => {
  console.log("Service Worker: تم التنشيط")

  // حذف التخزينات القديمة
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: حذف التخزين القديم", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  // السيطرة على جميع العملاء بدون تحديث الصفحة
  return self.clients.claim()
})

// استراتيجية التخزين المؤقت: الشبكة أولاً ثم التخزين المؤقت
self.addEventListener("fetch", (event) => {
  // تجاهل طلبات Chrome Extension
  if (event.request.url.startsWith("chrome-extension://")) {
    return
  }

  // تجاهل طلبات التحليلات وطلبات POST
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("analytics") ||
    event.request.url.includes("chrome-extension")
  ) {
    return
  }

  event.respondWith(
    // محاولة جلب الموارد من الشبكة أولاً
    fetch(event.request)
      .then((response) => {
        // إذا كان الطلب ناجحًا، قم بتخزين نسخة في التخزين المؤقت
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // إذا فشل الطلب، حاول استرداد من التخزين المؤقت
        console.log("Service Worker: استخدام النسخة المخزنة", event.request.url)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // إذا كان الطلب لصفحة، قم بإرجاع الصفحة الرئيسية
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }

          // إذا لم يتم العثور على المورد في التخزين المؤقت
          return new Response("المورد غير متوفر في وضع عدم الاتصال", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          })
        })
      }),
  )
})

