import { useEffect, useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { mockUsers } from "@/mocks/users";
import { mockHospitals } from "@/mocks/hospitals";

type User = typeof mockUsers[0];
type RoleFilter = "all" | "HOSPITAL_ADMIN" | "DOKTOR";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/20 text-purple-400",
  HOSPITAL_ADMIN: "bg-blue-500/20 text-blue-400",
  DOKTOR: "bg-emerald-500/20 text-emerald-400",
};

function UsersPageContent() {
  const dm = useMainLayoutDarkMode();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "HOSPITAL_ADMIN", hospitalId: "1", password: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handleAdd = () => {
    if (!form.name || !form.phone || !form.password) return;
    const newUser: User = {
      id: String(Date.now()),
      name: form.name,
      phone: form.phone,
      email: form.email,
      role: form.role as User["role"],
      hospitalId: form.hospitalId,
      hospitalName: mockHospitals.find((h) => h.id === form.hospitalId)?.name || "",
      status: "active",
      lastLogin: "-",
      createdAt: new Date().toISOString().split("T")[0],
      avatar: form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setUsers([newUser, ...users]);
    setShowAdd(false);
    setForm({ name: "", phone: "", email: "", role: "HOSPITAL_ADMIN", hospitalId: "1", password: "" });
    showToast("Foydalanuvchi muvaffaqiyatli qo'shildi!");
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      ) as User[]
    );
  };

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`;

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium bg-emerald-500 text-white shadow-lg">
          {toast}
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
              placeholder="Foydalanuvchi qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-lg ${dm ? "bg-[#1A2235]" : "bg-gray-100"}`}>
            {(["all", "HOSPITAL_ADMIN", "DOKTOR"] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${roleFilter === r ? "bg-emerald-500 text-white" : dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                {r === "all" ? "Barchasi" : r === "HOSPITAL_ADMIN" ? "Adminlar" : "Shifokorlar"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-user-add-line text-base"></i>
            </div>
            Foydalanuvchi qo'shish
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className={`rounded-xl p-5 border ${dm ? "bg-[#1A2235] border-emerald-500/30" : "bg-white border-emerald-200"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Yangi Foydalanuvchi</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>To'liq Ism *</label>
                <input className={inputClass} placeholder="Ism Familiya" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Telefon *</label>
                <input className={inputClass} placeholder="+998 XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Rol *</label>
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                  <option value="DOKTOR">Doktor</option>
                  <option value="QABULXONA">Qabulxona</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Kasalxona *</label>
                <select className={inputClass} value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
                  {mockHospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Parol *</label>
                <input type="password" className={inputClass} placeholder="Kamida 6 ta belgi" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${dm ? "bg-[#0F1117] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-600"}`}>Bekor qilish</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white cursor-pointer whitespace-nowrap hover:bg-emerald-600">Saqlash</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Jami", value: users.length, color: "text-white" },
            { label: "Adminlar", value: users.filter((u) => u.role === "HOSPITAL_ADMIN").length, color: "text-blue-400" },
            { label: "Shifokorlar", value: users.filter((u) => u.role === "DOKTOR").length, color: "text-emerald-400" },
            { label: "Faol", value: users.filter((u) => u.status === "active").length, color: "text-violet-400" },
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
                <tr className={dm ? "bg-[#0F1117]" : "bg-gray-50"}>
                  {["Foydalanuvchi", "Telefon", "Email", "Rol", "Kasalxona", "So'nggi kirish", "Holat", "Amallar"].map((col) => (
                    <th key={col} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u, i) => (
                  <tr key={u.id} className={`border-t ${dm ? "border-[#1E2130]" : "border-gray-50"} ${i % 2 === 0 ? dm ? "bg-[#1A2235]" : "" : dm ? "bg-[#161D2E]" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.role === "HOSPITAL_ADMIN" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                          {u.avatar}
                        </div>
                        <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{u.name}</p>
                      </div>
                    </td>
                    <td className={`px-4 py-3.5 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{u.phone}</td>
                    <td className={`px-4 py-3.5 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || "bg-gray-500/20 text-gray-400"}`}>{u.role}</span>
                    </td>
                    <td className={`px-4 py-3.5 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="truncate max-w-[160px] block">{u.hospitalName}</span>
                    </td>
                    <td className={`px-4 py-3.5 text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>{u.lastLogin}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {u.status === "active" ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`}
                          title="Holat o'zgartirish"
                        >
                          <i className="ri-toggle-line text-sm"></i>
                        </button>
                        <button
                          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                          title="Tahrirlash"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                          title="O'chirish"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
              {filtered.length === 0
                ? "Jami 0 ta foydalanuvchi"
                : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} / ${filtered.length} ta`}
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
    </>
  );
}

export default function UsersPage() {
  return (
    <MainLayout title="Foydalanuvchilar">
      <UsersPageContent />
    </MainLayout>
  );
}
