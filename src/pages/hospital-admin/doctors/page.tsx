import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import DoctorCard from "./components/DoctorCard";
import DoctorFormModal from "./components/DoctorFormModal";
import { haDoctors as initialDoctors, HADoctor } from "@/mocks/ha_doctors";

export default function HADoctorsPage() {
  return (
    <HALayout title="Shifokorlar">
      <HADoctorsPageContent />
    </HALayout>
  );
}

function HADoctorsPageContent() {
  const darkMode = useHospitalAdminDarkMode();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [doctors, setDoctors] = useState<HADoctor[]>(initialDoctors);
  const [view, setView] = useState<'card' | 'table'>('card');
  const [search, setSearch] = useState(qParam);
  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<HADoctor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Partial<HADoctor>) => {
    if (editingDoctor) {
      setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...data } : d));
    } else {
      const newDoc: HADoctor = {
        id: `doc-${Date.now()}`,
        name: data.name || '',
        specialty: data.specialty || '',
        phone: data.phone || '',
        email: data.email || '',
        avatar: `https://readdy.ai/api/search-image?query=professional%20doctor%20portrait%20white%20coat%20clean%20background%20high%20quality&width=200&height=200&seq=newdoc${Date.now()}&orientation=squarish`,
        todayPatients: 0,
        totalPatients: 0,
        rating: 5.0,
        status: data.status || 'active',
        joinDate: new Date().toISOString().split('T')[0],
        hospitalId: 'hosp-001',
        qrCode: `doc-${Date.now()}`,
      };
      setDoctors(prev => [...prev, newDoc]);
    }
    setShowModal(false);
    setEditingDoctor(null);
  };

  const handleDelete = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  return (
    <>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input
                type="text"
                placeholder="Shifokor qidirish..."
                className={`${inputClass} pl-9 w-64`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className={inputClass}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">Barcha holat</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className={`flex items-center rounded-lg p-1 ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
              <button
                onClick={() => setView('card')}
                className={`w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${view === 'card' ? 'bg-white text-teal-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <i className="ri-layout-grid-line text-sm"></i>
              </button>
              <button
                onClick={() => setView('table')}
                className={`w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${view === 'table' ? 'bg-white text-teal-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>

            <button
              onClick={() => { setEditingDoctor(null); setShowModal(true); }}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-base"></i>
              Shifokor qo'shish
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Jami: <strong className={darkMode ? "text-white" : "text-gray-900"}>{filtered.length}</strong> ta shifokor
          </span>
          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            {filtered.filter(d => d.status === 'active').length} faol
          </span>
        </div>

        {/* Card View */}
        {view === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                darkMode={darkMode}
                onEdit={(d) => { setEditingDoctor(d); setShowModal(true); }}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className={`ri-stethoscope-line text-4xl ${darkMode ? "text-gray-600" : "text-gray-300"}`}></i>
                </div>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Shifokor topilmadi</p>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
            <table className="w-full">
              <thead>
                <tr className={`text-xs border-b ${darkMode ? "border-[#1E2130] text-gray-400" : "border-gray-100 text-gray-500"}`}>
                  <th className="text-left px-5 py-3 font-medium">Shifokor</th>
                  <th className="text-left px-5 py-3 font-medium">Mutaxassislik</th>
                  <th className="text-left px-5 py-3 font-medium">Telefon</th>
                  <th className="text-left px-5 py-3 font-medium">Bugungi bemorlar</th>
                  <th className="text-left px-5 py-3 font-medium">Reyting</th>
                  <th className="text-left px-5 py-3 font-medium">Holat</th>
                  <th className="text-left px-5 py-3 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className={`border-b last:border-0 ${darkMode ? "border-[#1E2130] hover:bg-[#1A2235]" : "border-gray-50 hover:bg-gray-50"} transition-colors`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.name}</p>
                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doc.specialty}</td>
                    <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doc.phone}</td>
                    <td className={`px-5 py-3 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.todayPatients}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-star-fill text-amber-400 text-xs"></i>
                        </div>
                        <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                        {doc.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/hospital-admin/doctors/${doc.id}`)} className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-teal-50 text-teal-600 transition-colors">
                          <i className="ri-eye-line text-sm"></i>
                        </button>
                        <button onClick={() => { setEditingDoctor(doc); setShowModal(true); }} className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button onClick={() => setDeleteConfirm(doc.id)} className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors">
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <DoctorFormModal
          doctor={editingDoctor}
          darkMode={darkMode}
          onClose={() => { setShowModal(false); setEditingDoctor(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-80 rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className={`text-base font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>O'chirishni tasdiqlang</h3>
            <p className={`text-sm text-center mb-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bu shifokorni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 h-10 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor qilish</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
