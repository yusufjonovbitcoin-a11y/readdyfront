import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import AddHospitalPanel from "./components/AddHospitalPanel";
import { mockHospitals } from "@/mocks/hospitals";

type Hospital = typeof mockHospitals[0];

function HospitalsPageContent() {
  const navigate = useNavigate();
  const dm = useMainLayoutDarkMode();
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 3;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = hospitals.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handleAdd = (data: Record<string, string>) => {
    const newH: Hospital = {
      id: String(Date.now()),
      name: data.name,
      viloyat: "Boshqa",
      address: data.address,
      phone: data.phone,
      doctorsCount: 0,
      dailyPatients: 0,
      status: "active",
      adminName: data.adminName,
      adminPhone: data.adminPhone,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setHospitals([newH, ...hospitals]);
    showToast("Kasalxona muvaffaqiyatli qo'shildi!");
  };

  const handleDelete = (id: string) => {
    setHospitals(hospitals.filter((h) => h.id !== id));
    setDeleteId(null);
    showToast("Kasalxona o'chirildi", "error");
  };

  const toggleStatus = (id: string) => {
    setHospitals(hospitals.map((h) =>
      h.id === id ? { ...h, status: h.status === "active" ? "inactive" : "active" } : h
    ));
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className={`rounded-xl p-6 w-80 ${dm ? "bg-[#141824]" : "bg-white"}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-400 text-xl"></i>
            </div>
            <h3 className={`text-base font-semibold text-center mb-2 ${dm ? "text-white" : "text-gray-900"}`}>O'chirishni tasdiqlang</h3>
            <p className={`text-sm text-center mb-5 ${dm ? "text-gray-400" : "text-gray-500"}`}>Bu kasalxona va unga bog'liq barcha ma'lumotlar o'chiriladi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className={`flex-1 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${dm ? "bg-[#1E2A3A] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor qilish</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-lg text-sm bg-red-500 text-white cursor-pointer whitespace-nowrap hover:bg-red-600">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg flex-1 max-w-xs ${dm ? "bg-[#1A2235]" : "bg-white border border-gray-200"}`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`ri-search-line text-sm ${dm ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
            <input
              className={`flex-1 bg-transparent text-sm outline-none ${dm ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
              placeholder="Kasalxona qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-lg ${dm ? "bg-[#1A2235]" : "bg-gray-100"}`}>
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-emerald-500 text-white"
                    : dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {s === "all" ? "Barchasi" : s === "active" ? "Faol" : "Nofaol"}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line text-base"></i>
              </div>
              Kasalxona qo'shish
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Jami", value: hospitals.length, color: "text-white" },
            { label: "Faol", value: hospitals.filter((h) => h.status === "active").length, color: "text-emerald-400" },
            { label: "Nofaol", value: hospitals.filter((h) => h.status === "inactive").length, color: "text-red-400" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl p-4 text-center ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-xl overflow-hidden ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                  {["Kasalxona", "Manzil", "Telefon", "Shifokorlar", "Kunlik bemorlar", "Holat", "Amallar"].map((col) => (
                    <th key={col} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-12 text-center text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
                      Kasalxona topilmadi
                    </td>
                  </tr>
                ) : (
                  pageRows.map((h, i) => (
                    <tr
                      key={h.id}
                      className={`border-t cursor-pointer transition-colors ${
                        dm
                          ? `border-[#1E2130] ${i % 2 === 0 ? "bg-[#1A2235]" : "bg-[#161D2E]"} hover:bg-[#1E2A3A]`
                          : `border-gray-50 hover:bg-gray-50`
                      }`}
                      onClick={() => navigate(`/hospitals/${h.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <i className="ri-hospital-line text-emerald-400 text-sm"></i>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{h.name}</p>
                            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Admin: {h.adminName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{h.address}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{h.phone}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-stethoscope-line text-emerald-400 text-sm"></i>
                          </div>
                          <span className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{h.doctorsCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-user-heart-line text-blue-400 text-sm"></i>
                          </div>
                          <span className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{h.dailyPatients}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            h.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {h.status === "active" ? "Faol" : "Nofaol"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/hospitals/${h.id}`)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                            title="Ko'rish"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => toggleStatus(h.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`}
                            title="Holat o'zgartirish"
                          >
                            <i className="ri-toggle-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => setDeleteId(h.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                            title="O'chirish"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
              {filtered.length === 0
                ? "Jami 0 ta kasalxona"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length} ta`}
            </p>
            {filtered.length > 0 && (
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  type="button"
                  aria-label="Oldingi sahifa"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                    page <= 1
                      ? dm
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-300 cursor-not-allowed"
                      : dm
                        ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer"
                        : "text-gray-500 hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  <i className="ri-arrow-left-s-line" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${
                      p === page
                        ? "bg-emerald-500 text-white"
                        : dm
                          ? "text-gray-400 hover:bg-[#1E2A3A]"
                          : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Keyingi sahifa"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                    page >= totalPages
                      ? dm
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-300 cursor-not-allowed"
                      : dm
                        ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer"
                        : "text-gray-500 hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  <i className="ri-arrow-right-s-line" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddHospitalPanel open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} darkMode={dm} />
    </>
  );
}

export default function HospitalsPage() {
  return (
    <MainLayout title="Kasalxonalar">
      <HospitalsPageContent />
    </MainLayout>
  );
}
