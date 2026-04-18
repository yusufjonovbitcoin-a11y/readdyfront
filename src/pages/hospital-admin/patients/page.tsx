import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { haPatients as initialPatients, HAPatient } from "@/mocks/ha_patients";
import { haDoctors } from "@/mocks/ha_doctors";

interface PatientFormData {
  name: string;
  phone: string;
  age: string;
  gender: 'male' | 'female';
  doctorId: string;
  diagnosis: string;
  status: 'active' | 'discharged' | 'scheduled';
}

const defaultForm: PatientFormData = {
  name: '', phone: '', age: '', gender: 'male', doctorId: '', diagnosis: '', status: 'active',
};

function PatientModal({ patient, darkMode, onClose, onSave }: {
  patient: HAPatient | null; darkMode: boolean; onClose: () => void; onSave: (data: PatientFormData) => void;
}) {
  const [form, setForm] = useState<PatientFormData>(
    patient ? {
      name: patient.name, phone: patient.phone, age: String(patient.age),
      gender: patient.gender, doctorId: patient.doctorId, diagnosis: patient.diagnosis, status: patient.status,
    } : defaultForm
  );

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {patient ? "Bemorni tahrirlash" : "Yangi bemor qo'shish"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer">
            <i className={`ri-close-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>To'liq ism *</label>
              <input type="text" className={inputClass} placeholder="Ism Familiya" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className={labelClass}>Telefon *</label>
              <input type="tel" className={inputClass} placeholder="+998 90 000 00 00" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div>
              <label className={labelClass}>Yosh</label>
              <input type="number" className={inputClass} placeholder="25" min="0" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Jinsi</label>
              <select className={inputClass} value={form.gender} onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female'})}>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Holat</label>
              <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as HAPatient['status']})}>
                <option value="active">Faol</option>
                <option value="scheduled">Rejalashtirilgan</option>
                <option value="discharged">Chiqarilgan</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Shifokor</label>
              <select className={inputClass} value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                <option value="">Tanlang...</option>
                {haDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Tashxis</label>
              <input type="text" className={inputClass} placeholder="Tashxis..." value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`flex-1 h-10 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor qilish</button>
            <button type="submit" className="flex-1 h-10 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">
              {patient ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DischargeArchiveModal({
  patient,
  darkMode,
  onClose,
}: {
  patient: HAPatient;
  darkMode: boolean;
  onClose: () => void;
}) {
  const rec = patient.dischargeRecord;
  const block = `rounded-xl border p-4 ${darkMode ? "bg-[#1A2235]/60 border-[#1E2130]" : "bg-gray-50 border-gray-100"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Chiqarilgan bemor — to‘liq ma’lumot</h2>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {patient.name} · <span className="text-teal-500">{patient.diagnosis}</span>
            </p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{patient.doctorName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 flex items-center justify-center rounded-lg shrink-0 cursor-pointer ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            aria-label="Yopish"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {!rec ? (
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Bu bemor uchun AI tahlili va savol-javoblar hali kiritilmagan.
          </p>
        ) : (
          <div className="space-y-4">
            <div className={block}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-teal-400" : "text-teal-700"}`}>
                AI tahlil va tavsiya
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{rec.aiDiagnosis}</p>
            </div>
            <div className={block}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Shifokor yozgan xulosalar
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{rec.doctorNotes}</p>
            </div>
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Savollar va bemor javoblari
              </h3>
              <div className="space-y-2">
                {rec.qa.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${darkMode ? "border-[#1E2130] bg-[#0F1117]/40" : "border-gray-100 bg-white"}`}
                  >
                    <p className={`text-xs font-medium mb-1 ${darkMode ? "text-teal-400/95" : "text-teal-700"}`}>{row.question}</p>
                    <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{row.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-10 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}

export default function HAPatientsPage() {
  return (
    <HALayout title="Bemorlar">
      <HAPatientsPageContent />
    </HALayout>
  );
}

function HAPatientsPageContent() {
  const darkMode = useHospitalAdminDarkMode();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [patients, setPatients] = useState<HAPatient[]>(initialPatients);
  const [search, setSearch] = useState(qParam);
  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'discharged' | 'scheduled'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<HAPatient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dischargeDetailPatient, setDischargeDetailPatient] = useState<HAPatient | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const pool = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchGender = filterGender === "all" || p.gender === filterGender;
    const matchDoctor = filterDoctor === "all" || p.doctorId === filterDoctor;
    return matchSearch && matchGender && matchDoctor;
  });

  const filtered =
    filterStatus === "all" ? pool : pool.filter((p) => p.status === filterStatus);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = (data: PatientFormData) => {
    const doctor = haDoctors.find(d => d.id === data.doctorId);
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? {
        ...p, ...data, age: Number(data.age), doctorName: doctor?.name || p.doctorName,
      } : p));
    } else {
      const newP: HAPatient = {
        id: `pat-${Date.now()}`,
        name: data.name, phone: data.phone, age: Number(data.age),
        gender: data.gender, doctorId: data.doctorId, doctorName: doctor?.name || '',
        lastVisit: new Date().toISOString().split('T')[0], nextVisit: null,
        diagnosis: data.diagnosis, status: data.status, hospitalId: 'hosp-001', visitCount: 1,
      };
      setPatients(prev => [newP, ...prev]);
    }
    setShowModal(false);
    setEditingPatient(null);
  };

  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  const statusLabel = (s: string) => s === 'active' ? 'Faol' : s === 'scheduled' ? 'Rejalashtirilgan' : 'Chiqarilgan';
  const statusColor = (s: string) => s === 'active' ? 'bg-teal-50 text-teal-700' : s === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600';

  const statusPillInteractive = (s: "active" | "scheduled" | "discharged") => {
    const selected = filterStatus === s;
    const base = darkMode
      ? s === "active"
        ? "bg-teal-500/15 text-teal-300"
        : s === "scheduled"
          ? "bg-indigo-500/15 text-indigo-300"
          : "bg-gray-500/20 text-gray-300"
      : statusColor(s);
    return `${base} ${selected ? (darkMode ? "ring-2 ring-teal-400" : "ring-2 ring-teal-600 ring-offset-2 ring-offset-white") : ""}`;
  };

  return (
    <>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input type="text" placeholder="Bemor qidirish..." className={`${inputClass} pl-9 w-56`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className={inputClass} value={filterStatus} onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1); }}>
              <option value="all">Barcha holat</option>
              <option value="active">Faol</option>
              <option value="scheduled">Rejalashtirilgan</option>
              <option value="discharged">Chiqarilgan</option>
            </select>
            <select className={inputClass} value={filterGender} onChange={e => { setFilterGender(e.target.value as typeof filterGender); setPage(1); }}>
              <option value="all">Barcha jins</option>
              <option value="male">Erkak</option>
              <option value="female">Ayol</option>
            </select>
            <select className={inputClass} value={filterDoctor} onChange={e => { setFilterDoctor(e.target.value); setPage(1); }}>
              <option value="all">Barcha shifokorlar</option>
              {haDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
        </div>

        {/* Summary — bosilganda holat filtri */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setFilterStatus("all");
              setPage(1);
            }}
            className={`text-sm rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer text-left border-0 ${
              filterStatus === "all"
                ? darkMode
                  ? "text-white bg-white/10 ring-2 ring-teal-500/50"
                  : "text-gray-900 bg-gray-100 ring-2 ring-teal-500/40"
                : darkMode
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Jami:{" "}
            <strong className={darkMode ? "text-white" : "text-gray-900"}>{pool.length}</strong>{" "}
            ta bemor
          </button>
          {(["active", "scheduled", "discharged"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setFilterStatus(s);
                setPage(1);
              }}
              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer border-0 transition-all hover:opacity-90 ${statusPillInteractive(s)}`}
            >
              {statusLabel(s)}: {pool.filter((p) => p.status === s).length}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <table className="w-full">
            <thead>
              <tr className={`text-xs border-b ${darkMode ? "border-[#1E2130] text-gray-400" : "border-gray-100 text-gray-500"}`}>
                <th className="text-left px-5 py-3 font-medium">Bemor</th>
                <th className="text-left px-5 py-3 font-medium">Yosh / Jins</th>
                <th className="text-left px-5 py-3 font-medium">Shifokor</th>
                <th className="text-left px-5 py-3 font-medium">Tashxis</th>
                <th className="text-left px-5 py-3 font-medium">So'nggi tashrif</th>
                <th className="text-left px-5 py-3 font-medium">Holat</th>
                <th className="text-left px-5 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className={`border-b last:border-0 transition-colors ${darkMode ? "border-[#1E2130] hover:bg-[#1A2235]" : "border-gray-50 hover:bg-gray-50"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.gender === 'female' ? 'bg-pink-100' : 'bg-teal-100'}`}>
                        <span className={`text-xs font-bold ${p.gender === 'female' ? 'text-pink-700' : 'text-teal-700'}`}>{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{p.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {p.age} yosh / {p.gender === 'male' ? 'Erkak' : 'Ayol'}
                  </td>
                  <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.doctorName}</td>
                  <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
                  <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.lastVisit}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      {p.status === "discharged" && (
                        <button
                          type="button"
                          title="AI tahlil, shifokor yozuvi va savol-javoblar"
                          onClick={() => setDischargeDetailPatient(p)}
                          className={`h-7 px-2 flex items-center gap-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${darkMode ? "bg-teal-500/15 text-teal-400 hover:bg-teal-500/25" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                        >
                          <i className="ri-eye-line text-sm"></i>
                          <span className="hidden sm:inline">Ko‘rish</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPatient(p);
                          setShowModal(true);
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-5 py-12 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Bemor topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between px-5 py-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} / {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`w-7 h-7 flex items-center justify-center rounded-md text-sm cursor-pointer disabled:opacity-40 ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs cursor-pointer ${n === page ? 'bg-teal-500 text-white' : darkMode ? 'text-gray-400 hover:bg-[#1A2235]' : 'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`w-7 h-7 flex items-center justify-center rounded-md text-sm cursor-pointer disabled:opacity-40 ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <PatientModal patient={editingPatient} darkMode={darkMode} onClose={() => { setShowModal(false); setEditingPatient(null); }} onSave={handleSave} />
      )}

      {dischargeDetailPatient && (
        <DischargeArchiveModal
          patient={dischargeDetailPatient}
          darkMode={darkMode}
          onClose={() => setDischargeDetailPatient(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-80 rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className={`text-base font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>O'chirishni tasdiqlang</h3>
            <p className={`text-sm text-center mb-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bu bemorni o'chirishni xohlaysizmi?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 h-10 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor qilish</button>
              <button onClick={() => { setPatients(prev => prev.filter(p => p.id !== deleteConfirm)); setDeleteConfirm(null); }} className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
