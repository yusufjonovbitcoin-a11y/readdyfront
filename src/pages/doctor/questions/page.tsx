import { useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { docQuestions, type DocQuestion } from "@/mocks/doc_patients";

const categories = [
  { id: "all", name: "Barchasi" },
  { id: "cat-001", name: "Umumiy" },
  { id: "cat-002", name: "Yurak-qon tomir" },
  { id: "cat-003", name: "Nevrologiya" },
  { id: "cat-004", name: "Pediatriya" },
  { id: "cat-005", name: "Ortopediya" },
];

const globalTemplates = [
  { id: "gt-001", text: "Allergiyangiz bormi?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-002", text: "Qanday dorilar qabul qilmoqdasiz?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-003", text: "Oilada surunkali kasalliklar bormi?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-004", text: "Bosh aylanishi kuzatiladimi?", category: "Nevrologiya", categoryId: "cat-003" },
  { id: "gt-005", text: "Uyqu muammolari bormi?", category: "Nevrologiya", categoryId: "cat-003" },
];

interface QuestionFormData {
  text: string;
  category: string;
  categoryId: string;
}

export default function DocQuestionsPage() {
  return (
    <DocLayout title="Savollar">
      <DocQuestionsContent />
    </DocLayout>
  );
}

function DocQuestionsContent() {
  const { darkMode } = useDoctorTheme();
  const [questions, setQuestions] = useState<DocQuestion[]>(docQuestions);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DocQuestion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({ text: "", category: "Umumiy", categoryId: "cat-001" });

  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const cardHover = darkMode ? "hover:border-violet-500/40" : "hover:border-violet-200";
  const borderSubtle = darkMode ? "border-[#30363D]" : "border-gray-100";
  const textBody = darkMode ? "text-gray-200" : "text-gray-800";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-400";
  const inputBase = darkMode
    ? "pl-9 pr-4 py-2 text-sm rounded-lg bg-[#0D1117] border border-[#30363D] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 w-52"
    : "pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 w-52";
  const searchIcon = darkMode ? "text-gray-500" : "text-gray-400";
  const btnGhost = darkMode
    ? "border border-[#30363D] bg-[#21262D] text-gray-200 hover:bg-[#30363D]"
    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
  const pillIdle = darkMode ? "bg-[#21262D] text-gray-300 hover:bg-[#30363D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200";
  const statGreen = darkMode ? "text-emerald-400" : "text-green-600";
  const statGray = darkMode ? "text-gray-500" : "text-gray-400";
  const statViolet = darkMode ? "text-violet-400" : "text-violet-600";
  const badgeCat = darkMode ? "bg-violet-900/40 text-violet-300" : "bg-violet-100 text-violet-700";
  const badgeCustom = darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700";
  const iconBtn = darkMode
    ? "hover:bg-[#21262D] text-gray-400 hover:text-gray-200"
    : "hover:bg-gray-100 text-gray-400 hover:text-gray-700";
  const iconBtnDel = darkMode ? "hover:bg-red-950/40 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500";
  const modalPanel = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white";
  const modalTitle = darkMode ? "text-white" : "text-gray-900";
  const labelCls = darkMode ? "text-gray-300" : "text-gray-700";
  const fieldBase = darkMode
    ? "w-full text-sm border border-[#30363D] rounded-lg px-3 py-2.5 bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
    : "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400";
  const btnSecondary = darkMode
    ? "border border-[#30363D] text-gray-200 hover:bg-[#21262D]"
    : "border border-gray-200 text-gray-600 hover:bg-gray-50";
  const closeBtn = darkMode ? "hover:bg-[#21262D] text-gray-400" : "hover:bg-gray-100 text-gray-400";
  const cloneRow = darkMode
    ? "border border-[#30363D] hover:border-violet-500/40"
    : "border border-gray-100 hover:border-violet-200";
  const cloneText = darkMode ? "text-gray-200" : "text-gray-800";
  const cloneCat = darkMode ? "text-violet-400" : "text-violet-600";
  const cloneBtn = darkMode
    ? "bg-violet-900/40 text-violet-200 hover:bg-violet-900/60"
    : "bg-violet-50 text-violet-700 hover:bg-violet-100";

  const filtered = questions.filter((q) => {
    const matchCat = activeCategory === "all" || q.categoryId === activeCategory;
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = () => {
    if (!formData.text.trim()) return;
    const newQ: DocQuestion = {
      id: `dq-${Date.now()}`,
      text: formData.text,
      category: formData.category,
      categoryId: formData.categoryId,
      status: "active",
      isCustom: true,
      doctorId: "doc-001",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuestions((prev) => [newQ, ...prev]);
    setFormData({ text: "", category: "Umumiy", categoryId: "cat-001" });
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!editingQuestion || !formData.text.trim()) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingQuestion.id ? { ...q, text: formData.text, category: formData.category, categoryId: formData.categoryId } : q
      )
    );
    setEditingQuestion(null);
    setFormData({ text: "", category: "Umumiy", categoryId: "cat-001" });
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: q.status === "active" ? "inactive" : "active" } : q))
    );
  };

  const handleClone = (template: (typeof globalTemplates)[0]) => {
    const newQ: DocQuestion = {
      id: `dq-${Date.now()}`,
      text: template.text,
      category: template.category,
      categoryId: template.categoryId,
      status: "active",
      isCustom: true,
      doctorId: "doc-001",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuestions((prev) => [newQ, ...prev]);
    setShowCloneModal(false);
  };

  const openEdit = (q: DocQuestion) => {
    setEditingQuestion(q);
    setFormData({ text: q.text, category: q.category, categoryId: q.categoryId });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-bold ${pageTitle}`}>Mening Savollarim</h2>
          <p className={`text-sm mt-0.5 ${pageMuted}`}>Jami {questions.length} ta savol</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCloneModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnGhost}`}
          >
            <i className="ri-file-copy-line text-sm"></i>
            Shablondan klonlash
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setFormData({ text: "", category: "Umumiy", categoryId: "cat-001" });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line text-sm"></i>
            Savol qo'shish
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm ${searchIcon}`}></i>
          <input
            type="text"
            placeholder="Savol qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id ? "bg-violet-600 text-white" : pillIdle
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statGreen}`}>{questions.filter((q) => q.status === "active").length}</span> faol
        </span>
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statGray}`}>{questions.filter((q) => q.status === "inactive").length}</span> nofaol
        </span>
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statViolet}`}>{questions.filter((q) => q.isCustom).length}</span> shaxsiy
        </span>
      </div>

      {/* Questions Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
            <i className={`ri-questionnaire-line text-2xl ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
          </div>
          <p className={`font-medium ${pageMuted}`}>Savol topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`rounded-xl p-4 transition-all ${cardBase} ${
                q.status === "inactive" ? `opacity-60 ${darkMode ? "border-[#30363D]" : "border-gray-100"}` : cardHover
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCat}`}>{q.category}</span>
                  {q.isCustom && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCustom}`}>Shaxsiy</span>}
                </div>
                <button
                  onClick={() => handleToggleStatus(q.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                    q.status === "active" ? "bg-green-500" : darkMode ? "bg-[#30363D]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      q.status === "active" ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  ></span>
                </button>
              </div>

              <p className={`text-sm font-medium leading-relaxed mb-4 ${textBody}`}>{q.text}</p>

              <div className={`flex items-center justify-between pt-3 border-t ${borderSubtle}`}>
                <span className={`text-xs ${textMuted}`}>{q.createdAt}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(q)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${iconBtn}`}
                  >
                    <i className="ri-edit-2-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(q.id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${iconBtnDel}`}
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingQuestion) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md mx-4 ${modalPanel}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${modalTitle}`}>
                {editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestion(null);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${closeBtn}`}
              >
                <i className="ri-close-line text-base"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Savol matni</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Savol matnini kiriting..."
                  rows={3}
                  maxLength={500}
                  className={`${fieldBase} resize-none`}
                />
                <p className={`text-xs mt-1 ${textMuted}`}>{formData.text.length}/500</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Kategoriya</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setFormData({ ...formData, categoryId: e.target.value, category: cat?.name || "Umumiy" });
                  }}
                  className={`${fieldBase} cursor-pointer`}
                >
                  {categories
                    .filter((c) => c.id !== "all")
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestion(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnSecondary}`}
              >
                Bekor qilish
              </button>
              <button
                onClick={editingQuestion ? handleEdit : handleAdd}
                disabled={!formData.text.trim()}
                className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {editingQuestion ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md mx-4 ${modalPanel}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${modalTitle}`}>Global shablonlar</h3>
              <button onClick={() => setShowCloneModal(false)} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${closeBtn}`}>
                <i className="ri-close-line text-base"></i>
              </button>
            </div>
            <p className={`text-sm mb-4 ${pageMuted}`}>Klonlash uchun shablonni tanlang</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {globalTemplates.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${cloneRow}`}>
                  <div>
                    <p className={`text-sm ${cloneText}`}>{t.text}</p>
                    <span className={`text-xs ${cloneCat}`}>{t.category}</span>
                  </div>
                  <button
                    onClick={() => handleClone(t)}
                    className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${cloneBtn}`}
                  >
                    Klonlash
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-sm mx-4 ${modalPanel}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${darkMode ? "bg-red-950/50" : "bg-red-100"}`}>
                <i className="ri-delete-bin-line text-red-600 text-lg"></i>
              </div>
              <div>
                <h3 className={`text-base font-semibold ${modalTitle}`}>O'chirishni tasdiqlang</h3>
                <p className={`text-sm ${pageMuted}`}>Bu amalni qaytarib bo'lmaydi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnSecondary}`}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 cursor-pointer transition-colors whitespace-nowrap"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
