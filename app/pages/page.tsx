"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Share2, ChevronLeft, ChevronRight, Calendar, BookOpen } from "lucide-react"
import { ScrollToTopButton } from "@/components/scroll-to-top"

export default function PagesPage() {
  const [pageCount, setPageCount] = useState("3")
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  const [title, setTitle] = useState("")
  const [lastShared, setLastShared] = useState("")
  const [lastSharedPages, setLastSharedPages] = useState("")
  const [pages, setPages] = useState([])

  useEffect(() => {
    // Load settings from localStorage
    const savedPageCount = localStorage.getItem("pageCount") || "3"
    setPageCount(savedPageCount)

    const savedLastShared = localStorage.getItem("lastShared")
    if (savedLastShared) {
      setLastShared(savedLastShared)
    }

    const savedLastSharedPages = localStorage.getItem("lastSharedPages")
    if (savedLastSharedPages) {
      setLastSharedPages(savedLastSharedPages)
    }

    const savedSelectedPageIndex = localStorage.getItem("lastSelectedPageIndex")
    if (savedSelectedPageIndex) {
      setSelectedPageIndex(Number.parseInt(savedSelectedPageIndex))
    }

    // Generate pages based on page count
    updatePages(savedPageCount)
  }, [])

  const updatePages = (count) => {
    const pagesArray = []
    const pageCountInt = Number.parseInt(count)

    if (pageCountInt === 1) {
      // For single pages
      for (let i = 1; i <= 604; i++) {
        pagesArray.push({
          text: `${i}`,
          link: `https://read-quran.github.io/quran/1-Pages/${i}`,
        })
      }
    } else {
      // For multiple pages
      for (let i = 1; i <= 604; i += pageCountInt) {
        let end = i + pageCountInt - 1
        if (end > 604) end = 604
        pagesArray.push({
          text: `من ${i} إلى ${end}`,
          link: `https://read-quran.github.io/quran/${pageCountInt}-Pages/${end}-${i}`,
        })
      }
    }

    setPages(pagesArray)
  }

  const handlePageCountChange = (value) => {
    if (confirm("هل أنت متأكد من تغيير عدد الصفحات؟")) {
      setPageCount(value)
      localStorage.setItem("pageCount", value)
      updatePages(value)
      setSelectedPageIndex(0)
      localStorage.setItem("lastSelectedPageIndex", "0")
    }
  }

  const handlePageSelect = (index) => {
    setSelectedPageIndex(index)
    localStorage.setItem("lastSelectedPageIndex", index.toString())
  }

  const navigate = (direction) => {
    const newIndex = selectedPageIndex + direction
    if (newIndex >= 0 && newIndex < pages.length) {
      setSelectedPageIndex(newIndex)
      localStorage.setItem("lastSelectedPageIndex", newIndex.toString())
    }
  }

  const shareOnWhatsApp = () => {
    if (pages.length === 0) return

    const selectedPage = pages[selectedPageIndex]
    const pageText = selectedPage.text
    const pageLink = selectedPage.link

    const now = new Date()
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = days[now.getDay()]

    const formattedDate = now.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const formattedTime = now.toLocaleTimeString("ar-LY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    let message
    if (Number.parseInt(pageCount) === 1) {
      message = `${title || "القرآن الكريم"} | الصفحة ${pageText} | الرابط: ${pageLink}`
    } else {
      message = `${title || "القرآن الكريم"} | الصفحات ${pageText} | الرابط: ${pageLink}`
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    // Save last shared info
    const lastSharedHTML = `
      <div class="border rounded-md p-4 mb-4 bg-card">
        <div class="grid grid-cols-2 gap-2">
          <div class="font-bold">آخر يوم مشاركة:</div>
          <div>${dayName}</div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="font-bold">التاريخ:</div>
          <div>${formattedDate}</div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="font-bold">الساعة:</div>
          <div>${formattedTime}</div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="font-bold">العنوان:</div>
          <div>${title || "القرآن الكريم"}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 border-2 border-primary p-2 rounded-md mt-2">
          <div class="font-bold">الصفحات:</div>
          <div>${pageText}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div class="font-bold">الرابط:</div>
          <div>
            <a href="${pageLink}" target="_blank" class="text-primary hover:underline">${pageLink}</a>
          </div>
        </div>
      </div>
    `

    localStorage.setItem("lastShared", lastSharedHTML)
    localStorage.setItem("lastSharedPages", pageText)

    setLastShared(lastSharedHTML)
    setLastSharedPages(pageText)
  }

  // Get today's date in Arabic
  const getTodayInfo = () => {
    const now = new Date()
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = days[now.getDay()]

    const formattedDate = now.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return { dayName, formattedDate }
  }

  const { dayName, formattedDate } = getTodayInfo()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">صفحات القرآن الكريم</h1>
        <p className="text-muted-foreground">مشاركة صفحات القرآن الكريم عبر واتساب وغيرها من التطبيقات</p>
      </div>

      {/* Today's Info */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{dayName}</div>
              <div className="text-lg">{formattedDate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Selection */}
      <Card className="bg-gradient-to-br from-background to-muted/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-primary">اختر الصفحات</span>
          </CardTitle>
          {lastSharedPages && (
            <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/20">
              <p className="text-sm text-primary">آخر صفحات تمت مشاركتها: {lastSharedPages}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedPageIndex.toString()}
              onValueChange={(value) => handlePageSelect(Number.parseInt(value))}
            >
              <SelectTrigger className="bg-card border-primary/20">
                <SelectValue placeholder="اختر الصفحات" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-72">
                  {pages.map((page, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {page.text}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={selectedPageIndex === 0}
                className="border-primary/20 hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(1)}
                disabled={selectedPageIndex === pages.length - 1}
                className="border-primary/20 hover:bg-primary/10"
              >
                التالي
                <ChevronLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Count Settings */}
      <Card className="bg-gradient-to-bl from-background to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">
              #
            </span>
            عدد الصفحات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={pageCount} onValueChange={handlePageCountChange}>
            <SelectTrigger className="bg-card border-primary/20">
              <SelectValue placeholder="اختر عدد الصفحات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 صفحة</SelectItem>
              <SelectItem value="2">2 صفحات</SelectItem>
              <SelectItem value="3">3 صفحات</SelectItem>
              <SelectItem value="4">4 صفحات</SelectItem>
              <SelectItem value="5">5 صفحات</SelectItem>
              <SelectItem value="6">6 صفحات</SelectItem>
              <SelectItem value="7">7 صفحات</SelectItem>
              <SelectItem value="8">8 صفحات</SelectItem>
              <SelectItem value="9">9 صفحات</SelectItem>
              <SelectItem value="10">10 صفحات</SelectItem>
              <SelectItem value="20">20 صفحة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Title Input */}
      <Card className="bg-gradient-to-tr from-background to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">
              أ
            </span>
            عنوان المشاركة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="اكتب عنوان هنا..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card border-primary/20"
          />
        </CardContent>
      </Card>

      {/* Share Button */}
      <Button
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
        size="lg"
        onClick={shareOnWhatsApp}
      >
        <Share2 className="ml-2 h-5 w-5" />
        مشاركة على واتساب
      </Button>

      {/* Last Shared */}
      {lastShared && (
        <Card className="bg-gradient-to-tl from-background to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              آخر صفحة تمت مشاركتها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: lastShared }} />
          </CardContent>
        </Card>
      )}

      <ScrollToTopButton />
    </div>
  )
}

