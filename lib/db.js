// حفظ البيانات محلياً في المتصفح
const DB = {
  // حفظ البيانات
  set: (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      }
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
    return false
  },

  // استرجاع البيانات
  get: (key, defaultValue = null) => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key)
        if (item === null) return defaultValue
        return JSON.parse(item)
      }
    } catch (error) {
      console.error("Error retrieving data from localStorage:", error)
    }
    return defaultValue
  },

  // حذف البيانات
  remove: (key) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key)
        return true
      }
    } catch (error) {
      console.error("Error removing data from localStorage:", error)
    }
    return false
  },

  // حفظ إعدادات البحث
  saveSearchSettings: (settings) => {
    return DB.set("quran_search_settings", settings)
  },

  // استرجاع إعدادات البحث
  getSearchSettings: () => {
    return DB.get("quran_search_settings", { withTashkeel: false })
  },

  // حفظ عمليات البحث الأخيرة
  saveRecentSearch: (term) => {
    if (!term) return false

    try {
      const recentSearches = DB.get("quran_recent_searches", [])
      // إزالة البحث إذا كان موجوداً مسبقاً
      const filteredSearches = recentSearches.filter((search) => search !== term)
      // إضافة البحث الجديد في المقدمة
      filteredSearches.unshift(term)
      // الاحتفاظ بآخر 10 عمليات بحث فقط
      return DB.set("quran_recent_searches", filteredSearches.slice(0, 10))
    } catch (error) {
      console.error("Error saving recent search:", error)
      return false
    }
  },

  // استرجاع عمليات البحث الأخيرة
  getRecentSearches: () => {
    return DB.get("quran_recent_searches", [])
  },

  // حفظ آخر نتائج بحث
  saveLastSearchResults: (results) => {
    return DB.set("quran_last_search_results", results)
  },

  // استرجاع آخر نتائج بحث
  getLastSearchResults: () => {
    return DB.get("quran_last_search_results", {})
  },
}

export default DB

