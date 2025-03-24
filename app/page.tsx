import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Layers, Split, Share2, Search } from "lucide-react"
import { InstallAppDialog } from "@/components/install-app-dialog"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/quran-fhIkpA3vVePtHjOcmq3w0eqZi9Ngsk.png"
            alt="القرآن الكريم"
            width={150}
            height={150}
            className="animate-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">تطبيق القرآن الكريم</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          تطبيق متكامل لإدارة قراءة القرآن الكريم، متابعة الأحزاب والأجزاء، تقسيم الصفحات، ومشاركة الصفحات
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        <Card className="border-primary/20 hover:border-primary transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>الأحزاب والأجزاء</span>
            </CardTitle>
            <CardDescription>إدارة ومتابعة الأحزاب والأجزاء التي قرأتها</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              تتبع تقدمك في قراءة القرآن الكريم من خلال إدارة الأحزاب والأجزاء، مع إمكانية تسجيل الملاحظات وتتبع
              الإنجازات.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/ahzab" className="w-full">
              <Button className="w-full">
                <BookOpen className="ml-2 h-4 w-4" />
                فتح صفحة الأحزاب
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 hover:border-primary transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <span>صفحات القرآن (604)</span>
            </CardTitle>
            <CardDescription>مشاركة صفحات القرآن الكريم</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              اختر صفحات محددة من القرآن الكريم ومشاركتها مع الآخرين عبر تطبيق واتساب أو غيره من وسائل التواصل.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/pages" className="w-full">
              <Button className="w-full">
                <Share2 className="ml-2 h-4 w-4" />
                فتح صفحة المشاركة
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 hover:border-primary transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Split className="h-5 w-5 text-primary" />
              <span>تقسيم الصفحات</span>
            </CardTitle>
            <CardDescription>تقسيم صفحات القرآن على أيام وأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              قم بإنشاء جدول قراءة للقرآن الكريم من خلال تقسيم الصفحات على الأيام والأشهر حسب رغبتك.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/split" className="w-full">
              <Button className="w-full">
                <Split className="ml-2 h-4 w-4" />
                فتح صفحة التقسيم
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 hover:border-primary transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span>البحث في القرآن</span>
            </CardTitle>
            <CardDescription>البحث عن كلمة أو جملة في القرآن الكريم</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ابحث عن أي كلمة أو جملة في القرآن الكريم، مع إمكانية البحث بالتشكيل أو بدونه، وعرض نتائج البحث مع السياق.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/search" className="w-full">
              <Button className="w-full">
                <Search className="ml-2 h-4 w-4" />
                فتح صفحة البحث
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <InstallAppDialog />
      </div>
    </div>
  )
}

