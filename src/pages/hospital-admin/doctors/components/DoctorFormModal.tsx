import { useState, useEffect } from "react";
import { HADoctor } from "@/mocks/ha_doctors";

interface DoctorFormModalProps {
  doctor: HADoctor | null;
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<HADoctor>) => void;
}

const specialties = ['Kardiologiya', 'Nevrologiya', 'Ortopediya', 'Pediatriya', 'Xirurgiya', 'Dermatologiya', 'Terapiya', 'Oftalmologiya', 'Stomatologiya', 'Endokrinologiya'];

export default function DoctorFormModal({ doctor, darkMode, onClose, onSave }: DoctorFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (doctor) {
      setForm({ name: doctor.name, specialty: doctor.specialty, phone: doctor.phone, email: doctor.email, status: doctor.status });
    }
  }, [doctor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode
      ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {doctor ? "Shifokorni tahrirlash" : "Yangi shifokor qo'shish"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100">
            <i className={`ri-close-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>To'liq ism *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Dr. Ism Familiya"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Mutaxassislik *</label>
            <select
              className={inputClass}
              value={form.specialty}
              onChange={e => setForm({ ...form, specialty: e.target.value })}
              required
            >
              <option value="">Tanlang...</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Telefon *</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="doctor@medcore.uz"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Holat</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
            >
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {doctor ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
