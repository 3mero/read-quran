"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X, Layers, Split, Share2, Home, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: <Home className="h-4 w-4" /> },
    { href: "/ahzab", label: "الأحزاب والأجزاء", icon: <Layers className="h-4 w-4" /> },
    { href: "/pages", label: "صفحات القرآن", icon: <Share2 className="h-4 w-4" /> },
    { href: "/split", label: "تقسيم الصفحات", icon: <Split className="h-4 w-4" /> },
    { href: "/search", label: "البحث في القرآن", icon: <Search className="h-4 w-4" /> },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/quran-UXYAgBXPhQSjOQWl38RF8yFDxrFAqd.png"
                alt="القرآن الكريم"
                width={32}
                height={32}
              />
              <span className="font-bold text-lg">القرآن الكريم</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <ModeToggle />
          </div>

          <div className="flex md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" className="ml-2" onClick={toggleMenu} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={closeMenu}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

