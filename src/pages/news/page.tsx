import { useState, useMemo } from "react";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { specialtyNews, type NewsItem } from "@/mocks/news";

const allDepartments = [
  "Barchasi",
  "Kardiologiya",
  "Nevrologiya",
  "Ortopediya",
  "Pediatriya",
  "Xirurgiya",
  "Ginekologiya",
];

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
];

interface NewsFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  specialty: string;
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
  specialty: "Kardiologiya",
  imageUrl: "",
  source: "",
  tags: "",
  isNew: true,
};

export function AdminNewsPageContent() {
  const darkMode = useMainLayoutDarkMode();
  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>({ ...specialtyNews });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Barchasi");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormData>({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<{ specialty: string; id: string } | null>(null);
  const [showDetail, setShowDetail] = useState<NewsItem | null>(null);

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
      filtered = filtered.filter((n) => n.specialtyKey === selectedDepartment);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.specialty.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return filtered;
  }, [allNews, selectedDepartment, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const handleOpenEdit = (item: NewsItem & { specialtyKey: string }) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      specialty: item.specialtyKey,
      imageUrl: item.imageUrl || "",
      source: item.source,
      tags: item.tags.join(", "),
      isNew: item.isNew,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) return;

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const today = new Date().toISOString().split("T")[0];

    if (editingId) {
      let targetSpecialty = form.specialty;
      Object.entries(newsData).forEach(([key, list]) => {
        if (list.some((n) => n.id === editingId)) {
          targetSpecialty = key;
        }
      });

      setNewsData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          next[key] = next[key].filter((n) => n.id !== editingId);
        });
        if (!next[targetSpecialty]) next[targetSpecialty] = [];
        next[targetSpecialty] = [
          {
            id: editingId,
            title: form.title.trim(),
            summary: form.summary.trim(),
            content: form.content.trim(),
            category: form.category,
            specialty: form.specialty,
            imageUrl: form.imageUrl.trim() || undefined,
            source: form.source.trim() || "MedCore Yangiliklar",
            publishedAt: today,
            readTime: "3 daqiqa",
            isNew: form.isNew,
            tags,
          },
          ...next[targetSpecialty],
        ];
        return next;
      });
    } else {
      const newId = `news-${Date.now()}`;
      setNewsData((prev) => {
        const next = { ...prev };
        if (!next[form.specialty]) next[form.specialty] = [];
        next[form.specialty] = [
          {
            id: newId,
            title: form.title.trim(),
            summary: form.summary.trim(),
            content: form.content.trim(),
            category: form.category,
            specialty: form.specialty,
            imageUrl: form.imageUrl.trim() || undefined,
            source: form.source.trim() || "MedCore Yangiliklar",
            publishedAt: today,
            readTime: "3 daqiqa",
            isNew: form.isNew,
            tags,
          },
          ...next[form.specialty],
        ];
        return next;
      });
    }

    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setNewsData((prev) => {
      const next = { ...prev };
      next[deleteConfirm.specialty] = next[deleteConfirm.specialty].filter(
        (n) => n.id !== deleteConfirm.id,
      );
      return next;
    });
    setDeleteConfirm(null);
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
        <div className={`rounded-xl p-4 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Jami yangiliklar</p>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
        </div>
        <div className={`rounded-xl p-4 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Yangi belgilangan</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{stats.newCount}</p>
        </div>
        {allDepartments.slice(1).map((dept) => (
          <div key={dept} className={`rounded-xl p-4 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{dept}</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {stats.byDept[dept] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
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
                ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50"
                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"
            }`}
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${
            darkMode
              ? "bg-[#0F1117] border border-[#1E2130] text-white focus:border-emerald-500/50"
              : "bg-gray-50 border border-gray-200 text-gray-700 focus:border-emerald-300"
          }`}
          style={{ backgroundImage: "none" }}
        >
          {allDepartments.map((d) => (
            <option key={d} value={d}>{d}</option>
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
          {filteredNews.length} ta natija topildi
        </p>
      </div>

      {/* News table */}
      {filteredNews.length > 0 ? (
        <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
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
                        ? "border-[#1E2130] hover:bg-[#1E2A3A]/50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-[#1E2130]" : "bg-gray-100"}`}>
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${darkMode ? "bg-[#1E2130] text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        {item.specialtyKey}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${darkMode ? "bg-[#1E2130] text-violet-400" : "bg-violet-50 text-violet-600"}`}>
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
                        <button onClick={() => setShowDetail(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#1E2130] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`} title="Ko'rish">
                          <i className="ri-eye-line text-sm" />
                        </button>
                        <button onClick={() => handleOpenEdit(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#1E2130] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`} title="Tahrirlash">
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
        <div className={`flex flex-col items-center justify-center py-16 rounded-2xl ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#1E2130]" : "bg-gray-100"}`}>
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
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? "bg-[#1A2235] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {editingId ? "Yangilikni tahrirlash" : "Yangi yangilik qo'shish"}
              </h2>
              <button onClick={() => setShowModal(false)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? "hover:bg-[#1E2130] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Bo'lim (mutaxassislik) <span className="text-red-400">*</span></label>
                <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-300"}`}>
                  {allDepartments.slice(1).map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Sarlavha <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Yangilik sarlavhasi" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Qisqa tavsif <span className="text-red-400">*</span></label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Yangilikning qisqa tavsifi" rows={2} maxLength={300} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
                <p className={`text-xs mt-1 text-right ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{form.summary.length}/300</p>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>To'liq matn <span className="text-red-400">*</span></label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Yangilikning to'liq matni" rows={5} maxLength={5000} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Kategoriya</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer appearance-none ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-700 focus:border-emerald-300"}`}>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Rasm URL</label>
                <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Manba</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Masalan: Medical Journal of Cardiology" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Taglar (vergul bilan ajrating)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="AI, Yurak, Tadqiqot" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-emerald-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300"}`} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm({ ...form, isNew: !form.isNew })} className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${form.isNew ? "bg-amber-500 text-white" : darkMode ? "bg-[#1E2130] border border-[#1E2130]" : "bg-gray-100 border border-gray-200"}`}>
                  {form.isNew && <i className="ri-check-line text-xs" />}
                </button>
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>"Yangi" deb belgilash</span>
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 p-5 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "text-gray-400 hover:text-white hover:bg-[#1E2130]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>Bekor qilish</button>
              <button onClick={handleSave} disabled={!form.title.trim() || !form.summary.trim() || !form.content.trim()} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
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
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 ${darkMode ? "bg-[#1A2235] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 mb-4 mx-auto">
              <i className="ri-delete-bin-line text-xl text-red-500" />
            </div>
            <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>O'chirishni tasdiqlang</h3>
            <p className={`text-sm text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bu yangilikni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "text-gray-400 hover:text-white hover:bg-[#1E2130]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>Bekor qilish</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(null)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? "bg-[#1A2235] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-emerald-700">{showDetail.specialty}</span>
                </div>
              </div>
            )}
            <div className="p-5 sm:p-6">
              {!showDetail.imageUrl && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {showDetail.isNew && (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">Yangi</span>)}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#1E2130] text-violet-400" : "bg-violet-50 text-violet-600"}`}>{showDetail.category}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#1E2130] text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>{showDetail.specialty}</span>
                  </div>
                  <button onClick={() => setShowDetail(null)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? "hover:bg-[#1E2130] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
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
                  <span key={tag} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? "bg-[#1E2130] text-violet-400" : "bg-violet-50 text-violet-600"}`}>{tag}</span>
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
