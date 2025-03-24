"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Copy, AlertCircle, History, X, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollToTopButton } from "@/components/scroll-to-top"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { quranData, quranTashkeelData } from "@/lib/quran-search-data"
import DB from "@/lib/db"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchWithTashkeel, setSearchWithTashkeel] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [expandedVerses, setExpandedVerses] = useState({})
  const suggestionsRef = useRef(null)
  const recentSearchesRef = useRef(null)
  const { toast } = useToast()

  // Parse Quran data
  const quranXMLDoc = useRef(null)
  const quranTashkeelXMLDoc = useRef(null)

  useEffect(() => {
    // Initialize data only on client side
    if (typeof window !== "undefined") {
      const parser = new DOMParser()
      quranXMLDoc.current = parser.parseFromString(quranData, "text/xml")
      quranTashkeelXMLDoc.current = parser.parseFromString(quranTashkeelData, "text/xml")

      // Load saved settings
      const settings = DB.getSearchSettings()
      setSearchWithTashkeel(settings?.withTashkeel || false)

      // Load recent searches
      setRecentSearches(DB.getRecentSearches() || [])

      // Load last search results if available
      const lastResults = DB.getLastSearchResults()
      if (lastResults?.results && lastResults.results.length > 0) {
        setSearchResults(lastResults.results)
        setTotalResults(lastResults.total || 0)
        setSearchTerm(lastResults.term || "")
      }
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
      if (recentSearchesRef.current && !recentSearchesRef.current.contains(event.target)) {
        setShowRecentSearches(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    DB.saveSearchSettings({ withTashkeel: searchWithTashkeel })
  }, [searchWithTashkeel])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length >= 2) {
      generateSuggestions(value)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const generateSuggestions = (term) => {
    if (!quranXMLDoc.current) return

    const suggestions = []
    const suras = quranXMLDoc.current.getElementsByTagName("sura")

    for (let i = 0; i < suras.length; i++) {
      const ayas = suras[i].getElementsByTagName("aya")
      for (let j = 0; j < ayas.length; j++) {
        const ayaText = ayas[j].getAttribute("text")
        if (ayaText.includes(term)) {
          suggestions.push(ayaText)
          if (suggestions.length >= 5) break // Only show 5 suggestions
        }
      }
      if (suggestions.length >= 5) break
    }

    setSuggestions(suggestions)
  }

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    searchQuran(suggestion)
  }

  const selectRecentSearch = (term) => {
    setSearchTerm(term)
    setShowRecentSearches(false)
    searchQuran(term)
  }

  const clearRecentSearch = (e, term) => {
    e.stopPropagation()
    const updated = recentSearches.filter((item) => item !== term)
    setRecentSearches(updated)
    DB.set("quran_recent_searches", updated)
  }

  const searchQuran = (overrideTerm = null) => {
    const termToSearch = overrideTerm || searchTerm

    if (!termToSearch.trim()) {
      toast({
        title: "الرجاء إدخال كلمة للبحث",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSearchResults([])
    setTotalResults(0)
    setExpandedVerses({})

    // Save to recent searches
    DB.saveRecentSearch(termToSearch)
    setRecentSearches(DB.getRecentSearches())

    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(() => {
      performSearch(termToSearch)
    }, 100)
  }

  const performSearch = (term) => {
    if (!quranXMLDoc.current || !quranTashkeelXMLDoc.current) {
      setIsLoading(false)
      return
    }

    const suras = quranXMLDoc.current.getElementsByTagName("sura")
    const surasTashkeel = quranTashkeelXMLDoc.current.getElementsByTagName("sura")
    let total = 0
    const results = []

    for (let i = 0; i < suras.length; i++) {
      const suraIndex = suras[i].getAttribute("index")
      const suraName = suras[i].getAttribute("name")
      const ayas = suras[i].getElementsByTagName("aya")

      const suraResults = []

      for (let j = 0; j < ayas.length; j++) {
        const ayaIndex = ayas[j].getAttribute("index")
        const ayaText = ayas[j].getAttribute("text")
        const bismillah = ayas[j].getAttribute("bismillah")

        if (ayaText.indexOf(term) !== -1) {
          // Get the verse with tashkeel if needed
          const ayaTashkeel = getAyaWithTashkeel(suraIndex, ayaIndex, surasTashkeel)

          // Get next verses (up to 5)
          const nextVerses = []
          for (let k = 1; k <= 5; k++) {
            if (j + k < ayas.length) {
              const nextAyaIndex = ayas[j + k].getAttribute("index")
              const nextAyaText = searchWithTashkeel
                ? getAyaWithTashkeel(suraIndex, nextAyaIndex, surasTashkeel)
                : ayas[j + k].getAttribute("text")

              nextVerses.push({
                ayaIndex: nextAyaIndex,
                ayaText: nextAyaText,
              })
            }
          }

          suraResults.push({
            ayaIndex,
            ayaText: searchWithTashkeel ? ayaTashkeel : ayaText,
            bismillah,
            nextVerses,
          })

          total++
        }
      }

      if (suraResults.length > 0) {
        results.push({
          suraIndex,
          suraName,
          results: suraResults,
        })
      }
    }

    setSearchResults(results)
    setTotalResults(total)
    setIsLoading(false)

    // Save search results
    DB.saveLastSearchResults({
      term,
      results,
      total,
    })
  }

  const getAyaWithTashkeel = (suraIndex, ayaIndex, surasTashkeel) => {
    for (let i = 0; i < surasTashkeel.length; i++) {
      if (surasTashkeel[i].getAttribute("index") === suraIndex) {
        const ayas = surasTashkeel[i].getElementsByTagName("aya")
        for (let j = 0; j < ayas.length; j++) {
          if (ayas[j].getAttribute("index") === ayaIndex) {
            return ayas[j].getAttribute("text")
          }
        }
      }
    }
    return ""
  }

  const highlightSearchTerm = (text, term) => {
    if (!text) return ""

    const parts = text.split(new RegExp(`(${term})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="bg-primary/30 text-primary-foreground font-bold px-1 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "تم نسخ الآية بنجاح",
          description: "تم نسخ النص إلى الحافظة",
        })
      })
      .catch((err) => {
        toast({
          title: "فشل في النسخ",
          description: "حدث خطأ أثناء محاولة النسخ",
          variant: "destructive",
        })
      })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchQuran()
    }
  }

  const toggleVerseExpansion = (suraIdx, resultIdx, level) => {
    const key = `${suraIdx}-${resultIdx}`
    setExpandedVerses((prev) => ({
      ...prev,
      [key]: level,
    }))
  }

  const hasSearchResults = searchResults.length > 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">البحث في القرآن الكريم</h1>
        <p className="text-muted-foreground">ابحث عن كلمة أو جملة في القرآن الكريم</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="flex">
                <div className="relative flex-1">
                  <Input
                    placeholder="ادخل كلمة للبحث..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                    onFocus={() => {
                      if (recentSearches.length > 0) {
                        setShowRecentSearches(true)
                      }
                    }}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {recentSearches.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-2"
                    onClick={() => setShowRecentSearches(!showRecentSearches)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {highlightSearchTerm(suggestion, searchTerm)}
                    </div>
                  ))}
                </div>
              )}

              {showRecentSearches && recentSearches.length > 0 && (
                <div
                  ref={recentSearchesRef}
                  className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg"
                >
                  <div className="p-2 border-b bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">عمليات البحث الأخيرة</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowRecentSearches(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      onClick={() => selectRecentSearch(term)}
                    >
                      <span>{term}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => clearRecentSearch(e, term)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox id="searchWithTashkeel" checked={searchWithTashkeel} onCheckedChange={setSearchWithTashkeel} />
              <Label htmlFor="searchWithTashkeel">البحث بالتشكيل</Label>
            </div>

            <Button onClick={() => searchQuran()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="ml-2 h-4 w-4" />
                  بحث
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">جاري البحث...</p>
            </div>
          </CardContent>
        </Card>
      ) : hasSearchResults ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10">
                  تم العثور على {totalResults} نتيجة في {searchResults.length} سورة
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipContent>
                      <p>انقر على زر النسخ بجانب الآية لنسخها</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {searchResults.map((sura, suraIdx) => (
            <Card key={suraIdx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-xl">
                  سورة {sura.suraName} ({sura.suraIndex})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sura.results.map((result, resultIdx) => {
                  const key = `${suraIdx}-${resultIdx}`
                  const expansionLevel = expandedVerses[key] || 0

                  return (
                    <div key={resultIdx} className="border rounded-md overflow-hidden">
                      {result.bismillah && (
                        <div className="text-center p-2 bg-primary/5 text-primary font-bold border-b">
                          {result.bismillah}
                        </div>
                      )}

                      <div className="p-4 bg-card">
                        {/* Main verse */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="default">آية {result.ayaIndex}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.ayaText)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <p className="text-lg leading-relaxed">{highlightSearchTerm(result.ayaText, searchTerm)}</p>
                        </div>

                        {/* Next verses */}
                        {result.nextVerses.length > 0 && expansionLevel > 0 && (
                          <div className="mt-4 pt-3 border-t">
                            {result.nextVerses.slice(0, expansionLevel).map((verse, idx) => (
                              <div key={idx} className="mb-4 pt-3 border-t first:border-t-0 first:pt-0">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge variant="outline">آية {verse.ayaIndex}</Badge>
                                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(verse.ayaText)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-lg leading-relaxed">{verse.ayaText}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between mt-4">
                          {expansionLevel > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleVerseExpansion(suraIdx, resultIdx, Math.max(0, expansionLevel - 1))}
                            >
                              <ChevronRight className="h-4 w-4 ml-1" />
                              الآية السابقة
                            </Button>
                          )}

                          {result.nextVerses.length > expansionLevel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleVerseExpansion(suraIdx, resultIdx, expansionLevel + 1)}
                              className={expansionLevel === 0 ? "mx-auto" : ""}
                            >
                              {expansionLevel === 0 ? "عرض الآية التالية" : "الآية التالية"}
                              <ChevronLeft className="h-4 w-4 mr-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchTerm && !isLoading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <p className="text-lg">لا توجد نتائج للبحث</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <ScrollToTopButton />
    </div>
  )
}

