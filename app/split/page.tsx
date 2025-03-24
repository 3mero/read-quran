"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Calendar } from "lucide-react"
import { useTheme } from "next-themes"
import { ScrollToTopButton } from "@/components/scroll-to-top"

export default function SplitPage() {
  const [pagesPerDay, setPagesPerDay] = useState(3)
  const [startPage, setStartPage] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [numDays, setNumDays] = useState("")
  const [dateDropdown, setDateDropdown] = useState("")
  const [showResults, setShowResults] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split("T")[0]
    setStartDate(today)
  }, [])

  const generateDateDropdown = () => {
    const totalPages = 604

    if (isNaN(pagesPerDay) || isNaN(startPage) || !startDate || startPage < 1 || startPage > totalPages) {
      alert("يرجى إدخال قيم صحيحة لجميع الحقول.")
      return
    }

    const parsedNumDays = Number.parseInt(numDays) || Math.ceil((totalPages - startPage + 1) / pagesPerDay)
    let currentPage = startPage
    const currentStartDate = new Date(startDate)
    let currentMonth = ""
    let result = ""

    for (let i = 0; i < parsedNumDays && currentPage <= totalPages; i++) {
      const endPage = Math.min(currentPage + pagesPerDay - 1, totalPages)
      const dateString = currentStartDate.toLocaleDateString("ar-LY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const monthYear = currentStartDate.toLocaleDateString("ar-LY", {
        year: "numeric",
        month: "long",
      })

      if (monthYear !== currentMonth) {
        if (currentMonth !== "") {
          result += `<div class="month-separator" data-month="${monthYear}"></div>`
        }
        currentMonth = monthYear
      }

      result += `<div>${dateString}: الصفحات ${currentPage} - ${endPage}</div>`

      currentPage = endPage + 1
      currentStartDate.setDate(currentStartDate.getDate() + 1)
    }

    setDateDropdown(result)
    setShowResults(true)
  }

  const copyDates = () => {
    if (!dateDropdown) {
      alert("لا يوجد بيانات لنسخها.")
      return
    }

    // Convert HTML to plain text
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = dateDropdown

    let formattedText = "تقسيم الصفحات:\n\n"
    const currentMonth = ""

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.className === "month-separator") {
        formattedText += "\n" + "=".repeat(20) + "\n"
        formattedText += node.getAttribute("data-month") + "\n"
        formattedText += "=".repeat(20) + "\n\n"
      } else if (node.textContent) {
        formattedText += node.textContent + "\n"
      }
    })

    navigator.clipboard
      .writeText(formattedText)
      .then(() => {
        alert("تم النسخ بنجاح!")
      })
      .catch((err) => {
        console.error("حدث خطأ أثناء النسخ: ", err)
        alert("حدث خطأ أثناء النسخ. يرجى المحاولة مرة أخرى.")
      })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">تقسيم صفحات القرآن الكريم</h1>
        <p className="text-muted-foreground">قم بإنشاء جدول قراءة للقرآن الكريم</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            إعدادات التقسيم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pages-per-day">عدد الصفحات لكل يوم:</Label>
              <Input
                id="pages-per-day"
                type="number"
                min="1"
                value={pagesPerDay}
                onChange={(e) => setPagesPerDay(Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-page">بداية العرض من الصفحة:</Label>
              <Input
                id="start-page"
                type="number"
                min="1"
                max="604"
                value={startPage}
                onChange={(e) => setStartPage(Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">تاريخ البدء:</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-days">عدد الأيام (في حال عدم التحديد سيتم عرض 604 صفحة لكامل المصحف):</Label>
              <Input id="num-days" type="number" min="1" value={numDays} onChange={(e) => setNumDays(e.target.value)} />
            </div>

            <Button className="w-full" onClick={generateDateDropdown}>
              <Calendar className="ml-2 h-4 w-4" />
              عرض التقسيم
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج التقسيم</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 border rounded-md p-4">
              <div className="space-y-2 text-right" dangerouslySetInnerHTML={{ __html: dateDropdown }} />
            </ScrollArea>

            <Button className="w-full mt-4" onClick={copyDates}>
              <Copy className="ml-2 h-4 w-4" />
              نسخ إلى الحافظة
            </Button>
          </CardContent>
        </Card>
      )}

      <ScrollToTopButton />
    </div>
  )
}

