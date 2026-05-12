import { useState, useMemo } from "react";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { specialtyNews, type NewsItem } from "@/mocks/news";

const currentDoctorSpecialty = "Kardiologiya";

function NewsCard({
  news,
  darkMode,
  onClick,
}: {
  news: NewsItem;
  darkMode: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        darkMode
          ? "bg-[#161B22] border border-[#1C2333] hover:border-green-500/40 hover:shadow-lg hover:shadow-green-900/10"
          : "bg-white border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-100/50"
      }`}
    >
      {news.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {news.isNew && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                Yangi
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
              {news.category}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3
          className={`text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-green-500 transition-colors ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {news.title}
        </h3>
        <p
          className={`text-xs leading-relaxed line-clamp-3 mb-3 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {news.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {news.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                darkMode
                  ? "bg-[#1C2333] text-green-400"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {news.source}
            </span>
            <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>|</span>
            <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {news.publishedAt}
            </span>
          </div>
          <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            <i className="ri-time-line mr-1" />
            {news.readTime}
          </span>
        </div>
      </div>
    </div>
  );
}

function NewsDetailModal({
  news,
  darkMode,
  onClose,
}: {
  news: NewsItem;
  darkMode: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          darkMode ? "bg-[#161B22] border border-[#1C2333]" : "bg-white border border-gray-100"
        }`}
      >
        {news.imageUrl && (
          <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-t-2xl">
            <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <i className="ri-close-line" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                {news.isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                    Yangi
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-gray-700">
                  {news.category}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          {!news.imageUrl && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {news.isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                    Yangi
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    darkMode ? "bg-[#1C2333] text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {news.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  darkMode ? "hover:bg-[#1C2333] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <i className="ri-close-line" />
              </button>
            </div>
          )}

          <h2 className={`text-lg sm:text-xl font-bold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            {news.title}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <i className="ri-newspaper-line mr-1" />{news.source}
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <i className="ri-calendar-line mr-1" />{news.publishedAt}
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <i className="ri-time-line mr-1" />{news.readTime}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                  darkMode ? "bg-[#1C2333] text-green-400" : "bg-green-50 text-green-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className={`text-sm leading-relaxed whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {news.content}
          </div>

          <div className={`mt-6 pt-4 border-t border-dashed ${darkMode ? "border-[#1C2333]" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <i className="ri-stethoscope-line text-green-500 text-sm" />
              <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Mutaxassislik: <span className="font-medium">{news.specialty}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocNewsContent() {
  const { darkMode } = useDoctorTheme();
  const { user } = useAuth();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [timeFilter, setTimeFilter] = useState("Barchasi");

  const doctorName = user?.name?.trim() || "Dr. Alisher Karimov";
  const doctorNews = specialtyNews[currentDoctorSpecialty] || [];

  const filteredNews = useMemo(() => {
    let filtered = [...doctorNews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory !== "Barchasi") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    const today = new Date();
    if (timeFilter === "Hafta") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((n) => new Date(n.publishedAt) >= weekAgo);
    } else if (timeFilter === "Oy") {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      filtered = filtered.filter((n) => new Date(n.publishedAt) >= monthAgo);
    }

    return filtered;
  }, [doctorNews, searchQuery, selectedCategory, timeFilter]);

  const newCount = doctorNews.filter((n) => n.isNew).length;

  const availableCategories = useMemo(() => {
    const cats = new Set(doctorNews.map((n) => n.category));
    return ["Barchasi", ...Array.from(cats)];
  }, [doctorNews]);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div
        className={`relative rounded-2xl overflow-hidden mb-6 ${
          darkMode ? "bg-gradient-to-r from-violet-900/30 to-emerald-900/20" : "bg-gradient-to-r from-violet-50 to-emerald-50"
        }`}
      >
        <div className="relative p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <i className="ri-article-line text-white text-lg" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {currentDoctorSpecialty} Yangiliklari
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {doctorName} uchun maxsus tanlangan
              </p>
            </div>
            {newCount > 0 && (
              <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                {newCount} ta yangi
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                darkMode ? "bg-[#161B22] text-gray-300" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <i className="ri-file-list-3-line text-violet-500" />
              {doctorNews.length} ta maqola
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                darkMode ? "bg-[#161B22] text-gray-300" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <i className="ri-flashlight-line text-amber-500" />
              {newCount} ta yangi
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                darkMode ? "bg-[#161B22] text-gray-300" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <i className="ri-bookmark-3-line text-emerald-500" />
              {availableCategories.length - 1} ta kategoriya
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className={`ri-search-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${
              darkMode
                ? "bg-[#161B22] border border-[#1C2333] text-white placeholder-gray-600 focus:border-green-500/50"
                : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-300"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
            >
              <i className={`ri-close-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${
            darkMode
              ? "bg-[#161B22] border border-[#1C2333] text-white focus:border-green-500/50"
              : "bg-white border border-gray-200 text-gray-700 focus:border-green-300"
          }`}
          style={{ backgroundImage: "none" }}
        >
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-[#1C2333]" : "border-gray-200"}`}>
          {["Barchasi", "Hafta", "Oy"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                timeFilter === t
                  ? "bg-green-600 text-white"
                  : darkMode
                  ? "bg-[#161B22] text-gray-400 hover:text-white"
                  : "bg-white text-gray-500 hover:text-gray-900"
              }`}
            >
              {t === "Hafta" ? "So'nggi hafta" : t === "Oy" ? "So'nggi oy" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {filteredNews.length} ta natija topildi
        </p>
      </div>

      {/* News grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              darkMode={darkMode}
              onClick={() => setSelectedNews(news)}
            />
          ))}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center py-16 rounded-2xl ${
            darkMode ? "bg-[#161B22] border border-[#1C2333]" : "bg-white border border-gray-100"
          }`}
        >
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#1C2333]" : "bg-gray-100"}`}>
            <i className={`ri-article-line text-2xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
          </div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Yangiliklar topilmadi
          </p>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Boshqa filter yoki qidiruv so'zini sinab ko'ring
          </p>
        </div>
      )}

      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          darkMode={darkMode}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </div>
  );
}

export default function DocNewsPage() {
  return <DocNewsContent />;
}
