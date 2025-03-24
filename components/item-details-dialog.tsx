"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Book, FileText, Hash, AlignJustify } from "lucide-react"
import { hizbData, juzData } from "@/lib/quran-data"
import { useState } from "react"

interface ItemDetailsDialogProps {
  item: {
    number: number
  }
  mode: "hizb" | "juz"
}

export function ItemDetailsDialog({ item, mode }: ItemDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getItemDetails = () => {
    if (mode === "hizb") {
      return {
        الحزب: item.number,
        السورة: hizbData.surahs[item.number] || "غير محدد",
        "رقم الصفحة": hizbData.pages[item.number] || "غير محدد",
        "رقم الآية": hizbData.verses[item.number] || "غير محدد",
        "من الآية": hizbData.texts[item.number] || "غير محدد",
      }
    } else {
      return {
        الجزء: item.number,
        السورة: juzData.surahs[item.number] || "غير محدد",
        "رقم الصفحة": juzData.pages[item.number] || "غير محدد",
        "رقم الآية": juzData.verses[item.number] || "غير محدد",
        "من الآية": juzData.texts[item.number] || "غير محدد",
      }
    }
  }

  const details = getItemDetails()

  const getIcon = (key: string) => {
    switch (key) {
      case "الحزب":
      case "الجزء":
        return <Hash className="h-5 w-5 text-primary" />
      case "السورة":
        return <Book className="h-5 w-5 text-primary" />
      case "رقم الصفحة":
        return <FileText className="h-5 w-5 text-primary" />
      case "رقم الآية":
        return <Hash className="h-5 w-5 text-primary" />
      case "من الآية":
        return <AlignJustify className="h-5 w-5 text-primary" />
      default:
        return <AlertCircle className="h-5 w-5 text-primary" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <AlertCircle className="h-4 w-4 ml-1" />
          تفاصيل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            تفاصيل {mode === "hizb" ? "الحزب" : "الجزء"} {item.number}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/20 rounded-lg p-4 space-y-3">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 font-bold text-primary min-w-[120px]">
                  {getIcon(key)}
                  <span>{key}:</span>
                </div>
                <div className="flex-1">{value}</div>
              </div>
            ))}
          </div>

          {mode === "hizb" && (
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-sm font-bold mb-2 text-primary">معلومات إضافية:</p>
              <p className="text-sm">الحزب هو جزء من 60 جزءًا من القرآن الكريم، ويساوي نصف جزء من الأجزاء الثلاثين.</p>
              <p className="text-sm mt-2">
                يبدأ الحزب {item.number} من سورة {details.السورة} عند الآية المذكورة أعلاه.
              </p>
            </div>
          )}

          {mode === "juz" && (
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-sm font-bold mb-2 text-primary">معلومات إضافية:</p>
              <p className="text-sm">
                الجزء هو واحد من 30 جزءًا متساويًا تقريبًا من القرآن الكريم، ويحتوي كل جزء على حزبين.
              </p>
              <p className="text-sm mt-2">
                يبدأ الجزء {item.number} من سورة {details.السورة} عند الآية المذكورة أعلاه.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>إغلاق</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

