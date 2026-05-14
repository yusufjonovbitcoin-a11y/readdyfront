import { useState, useMemo, useEffect, useCallback } from "react";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import type { NewsItem } from "@/api/types/news.types";
import {
  NEWS_GLOBAL_DEPARTMENT_KEY,
  createNewsArticle,
  deleteNewsArticle,
  fetchNewsArticles,
  groupNewsByDepartmentKey,
  updateNewsArticle,
  uploadNewsCoverImage,
} from "@/api/adapters/news.http";
import { listDepartments, type DepartmentListItemDto } from "@/api/adapters/departments.http";

const categories = [
  "Yangi tadqiqot",
  "Gen terapiya",
  "Texnologiya",
  "Farmakoterapiya",
  "Epidemiologiya",
  "Yangi dori",
  "AI texnologiya",
  "Klinik tadqiqot",
  "Neyrostimulyatsiya",
  "Biomaterial",
  "Robotik jarrohlik",
  "Regenerativ tibbiyot",
  "Preventsion tibbiyot",
  "Vaksinatsiya",
  "Skrinning",
  "Mikrobiota",
  "Digital tibbiyot",
  "Jarrohiy material",
  "Ta'lim",
  "Onkoxirurgiya",
  "Anesteziologiya",
  "Diagnostika",
  "Gormon terapiya",
  "Reproduktiv tibbiyot",
  "Platforma",
];

interface NewsFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  /** Tanlangan bo‘lim UUID; bo‘sh — umumiy yangilik */
  departmentId: string;
  specialty: string;
  /** `url` — faqat https manzil; `cloudinary` — fayl yuklash (URL maydoni bloklangan) */
  imageMode: "url" | "cloudinary";
  imageUrl: string;
  source: string;
  tags: string;
  isNew: boolean;
}

const emptyForm: NewsFormData = {
  title: "",
  summary: "",
  content: "",
  category: categories[0],
  departmentId: "",
  specialty: "Umumiy",
  imageMode: "url",
  imageUrl: "",
  source: "",
  tags: "",
  isNew: true,
};

export function AdminNewsPageContent() {
  const darkMode = useMainLayoutDarkMode();
  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>({});
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Barchasi");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormData>({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<{ specialty: string; id: string } | null>(null);
  const [showDetail, setShowDetail] = useState<NewsItem | null>(null);
  const [departments, setDepartments] = useState<DepartmentListItemDto[]>([]);

  const reloadNews = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const rows = await fetchNewsArticles();
      setNewsData(groupNewsByDepartmentKey(rows));
    } catch {
      setListError("Yangiliklar ro'yxatini yuklab bo'lmadi. Qayta urinib ko'ring.");
      setNewsData({});
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const d = await listDepartments();
        setDepartments(Array.isArray(d) ? d : []);
      } catch {
        setDepartments([]);
      }
    })();
  }, []);

  useEffect(() => {
    void reloadNews();
  }, [reloadNews]);

  const departmentFilterOptions = useMemo(
    () => ["Barchasi", NEWS_GLOBAL_DEPARTMENT_KEY, ...departments.map((d) => d.id)],
    [departments],
  );

  function departmentFilterLabel(value: string): string {
    if (value === "Barchasi") return "Barchasi";
    if (value === NEWS_GLOBAL_DEPARTMENT_KEY) return "Umumiy (barcha bo‘limlar)";
    const d = departments.find((x) => x.id === value);
    return d?.name ?? value;
  }

  const allNews = useMemo(() => {
    const items: (NewsItem & { specialtyKey: string })[] = [];
    Object.entries(newsData).forEach(([specialtyKey, list]) => {
      list.forEach((item) => items.push({ ...item, specialtyKey }));
    });
    return items;
  }, [newsData]);

  const filteredNews = useMemo(() => {
    let filtered = [...allNews];

    if (selectedDepartment !== "Barchasi") {
      if (selectedDepartment === NEWS_GLOBAL_DEPARTMENT_KEY) {
        filtered = filtered.filter((n) => !n.departmentId);
      } else {
        filtered = filtered.filter((n) => n.departmentId === selectedDepartment);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.specialty.toLowerCase().includes(q) ||
          (n.departmentName?.toLowerCase().includes(q) ?? false),
      );
    }

    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return filtered;
  }, [allNews, selectedDepartment, searchQuery]);

  const handleOpenAdd = () => {
    setSaveError(null);
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const handleOpenEdit = (item: NewsItem & { specialtyKey: string }) => {
    setSaveError(null);
    setEditingId(item.id);
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      departmentId: item.departmentId ?? "",
      specialty: item.specialty,
      imageMode: "url",
      imageUrl: item.imageUrl || "",
      source: item.source,
      tags: item.tags.join(", "),
      isNew: item.isNew,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) return;

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaveError(null);

    const selectedDept = form.departmentId.trim()
      ? departments.find((d) => d.id === form.departmentId.trim())
      : null;

    const imageUrlTrim = form.imageUrl.trim();
    if (form.imageMode === "cloudinary" && !imageUrlTrim) {
      setSaveError("«Yuklash» rejimida avval rasmni tanlang va yuklang.");
      return;
    }
    if (form.imageMode === "url" && imageUrlTrim && !/^https:\/\//i.test(imageUrlTrim)) {
      setSaveError("Rasm URL faqat https manzil bo‘lishi kerak.");
      return;
    }

    const body = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      category: form.category.trim(),
      specialty: (selectedDept?.name ?? form.specialty.trim()) || "Umumiy",
      department_id: selectedDept?.id ?? null,
      image_url: imageUrlTrim || undefined,
      source: form.source.trim() || undefined,
      tags,
      is_new: form.isNew,
      read_minutes: 5,
    };

    try {
      if (editingId) {
        await updateNewsArticle(editingId, body);
      } else {
        await createNewsArticle(body);
      }
      await reloadNews();
      setShowModal(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch {
      setSaveError("Saqlashda xatolik. Huquq yoki serverni tekshiring (faqat super admin).");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaveError(null);
    try {
      await deleteNewsArticle(deleteConfirm.id);
      await reloadNews();
      setDeleteConfirm(null);
    } catch {
      setSaveError("O'chirishda xatolik. Qayta urinib ko'ring.");
    }
  };

  const stats = useMemo(() => {
    const total = allNews.length;
    const byDept: Record<string, number> = {};
    allNews.forEach((n) => {
      byDept[n.specialtyKey] = (byDept[n.specialtyKey] || 0) + 1;
    });
    const newCount = allNews.filter((n) => n.isNew).length;
    return { total, byDept, newCount };
  }, [allNews]);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`rounded-xl p-4 ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Jami yangiliklar</p>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
        </div>
        <div className={`rounded-xl p-4 ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Yangi belgilangan</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{stats.newCount}</p>
        </div>
        {departmentFilterOptions.slice(1).map((dept) => (
          <div key={dept} className={`rounded-xl p-4 ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
            <p className={`text-xs line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {departmentFilterLabel(dept)}
            </p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {stats.byDept[dept] || 0}
            </p>
          </div>
        ))}
      </div>

      {listError && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
            darkMode ? "bg-red-950/30 text-red-200 border border-red-900/40" : "bg-red-50 text-red-800 border border-red-100"
          }`}
        >
          <span>{listError}</span>
          <button
            type="button"
            onClick={() => void reloadNews()}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer"
          >
            Qayta yuklash
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
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
                ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50"
                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"
            }`}
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${
            darkMode
              ? "bg-[#0F1117] border border-[#30363D] text-white focus:border-emerald-500/50"
              : "bg-gray-50 border border-gray-200 text-gray-700 focus:border-emerald-300"
          }`}
          style={{ backgroundImage: "none" }}
        >
          {departmentFilterOptions.map((d) => (
            <option key={d} value={d}>
              {departmentFilterLabel(d)}
            </option>
          ))}
        </select>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line text-sm" />
          </div>
          Yangilik qo'shish
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {listLoading ? "Yuklanmoqda…" : `${filteredNews.length} ta natija topildi`}
        </p>
      </div>

      {/* News table */}
      {listLoading ? (
        <div
          className={`flex flex-col items-center justify-center py-16 rounded-2xl ${darkMode ? "bg-[#21262D]" : "bg-white"}`}
        >
          <i className={`ri-loader-4-line text-3xl animate-spin mb-3 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`} />
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Yangiliklar yuklanmoqda…</p>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rasm</th>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sarlavha</th>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bo'lim</th>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Kategoriya</th>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sana</th>
                  <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Holat</th>
                  <th className={`text-right px-4 py-3 text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b transition-colors ${
                      darkMode
                        ? "border-[#30363D] hover:bg-[#30363D]/50/50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-[#30363D]" : "bg-gray-100"}`}>
                          <i className={`ri-article-line text-lg ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="cursor-pointer" onClick={() => setShowDetail(item)}>
                        <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{item.title}</p>
                        <p className={`text-xs mt-0.5 line-clamp-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.summary}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${darkMode ? "bg-[#30363D] text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        {item.departmentName?.trim() || "Umumiy"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${darkMode ? "bg-[#30363D] text-violet-400" : "bg-violet-50 text-violet-600"}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.publishedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.isNew ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Yangi
                        </span>
                      ) : (
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Oddiy</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setShowDetail(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#30363D] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`} title="Ko'rish">
                          <i className="ri-eye-line text-sm" />
                        </button>
                        <button onClick={() => handleOpenEdit(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#30363D] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`} title="Tahrirlash">
                          <i className="ri-edit-line text-sm" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ specialty: item.specialtyKey, id: item.id })} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-red-900/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-500 hover:text-red-500"}`} title="O'chirish">
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center py-16 rounded-2xl ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#30363D]" : "bg-gray-100"}`}>
            <i className={`ri-article-line text-2xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
          </div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Yangiliklar topilmadi</p>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Boshqa filter yoki qidiruv so'zini sinab ko'ring</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingId ? "Yangilikni tahrirlash" : "Yangi yangilik qo'shish"}
              </h2>
              <button onClick={() => setShowModal(false)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? "hover:bg-[#30363D] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Bo‘lim <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.departmentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const dep = id ? departments.find((d) => d.id === id) : undefined;
                    setForm({
                      ...form,
                      departmentId: id,
                      specialty: dep?.name ?? "Umumiy",
                    });
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-300"}`}
                >
                  <option value="">Umumiy (barcha bo‘limlar uchun)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className={`text-[10px] mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Kasalxonadagi barcha bo‘limlar ro‘yxati (serverdan).
                </p>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Sarlavha <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Yangilik sarlavhasi" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Qisqa tavsif <span className="text-red-400">*</span></label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Yangilikning qisqa tavsifi" rows={2} maxLength={300} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
                <p className={`text-xs mt-1 text-right ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{form.summary.length}/300</p>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>To'liq matn <span className="text-red-400">*</span></label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Yangilikning to'liq matni" rows={5} maxLength={5000} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Kategoriya</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-700 focus:border-emerald-300"}`}>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Rasm
                </label>
                <div className={`flex rounded-xl overflow-hidden border mb-2 ${darkMode ? "border-[#30363D]" : "border-gray-200"}`}>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, imageMode: "url", imageUrl: "" }))}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      form.imageMode === "url"
                        ? "bg-emerald-600 text-white"
                        : darkMode
                          ? "bg-[#0F1117] text-gray-400 hover:text-white"
                          : "bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    URL (https)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, imageMode: "cloudinary", imageUrl: "" }))}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      form.imageMode === "cloudinary"
                        ? "bg-emerald-600 text-white"
                        : darkMode
                          ? "bg-[#0F1117] text-gray-400 hover:text-white"
                          : "bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Yuklash (Cloudinary)
                  </button>
                </div>
                {form.imageMode === "url" ? (
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    disabled={imageUploading}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`}
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      key={form.imageMode}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={imageUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void (async () => {
                          setImageUploading(true);
                          setSaveError(null);
                          try {
                            const { imageUrl } = await uploadNewsCoverImage(f);
                            setForm((prev) => ({ ...prev, imageUrl, imageMode: "cloudinary" }));
                          } catch {
                            setSaveError("Rasmni yuklashda xatolik. Cloudinary (.env) va tarmoqni tekshiring.");
                          } finally {
                            setImageUploading(false);
                            e.target.value = "";
                          }
                        })();
                      }}
                      className={`w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium ${darkMode ? "text-gray-300 file:bg-[#30363D] file:text-white" : "text-gray-700 file:bg-emerald-50 file:text-emerald-800"}`}
                    />
                    {form.imageUrl ? (
                      <p className={`text-[11px] break-all ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                        Yuklangan: {form.imageUrl.slice(0, 72)}
                        {form.imageUrl.length > 72 ? "…" : ""}
                      </p>
                    ) : (
                      <p className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        URL rejimiga o‘tsangiz, yuklangan havola tozalanadi.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Manba</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Masalan: Medical Journal of Cardiology" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Taglar (vergul bilan ajrating)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="AI, Yurak, Tadqiqot" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#30363D] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm({ ...form, isNew: !form.isNew })} className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${form.isNew ? "bg-amber-500 text-white" : darkMode ? "bg-[#30363D] border border-[#30363D]" : "bg-gray-100 border border-gray-200"}`}>
                  {form.isNew && <i className="ri-check-line text-xs" />}
                </button>
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>"Yangi" deb belgilash</span>
              </div>
              {saveError && (
                <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{saveError}</p>
              )}
            </div>
            <div className={`flex items-center justify-end gap-3 p-5 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "text-gray-400 hover:text-white hover:bg-[#30363D]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>Bekor qilish</button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!form.title.trim() || !form.summary.trim() || !form.content.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 mb-4 mx-auto">
              <i className="ri-delete-bin-line text-xl text-red-500" />
            </div>
            <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>O'chirishni tasdiqlang</h3>
            <p className={`text-sm text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bu yangilikni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "text-gray-400 hover:text-white hover:bg-[#30363D]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>Bekor qilish</button>
              <button onClick={() => void handleDelete()} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(null)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}>
            {showDetail.imageUrl && (
              <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-t-2xl">
                <img src={showDetail.imageUrl} alt={showDetail.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <button onClick={() => setShowDetail(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer">
                  <i className="ri-close-line" />
                </button>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  {showDetail.isNew && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />Yangi
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-gray-700">{showDetail.category}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-emerald-700">
                    {showDetail.departmentName?.trim() || "Umumiy"} · {showDetail.specialty}
                  </span>
                </div>
              </div>
            )}
            <div className="p-5 sm:p-6">
              {!showDetail.imageUrl && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {showDetail.isNew && (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">Yangi</span>)}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#30363D] text-violet-400" : "bg-violet-50 text-violet-600"}`}>{showDetail.category}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#30363D] text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                      {showDetail.departmentName?.trim() || "Umumiy"} · {showDetail.specialty}
                    </span>
                  </div>
                  <button onClick={() => setShowDetail(null)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? "hover:bg-[#30363D] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                    <i className="ri-close-line" />
                  </button>
                </div>
              )}
              <h2 className={`text-lg sm:text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{showDetail.title}</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}><i className="ri-newspaper-line mr-1" />{showDetail.source}</span>
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}><i className="ri-calendar-line mr-1" />{showDetail.publishedAt}</span>
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}><i className="ri-time-line mr-1" />{showDetail.readTime}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {showDetail.tags.map((tag) => (
                  <span key={tag} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#30363D] text-violet-400" : "bg-violet-50 text-violet-600"}`}>{tag}</span>
                ))}
              </div>
              <div className={`text-sm leading-relaxed whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{showDetail.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewsPage() {
  return <AdminNewsPageContent />;
}
