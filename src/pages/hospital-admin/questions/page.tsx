import { useEffect, useMemo, useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import { useViewMode } from "@/hooks/useViewMode";
import ViewModeToggle from "@/components/ui/ViewModeToggle";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
  updateDepartmentAiSystemPrompt,
  type DepartmentDto,
} from "@/api/services/medicalIntake.service";

function errText(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

const CARD_ARTS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'><defs><linearGradient id='g' x1='1' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%2314b8a6' stop-opacity='0.45'/><stop offset='1' stop-color='%238b5cf6' stop-opacity='0.12'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/><circle cx='280' cy='20' r='40' fill='%2314b8a6' fill-opacity='0.25'/><circle cx='245' cy='75' r='28' fill='%238b5cf6' fill-opacity='0.22'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%230ea5e9' stop-opacity='0.35'/><stop offset='1' stop-color='%2310b981' stop-opacity='0.2'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/><path d='M170 160C220 120 260 130 320 90V160Z' fill='%230ea5e9' fill-opacity='0.22'/><circle cx='270' cy='35' r='22' fill='%2310b981' fill-opacity='0.25'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'><defs><linearGradient id='g' x1='1' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%23f97316' stop-opacity='0.34'/><stop offset='1' stop-color='%23ec4899' stop-opacity='0.2'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/><rect x='220' y='0' width='120' height='120' rx='22' fill='%23ec4899' fill-opacity='0.2'/><circle cx='250' cy='80' r='36' fill='%23f97316' fill-opacity='0.2'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%238b5cf6' stop-opacity='0.35'/><stop offset='1' stop-color='%2322d3ee' stop-opacity='0.18'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/><path d='M190 40C230 10 270 10 320 0V58C285 80 235 87 190 40Z' fill='%2322d3ee' fill-opacity='0.25'/><circle cx='260' cy='92' r='26' fill='%238b5cf6' fill-opacity='0.22'/></svg>",
];

function pickCardArt(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return CARD_ARTS[hash % CARD_ARTS.length]!;
}

export default function HAQuestionsPage() {
  return (
    <HALayout title="Bo'limlar">
      <HAQuestionsPageContent />
    </HALayout>
  );
}

export function HAQuestionsPageContent() {
  const darkMode = useHospitalAdminDarkMode();
  const { toast, showToast } = useAppToast();
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { mode: viewMode, setMode: setViewMode } = useViewMode("hospital-admin-departments", "card");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDto | null>(null);
  const [editingName, setEditingName] = useState("");
  const [promptDepartment, setPromptDepartment] = useState<DepartmentDto | null>(null);
  const [promptText, setPromptText] = useState("");

  const panel = `rounded-xl border ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"}`;
  const cardBase = `rounded-xl border p-5 ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"}`;
  const input = `w-full rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "bg-[#0F1117] border-[#30363D] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  const title = darkMode ? "text-white" : "text-gray-900";
  const muted = darkMode ? "text-gray-400" : "text-gray-500";
  const btn = "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-60";
  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, search]);

  async function refreshInitial() {
    setLoading(true);
    try {
      const departmentRows = await getDepartments();
      setDepartments(departmentRows);
    } catch (error) {
      showToast(errText(error, "Ma'lumotlarni yuklashda xatolik."), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshInitial();
  }, []);

  async function saveDepartment() {
    const name = newDepartment.trim();
    if (!name) return;
    setSaving(true);
    try {
      await createDepartment({ name });
      await refreshInitial();
      setNewDepartment("");
      showToast("Bo'lim yaratildi.");
    } catch (error) {
      showToast(errText(error, "Bo'lim saqlanmadi."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeDepartment(id: string) {
    setDeletingId(id);
    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showToast("Bo'lim o'chirildi.");
    } catch (error) {
      showToast(errText(error, "Bo'limni o'chirishda xatolik."), "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function saveDepartmentName() {
    if (!editingDepartment) return;
    const name = editingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const updated = await updateDepartment(editingDepartment.id, { name });
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
      setEditingDepartment(null);
      setEditingName("");
      showToast("Bo'lim nomi yangilandi.");
    } catch (error) {
      showToast(errText(error, "Bo'limni yangilashda xatolik."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveDepartmentPrompt() {
    if (!promptDepartment) return;
    setSaving(true);
    try {
      const updated = await updateDepartmentAiSystemPrompt(
        promptDepartment.id,
        promptText.trim() || null,
      );
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
      setPromptDepartment(null);
      setPromptText("");
      showToast("AI prompt saqlandi.");
    } catch (error) {
      showToast(errText(error, "AI promptni saqlashda xatolik."), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={`${panel} p-8 text-center ${muted}`}>Yuklanmoqda...</div>;

  return (
    <>
      <AppToast toast={toast} />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-xl font-bold ${title}`}>Bo'limlar</h1>
            <p className={`mt-1 text-sm ${muted}`}>Faqat bo'limlarni qo'shish va boshqarish.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              className={`${input} min-w-[240px]`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Bo'lim qidirish..."
            />
            <ViewModeToggle
              mode={viewMode}
              darkMode={darkMode}
              cardLabel="Card view"
              tableLabel="Table view"
              onChange={setViewMode}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowCreateModal(true)}
              className={`${btn} bg-teal-500 text-white hover:bg-teal-600`}
            >
              <i className="ri-add-line" /> Qo'shish
            </button>
          </div>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className={`rounded-lg border border-dashed px-4 py-10 text-center text-sm ${darkMode ? "border-[#30363D] text-gray-500" : "border-gray-200 text-gray-500"}`}>
            Bo'lim topilmadi.
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDepartments.map((department) => (
              <article key={department.id} className={`${cardBase} relative overflow-hidden hover:border-teal-300 transition-all`}>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-[72%] opacity-70"
                    style={{
                      backgroundImage: `url("${pickCardArt(department.id)}")`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "right center",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-teal-500/10 via-violet-500/5 to-transparent"
                  />
                  <div className="relative z-10 flex items-start justify-between mb-3 gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 flex-shrink-0">
                      <i className="ri-building-2-line text-teal-600 text-lg"></i>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Bo‘lim AI prompti"
                        aria-label={`Bo‘lim AI prompti — ${department.name}`}
                        onClick={() => {
                          setPromptDepartment(department);
                          setPromptText(department.ai_system_prompt ?? "");
                        }}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-violet-950/50 text-violet-400" : "hover:bg-violet-50 text-violet-600"}`}
                      >
                        <i aria-hidden="true" className="ri-sparkling-line text-sm"></i>
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 w-full text-left rounded-lg">
                    <h3 className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {department.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">
                        Bo'lim
                      </span>
                      {department.ai_system_prompt?.trim() ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            darkMode
                              ? "bg-violet-900/40 text-violet-300 border-violet-700/40"
                              : "bg-violet-50 text-violet-800 border-violet-200"
                          }`}
                        >
                          AI prompt
                        </span>
                      ) : null}
                    </div>
                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      ID: {department.id.slice(0, 8)}...
                    </p>
                  </div>

                  <div className="relative z-10 mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDepartment(department);
                        setEditingName(department.name);
                      }}
                      className={`${btn} ${darkMode ? "bg-[#21262D] text-gray-200 hover:bg-[#202B3D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      <i className="ri-edit-line" /> Update
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === department.id}
                      onClick={() => void removeDepartment(department.id)}
                      className={`${btn} bg-red-500 text-white hover:bg-red-600`}
                    >
                      <i className="ri-delete-bin-line" /> Delete
                    </button>
                  </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"}`}>
            <ResponsiveTable minWidthClassName="min-w-[760px]" caption="Departments table">
              <thead>
                <tr className={`text-xs border-b ${darkMode ? "border-[#30363D] text-gray-400" : "border-gray-100 text-gray-500"}`}>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Bo'lim</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">ID</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">AI prompt</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((department) => (
                  <tr key={department.id} className={`border-b last:border-0 ${darkMode ? "border-[#30363D] hover:bg-[#21262D]" : "border-gray-50 hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{department.name}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{department.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${department.ai_system_prompt?.trim() ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                        {department.ai_system_prompt?.trim() ? "Mavjud" : "Yo'q"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDepartment(department);
                            setEditingName(department.name);
                          }}
                          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer ${darkMode ? "hover:bg-[#202B3D] text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
                          aria-label={`Tahrirlash ${department.name}`}
                        >
                          <i className="ri-edit-line text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPromptDepartment(department);
                            setPromptText(department.ai_system_prompt ?? "");
                          }}
                          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer ${darkMode ? "hover:bg-violet-950/50 text-violet-400" : "hover:bg-violet-50 text-violet-600"}`}
                          aria-label={`AI prompt ${department.name}`}
                        >
                          <i className="ri-sparkling-line text-sm" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === department.id}
                          onClick={() => void removeDepartment(department.id)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer text-red-500 hover:bg-red-50"
                          aria-label={`O'chirish ${department.name}`}
                        >
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          </div>
        )}
      </div>

      {editingDepartment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-xl p-5 ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
            <h3 className={`text-base font-semibold ${title}`}>Bo'lim nomini yangilash</h3>
            <input
              className={`${input} mt-4`}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Bo'lim nomi"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditingDepartment(null)} className={`${btn} ${darkMode ? "bg-[#21262D] text-gray-200 hover:bg-[#202B3D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Bekor
              </button>
              <button type="button" disabled={saving} onClick={() => void saveDepartmentName()} className={`${btn} bg-teal-500 text-white hover:bg-teal-600`}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {promptDepartment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-2xl rounded-xl p-5 ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
            <h3 className={`text-base font-semibold ${title}`}>AI Prompt — {promptDepartment.name}</h3>
            <textarea
              className={`${input} mt-4 min-h-[180px]`}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Bo'lim uchun AI system prompt..."
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setPromptText("")}
                className={`${btn} ${darkMode ? "bg-[#21262D] text-gray-200 hover:bg-[#202B3D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Tozalash
              </button>
              <button type="button" onClick={() => setPromptDepartment(null)} className={`${btn} ${darkMode ? "bg-[#21262D] text-gray-200 hover:bg-[#202B3D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Bekor
              </button>
              <button type="button" disabled={saving} onClick={() => void saveDepartmentPrompt()} className={`${btn} bg-teal-500 text-white hover:bg-teal-600`}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4">
          <div className={`relative w-full max-w-md rounded-2xl border p-5 overflow-hidden ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-200"}`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-teal-500/15 via-violet-500/10 to-transparent"
            />
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center">
                <i className="ri-building-2-line text-lg" />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${title}`}>Yangi bo'lim qo'shish</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Bo'lim nomini kiriting va saqlang
                </p>
              </div>
            </div>
            <input
              className={`${input} mt-4`}
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Bo'lim nomi"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDepartment("");
                }}
                className={`${btn} ${darkMode ? "bg-[#21262D] text-gray-200 hover:bg-[#202B3D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Bekor
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await saveDepartment();
                  setShowCreateModal(false);
                }}
                className={`${btn} bg-teal-500 text-white hover:bg-teal-600`}
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
