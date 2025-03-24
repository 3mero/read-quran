"use client"

// تحديث استيراد المكونات والمكتبات
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Share2,
  Mic,
  Save,
  X,
  Play,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react"
import { hizbData, juzData } from "@/lib/quran-data"
import { ScrollToTopButton } from "@/components/scroll-to-top"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { ItemDetailsDialog } from "@/components/item-details-dialog"

export default function AhzabPage() {
  const [currentMode, setCurrentMode] = useState("hizb")
  const [isSettingsVisible, setIsSettingsVisible] = useState(true)
  const [isStatisticsVisible, setIsStatisticsVisible] = useState(true)
  const [fromInput, setFromInput] = useState(1)
  const [toInput, setToInput] = useState(currentMode === "hizb" ? 60 : 30)
  const [firstDay, setFirstDay] = useState("الأحد")
  const [searchTerm, setSearchTerm] = useState("")
  const [itemsData, setItemsData] = useState({
    hizb: [],
    juz: [],
  })
  const [hiddenItems, setHiddenItems] = useState([])
  const [selectedHiddenItem, setSelectedHiddenItem] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [activeRecordingItem, setActiveRecordingItem] = useState(null)
  const [editingNoteItem, setEditingNoteItem] = useState(null)
  const [noteText, setNoteText] = useState("")
  const [editingAudioNote, setEditingAudioNote] = useState({ itemIndex: null, noteIndex: null })
  const [audioNoteTitle, setAudioNoteTitle] = useState("")
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [expandedItems, setExpandedItems] = useState({})
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    loadData()

    // Load saved settings
    const savedMode = localStorage.getItem("currentMode")
    if (savedMode) {
      setCurrentMode(savedMode)
    }

    const savedSettingsVisibility = JSON.parse(localStorage.getItem("isSettingsVisible"))
    if (savedSettingsVisibility !== null) {
      setIsSettingsVisible(savedSettingsVisibility)
    }

    const savedStatisticsVisibility = JSON.parse(localStorage.getItem("isStatisticsVisible"))
    if (savedStatisticsVisibility !== null) {
      setIsStatisticsVisible(savedStatisticsVisibility)
    }

    // التحقق من دعم الميكروفون
    const checkMicrophoneSupport = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const hasMicrophone = devices.some((device) => device.kind === "audioinput")

          if (!hasMicrophone) {
            console.warn("No microphone detected on this device")
          }
        }
      } catch (err) {
        console.error("Error checking microphone support:", err)
      }
    }

    checkMicrophoneSupport()
  }, [])

  // Update input limits when mode changes
  useEffect(() => {
    setToInput(currentMode === "hizb" ? 60 : 30)
  }, [currentMode])

  // Update progress percentage when data changes
  useEffect(() => {
    const currentItems = itemsData[currentMode]
    if (currentItems.length > 0) {
      const completedCount = currentItems.filter((item) => item.completed).length
      setProgressPercentage(Math.round((completedCount / currentItems.length) * 100))
    } else {
      setProgressPercentage(0)
    }
  }, [itemsData, currentMode])

  const loadData = () => {
    const hizbItems = JSON.parse(localStorage.getItem("hizbData")) || []
    const juzItems = JSON.parse(localStorage.getItem("juzData")) || []

    setItemsData({
      hizb: hizbItems,
      juz: juzItems,
    })

    // Update hidden items list
    updateHiddenItemsList(currentMode === "hizb" ? hizbItems : juzItems)
  }

  const updateHiddenItemsList = (items) => {
    const hidden = items
      .filter((item) => item.hidden)
      .map((item) => ({
        number: item.number,
        label: `${currentMode === "hizb" ? "حزب" : "جزء"} ${item.number}`,
      }))
    setHiddenItems(hidden)
  }

  const saveData = () => {
    localStorage.setItem("hizbData", JSON.stringify(itemsData.hizb))
    localStorage.setItem("juzData", JSON.stringify(itemsData.juz))
    localStorage.setItem("currentMode", currentMode)
    localStorage.setItem("isSettingsVisible", JSON.stringify(isSettingsVisible))
    localStorage.setItem("isStatisticsVisible", JSON.stringify(isStatisticsVisible))

    // Update hidden items list
    updateHiddenItemsList(itemsData[currentMode])
  }

  const handleModeChange = (value) => {
    setCurrentMode(value)
    localStorage.setItem("currentMode", value)

    // Update hidden items list for the new mode
    updateHiddenItemsList(itemsData[value])
  }

  const generateItems = () => {
    if (fromInput < 1 || toInput > (currentMode === "hizb" ? 60 : 30) || fromInput > toInput) {
      toast({
        title: "خطأ في النطاق",
        description: "يرجى إدخال نطاق صحيح.",
        variant: "destructive",
      })
      return
    }

    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    let currentDayIndex = days.indexOf(firstDay)

    const newItems = []
    for (let i = fromInput; i <= toInput; i++) {
      newItems.push({
        number: i,
        day: days[currentDayIndex],
        completed: false,
        completedTime: null,
        note: null,
        color: "#1e1e2f",
        hidden: false,
        audioNotes: [],
      })
      currentDayIndex = (currentDayIndex + 1) % days.length
    }

    setItemsData({
      ...itemsData,
      [currentMode]: newItems,
    })

    // Save to localStorage after state update
    setTimeout(() => {
      saveData()
      toast({
        title: "تم التوليد بنجاح",
        description: `تم توليد ${newItems.length} ${currentMode === "hizb" ? "حزب" : "جزء"}.`,
      })
    }, 0)
  }

  const resetData = () => {
    if (confirm("هل أنت متأكد من تهيئة الصفحة؟ سيتم حذف جميع البيانات.")) {
      localStorage.removeItem("hizbData")
      localStorage.removeItem("juzData")
      setItemsData({
        hizb: [],
        juz: [],
      })
      setIsSettingsVisible(true)
      setIsStatisticsVisible(true)
      setHiddenItems([])
      saveData()
      toast({
        title: "تمت التهيئة",
        description: "تم حذف جميع البيانات بنجاح.",
      })
    }
  }

  const shareProgressOnWhatsApp = () => {
    const currentItems = itemsData[currentMode]
    const lastCompleted = currentItems.filter((item) => item.completed).pop()

    if (lastCompleted) {
      const date = new Date()
      const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      const dayName = days[date.getDay()]
      const formattedDate = date.toLocaleDateString()
      const formattedTime = date.toLocaleTimeString()

      // حساب عدد الأحزاب/الأجزاء المتبقية
      const totalItems = currentMode === "hizb" ? 60 : 30
      const remainingItems = totalItems - currentItems.filter((item) => item.completed).length

      const message = `تم بحمد الله وتوفيقه إكمال ${currentMode === "hizb" ? "الحزب" : "الجزء"} رقم ${lastCompleted.number}.
آخر قراءة وحفظ كان ${currentMode === "hizb" ? "الحزب" : "الجزء"} رقم ${lastCompleted.number} في يوم ${dayName}، بتاريخ ${formattedDate}، والساعة ${formattedTime}.
${currentMode === "hizb" ? "الأحزاب" : "الأجزاء"} المتبقية: ${remainingItems}.`

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    } else {
      toast({
        title: "لا توجد بيانات",
        description: "لم يتم إكمال أي حزب/جزء بعد.",
        variant: "destructive",
      })
    }
  }

  const toggleItemCompletion = (index, completed) => {
    const newItemsData = { ...itemsData }
    newItemsData[currentMode][index].completed = completed

    if (completed) {
      newItemsData[currentMode][index].completedTime = new Date().toLocaleString()
      toast({
        title: "تم الإنجاز",
        description: `تم إكمال ${currentMode === "hizb" ? "الحزب" : "الجزء"} رقم ${newItemsData[currentMode][index].number} بنجاح.`,
      })
    } else {
      newItemsData[currentMode][index].completedTime = null
    }

    setItemsData(newItemsData)
    saveData()
  }

  const toggleItemVisibility = (index) => {
    const newItemsData = { ...itemsData }
    newItemsData[currentMode][index].hidden = !newItemsData[currentMode][index].hidden
    setItemsData(newItemsData)
    saveData()

    // Show toast notification
    toast({
      title: newItemsData[currentMode][index].hidden ? "تم الإخفاء" : "تم الإظهار",
      description: `تم ${newItemsData[currentMode][index].hidden ? "إخفاء" : "إظهار"} ${currentMode === "hizb" ? "الحزب" : "الجزء"} رقم ${newItemsData[currentMode][index].number}.`,
    })
  }

  const restoreHiddenItem = () => {
    if (!selectedHiddenItem) return

    const itemNumber = Number.parseInt(selectedHiddenItem)
    const newItemsData = { ...itemsData }
    const itemIndex = newItemsData[currentMode].findIndex((item) => item.number === itemNumber)

    if (itemIndex !== -1) {
      newItemsData[currentMode][itemIndex].hidden = false
      setItemsData(newItemsData)
      saveData()
      setSelectedHiddenItem("")

      toast({
        title: "تم الاسترجاع",
        description: `تم استرجاع ${currentMode === "hizb" ? "الحزب" : "الجزء"} رقم ${itemNumber} بنجاح.`,
      })
    }
  }

  const changeItemColor = (index, color) => {
    const newItemsData = { ...itemsData }
    newItemsData[currentMode][index].color = color
    setItemsData(newItemsData)
    saveData()
  }

  const updateItemNote = (index, note) => {
    const newItemsData = { ...itemsData }
    newItemsData[currentMode][index].note = note
    setItemsData(newItemsData)
    saveData()

    toast({
      title: "تم الحفظ",
      description: "تم حفظ الملاحظة بنجاح.",
    })
  }

  // تحديث دالة startRecording لتحسين التعامل مع أذونات الميكروفون
  const startRecording = (index) => {
    if (!navigator.mediaDevices) {
      toast({
        title: "غير مدعوم",
        description: "التسجيل الصوتي غير مدعوم في هذا المتصفح.",
        variant: "destructive",
      })
      return
    }

    // إضافة خيارات صوتية محددة وتحسين التعامل مع الأخطاء
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          const audioUrl = URL.createObjectURL(audioBlob)

          // Save audio note
          saveAudioNote(index, audioUrl)

          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop())
          setIsRecording(false)
          setActiveRecordingItem(null)
        }

        mediaRecorder.start()
        setIsRecording(true)
        setActiveRecordingItem(index)

        toast({
          title: "جاري التسجيل",
          description: "بدأ التسجيل الصوتي. انقر على إيقاف عند الانتهاء.",
        })
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err)

        // تحسين رسائل الخطأ بناءً على نوع الخطأ
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast({
            title: "تم رفض الإذن",
            description: "لم يتم السماح بالوصول إلى الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.",
            variant: "destructive",
          })
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          toast({
            title: "لم يتم العثور على ميكروفون",
            description: "تأكد من توصيل ميكروفون بجهازك.",
            variant: "destructive",
          })
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          toast({
            title: "الميكروفون غير متاح",
            description: "لا يمكن الوصول إلى الميكروفون. قد يكون قيد الاستخدام من قبل تطبيق آخر.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "خطأ في التسجيل",
            description: "تعذر الوصول إلى الميكروفون. يرجى التحقق من الأذونات وإعادة المحاولة.",
            variant: "destructive",
          })
        }

        // إعادة تعيين حالة التسجيل في حالة الخطأ
        setIsRecording(false)
        setActiveRecordingItem(null)
      })
  }

  // تحديث دالة saveAudioNote لإضافة خيار لإدخال ملاحظة نصية بدلاً من الصوتية
  const saveAudioNote = (index, audioUrl) => {
    try {
      const newItemsData = { ...itemsData }
      const audioNote = {
        url: audioUrl,
        timestamp: new Date().toLocaleString(),
        title: `ملاحظة صوتية ${newItemsData[currentMode][index].audioNotes?.length + 1 || 1}`,
      }

      if (!newItemsData[currentMode][index].audioNotes) {
        newItemsData[currentMode][index].audioNotes = []
      }

      newItemsData[currentMode][index].audioNotes.unshift(audioNote)
      setItemsData(newItemsData)
      saveData()

      // إعادة تعيين المراجع والحالة
      mediaRecorderRef.current = null
      audioChunksRef.current = []

      toast({
        title: "تم التسجيل",
        description: "تم حفظ الملاحظة الصوتية بنجاح.",
      })
    } catch (error) {
      console.error("Error saving audio note:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الملاحظة الصوتية.",
        variant: "destructive",
      })
    }
  }

  // إضافة دالة لإضافة ملاحظة نصية بدلاً من الصوتية كبديل
  const addTextNoteInsteadOfAudio = (index) => {
    setEditingNoteItem(index)
    setNoteText("")

    toast({
      title: "إضافة ملاحظة نصية",
      description: "يمكنك إضافة ملاحظة نصية بدلاً من الصوتية.",
    })
  }

  // تحديث دالة stopRecording لإيقاف التسجيل بشكل نهائي
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // إيقاف جميع المسارات وتحرير الموارد
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      // إعادة تعيين المراجع والحالة
      mediaRecorderRef.current = null
      audioChunksRef.current = []
      setIsRecording(false)
      setActiveRecordingItem(null)
    }
  }

  const playAudioNote = (audioUrl) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const editAudioNoteTitle = (itemIndex, noteIndex, newTitle) => {
    const newItemsData = { ...itemsData }
    newItemsData[currentMode][itemIndex].audioNotes[noteIndex].title = newTitle
    setItemsData(newItemsData)
    saveData()

    toast({
      title: "تم التعديل",
      description: "تم تعديل عنوان الملاحظة الصوتية بنجاح.",
    })
  }

  const deleteAudioNote = (itemIndex, noteIndex) => {
    if (confirm("هل أنت متأكد من حذف هذه الملاحظة الصوتية؟")) {
      const newItemsData = { ...itemsData }
      newItemsData[currentMode][itemIndex].audioNotes.splice(noteIndex, 1)
      setItemsData(newItemsData)
      saveData()

      toast({
        title: "تم الحذف",
        description: "تم حذف الملاحظة الصوتية بنجاح.",
      })
    }
  }

  const getItemDetails = (item) => {
    if (currentMode === "hizb") {
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

  // Toggle expanded state for an item
  const toggleItemExpansion = (itemNumber) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemNumber]: !prev[itemNumber],
    }))
  }

  // Show details for an item
  const showDetails = (item) => {
    setSelectedItemForDetails(item)
    setShowDetailsDialog(true)
  }

  // Filter items based on search term
  const filteredItems = itemsData[currentMode].filter(
    (item) =>
      !item.hidden &&
      (item.number.toString().includes(searchTerm) ||
        item.day.includes(searchTerm) ||
        (item.note && item.note.includes(searchTerm))),
  )

  // Calculate statistics
  const completedCount = itemsData[currentMode].filter((item) => item.completed).length
  const totalCount = itemsData[currentMode].length
  const lastCompleted = [...itemsData[currentMode]].filter((item) => item.completed).pop()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">إدارة الأحزاب والأجزاء</h1>
        <p className="text-muted-foreground">تتبع تقدمك في قراءة وحفظ القرآن الكريم</p>
      </div>

      <Tabs defaultValue={currentMode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hizb" className="text-lg">
            الأحزاب
          </TabsTrigger>
          <TabsTrigger value="juz" className="text-lg">
            الأجزاء
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Progress Bar */}
      <Card className={`border-2 ${currentMode === "hizb" ? "border-green-500" : "border-red-500"} bg-primary/5`}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">التقدم الإجمالي</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className={`border-2 ${currentMode === "hizb" ? "border-green-500" : "border-red-500"} bg-secondary/10`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>الإحصائيات</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsStatisticsVisible(!isStatisticsVisible)}>
            {isStatisticsVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {isStatisticsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المكتمل:</span>
                  <span className="font-bold">{completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>المتبقي:</span>
                  <span className="font-bold">{totalCount - completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>النسبة المئوية:</span>
                  <span className="font-bold">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>آخر ما تم إنهاؤه:</span>
                  <span className="font-bold">
                    {lastCompleted
                      ? currentMode === "hizb"
                        ? `حزب ${lastCompleted.number}`
                        : `جزء ${lastCompleted.number}`
                      : "لا يوجد"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>وقت الإنهاء:</span>
                  <span className="font-bold">{lastCompleted?.completedTime || "لا يوجد"}</span>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={shareProgressOnWhatsApp}>
              <Share2 className="ml-2 h-4 w-4" />
              مشاركة التقدم عبر الواتساب
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Settings Section */}
      <Card className={`border-2 ${currentMode === "hizb" ? "border-green-500" : "border-red-500"} bg-muted/20`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>الإعدادات</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsSettingsVisible(!isSettingsVisible)}>
            <Settings className="h-4 w-4 ml-2" />
            {isSettingsVisible ? "إخفاء" : "إظهار"}
          </Button>
        </CardHeader>

        {isSettingsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="from">من:</Label>
                <Input
                  id="from"
                  type="number"
                  min="1"
                  max={currentMode === "hizb" ? 60 : 30}
                  value={fromInput}
                  onChange={(e) => setFromInput(Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">إلى:</Label>
                <Input
                  id="to"
                  type="number"
                  min="1"
                  max={currentMode === "hizb" ? 60 : 30}
                  value={toInput}
                  onChange={(e) => setToInput(Number.parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="first-day">اليوم الأول:</Label>
              <Select value={firstDay} onValueChange={setFirstDay}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الأحد">الأحد</SelectItem>
                  <SelectItem value="الاثنين">الاثنين</SelectItem>
                  <SelectItem value="الثلاثاء">الثلاثاء</SelectItem>
                  <SelectItem value="الأربعاء">الأربعاء</SelectItem>
                  <SelectItem value="الخميس">الخميس</SelectItem>
                  <SelectItem value="الجمعة">الجمعة</SelectItem>
                  <SelectItem value="السبت">السبت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={generateItems}>توليد</Button>
              <Button variant="destructive" onClick={resetData}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تهيئة الصفحة
              </Button>
            </div>

            {/* استرجاع العناصر المخفية */}
            {hiddenItems.length > 0 && (
              <div className="mt-4 p-3 border rounded-md bg-muted/20">
                <Label className="mb-2 block">استرجاع العناصر المخفية:</Label>
                <div className="flex gap-2">
                  <Select value={selectedHiddenItem} onValueChange={setSelectedHiddenItem}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر عنصراً لاسترجاعه" />
                    </SelectTrigger>
                    <SelectContent>
                      {hiddenItems.map((item) => (
                        <SelectItem key={item.number} value={item.number.toString()}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={restoreHiddenItem} disabled={!selectedHiddenItem}>
                    <Eye className="h-4 w-4 ml-2" />
                    استرجاع
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Search Section */}
      <Card className={`border-2 ${currentMode === "hizb" ? "border-green-500" : "border-red-500"} bg-accent/10`}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="search">بحث:</Label>
            <Input
              id="search"
              placeholder="بحث بالرقم أو اليوم أو الملاحظة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items List Section */}
      <Card className={`border-2 ${currentMode === "hizb" ? "border-green-500" : "border-red-500"} bg-card/80`}>
        <CardHeader>
          <CardTitle>{currentMode === "hizb" ? "قائمة الأحزاب" : "قائمة الأجزاء"}</CardTitle>
        </CardHeader>

        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const itemIndex = itemsData[currentMode].findIndex((i) => i.number === item.number)
                const isExpanded = expandedItems[item.number] || false

                return (
                  <div key={item.number} className="border rounded-md overflow-hidden">
                    <div className="p-4 flex justify-between items-center" style={{ backgroundColor: item.color }}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {currentMode === "hizb" ? `حزب ${item.number}` : `جزء ${item.number}`}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.day}</span>
                        {item.completed && (
                          <Badge variant="default" className="bg-green-500 text-white">
                            تم الإنهاء
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={item.color}
                          onChange={(e) => changeItemColor(itemIndex, e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer"
                          title="تغيير اللون"
                        />
                        <Button variant="ghost" size="sm" onClick={() => toggleItemExpansion(item.number)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t bg-muted/10">
                        {/* Item Actions */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Button
                            variant={item.completed ? "outline" : "default"}
                            disabled={item.completed}
                            onClick={() => toggleItemCompletion(itemIndex, true)}
                          >
                            {item.completed ? "تم الانتهاء" : "إنهاء"}
                          </Button>

                          <Button variant="outline" onClick={() => toggleItemCompletion(itemIndex, false)}>
                            تراجع
                          </Button>

                          <Button variant="outline" onClick={() => toggleItemVisibility(itemIndex)}>
                            {item.hidden ? <Eye className="h-4 w-4 ml-1" /> : <EyeOff className="h-4 w-4 ml-1" />}
                            {item.hidden ? "إظهار" : "إخفاء"}
                          </Button>

                          <ItemDetailsDialog item={item} mode={currentMode} />
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2 mt-4 border-t pt-4">
                          <Label className="font-bold">الملاحظات:</Label>
                          {editingNoteItem === itemIndex ? (
                            <div className="space-y-2">
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="أضف ملاحظة هنا..."
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    updateItemNote(itemIndex, noteText)
                                    setEditingNoteItem(null)
                                  }}
                                >
                                  <Save className="h-4 w-4 ml-1" />
                                  حفظ
                                </Button>
                                <Button variant="outline" onClick={() => setEditingNoteItem(null)}>
                                  <X className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-3 bg-muted/20 rounded-md min-h-[50px]">
                                {item.note || "لا توجد ملاحظات"}
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingNoteItem(itemIndex)
                                  setNoteText(item.note || "")
                                }}
                              >
                                {item.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Audio Notes Section */}
                        <div className="space-y-2 mt-4 border-t pt-4">
                          <div className="flex justify-between items-center">
                            <Label className="font-bold">الملاحظات الصوتية:</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {isRecording && activeRecordingItem === itemIndex ? (
                                    <Button variant="destructive" size="sm" onClick={stopRecording}>
                                      <AlertCircle className="h-4 w-4 ml-1" />
                                      إيقاف التسجيل
                                    </Button>
                                  ) : (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startRecording(itemIndex)}
                                        disabled={isRecording}
                                      >
                                        <Mic className="h-4 w-4 ml-1" />
                                        تسجيل ملاحظة صوتية
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addTextNoteInsteadOfAudio(itemIndex)}
                                        disabled={isRecording}
                                      >
                                        <Edit className="h-4 w-4 ml-1" />
                                        إضافة ملاحظة نصية
                                      </Button>
                                    </div>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>يمكنك تسجيل ملاحظة صوتية أو إضافة ملاحظة نصية</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Audio Notes List */}
                          {item.audioNotes && item.audioNotes.length > 0 ? (
                            <div className="space-y-2">
                              {item.audioNotes.map((note, noteIndex) => (
                                <div
                                  key={noteIndex}
                                  className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                                >
                                  <div>
                                    <div className="font-medium">{note.title}</div>
                                    <div className="text-xs text-muted-foreground">{note.timestamp}</div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => playAudioNote(note.url)}>
                                      <Play className="h-4 w-4" />
                                    </Button>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>تعديل عنوان الملاحظة الصوتية</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                          <div className="space-y-2">
                                            <Label htmlFor="audio-note-title">العنوان:</Label>
                                            <Input
                                              id="audio-note-title"
                                              defaultValue={note.title}
                                              onChange={(e) => setAudioNoteTitle(e.target.value)}
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <DialogClose asChild>
                                              <Button variant="outline">إلغاء</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                              <Button
                                                onClick={() => {
                                                  if (audioNoteTitle) {
                                                    editAudioNoteTitle(itemIndex, noteIndex, audioNoteTitle)
                                                    setAudioNoteTitle("")
                                                  }
                                                }}
                                              >
                                                حفظ
                                              </Button>
                                            </DialogClose>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteAudioNote(itemIndex, noteIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground p-4">لا توجد ملاحظات صوتية</div>
                          )}
                        </div>

                        {/* Completion Time */}
                        {item.completed && item.completedTime && (
                          <div className="mt-4 text-sm text-muted-foreground border-t pt-2">
                            تم الانتهاء: {item.completedTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد عناصر. قم بتوليد قائمة جديدة من الإعدادات."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ScrollToTopButton />
    </div>
  )
}

