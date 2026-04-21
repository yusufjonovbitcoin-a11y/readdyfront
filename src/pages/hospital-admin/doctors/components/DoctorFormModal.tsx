import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { DoctorDto as HADoctor } from "@/api/types/doctor.types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { isBlank, isValidEmail, isValidUzPhone, normalizeWhitespace } from "@/utils/fieldValidation";

interface DoctorFormModalProps {
  doctor: HADoctor | null;
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<HADoctor>) => void;
  isSaving?: boolean;
}

const specialties = ['Kardiologiya', 'Nevrologiya', 'Ortopediya', 'Pediatriya', 'Xirurgiya', 'Dermatologiya', 'Terapiya', 'Oftalmologiya', 'Stomatologiya', 'Endokrinologiya'];

export default function DoctorFormModal({ doctor, darkMode, onClose, onSave, isSaving = false }: DoctorFormModalProps) {
  const { t } = useTranslation("hospital");
  const modalRef = useModalA11y({ isOpen: true, onClose });
  const fieldId = {
    name: "ha-doctor-form-name",
    specialty: "ha-doctor-form-specialty",
    phone: "ha-doctor-form-phone",
    email: "ha-doctor-form-email",
    status: "ha-doctor-form-status",
  } as const;
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof fieldId, string>>>({});

  useEffect(() => {
    if (doctor) {
      setForm({ name: doctor.name, specialty: doctor.specialty, phone: doctor.phone, email: doctor.email, status: doctor.status });
    }
  }, [doctor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const nextErrors: Partial<Record<keyof typeof fieldId, string>> = {};
    const normalizedName = normalizeWhitespace(form.name);
    const normalizedSpecialty = normalizeWhitespace(form.specialty);
    const normalizedPhone = normalizeWhitespace(form.phone);
    const normalizedEmail = normalizeWhitespace(form.email);

    if (isBlank(normalizedName)) {
      nextErrors.name = "To'liq ism majburiy.";
    } else if (normalizedName.length < 3) {
      nextErrors.name = "Ism kamida 3 ta belgidan iborat bo'lishi kerak.";
    }

    if (isBlank(normalizedSpecialty)) {
      nextErrors.specialty = "Mutaxassislikni tanlang.";
    }

    if (!isValidUzPhone(normalizedPhone)) {
      nextErrors.phone = "Telefon +998 XX XXX XX XX formatida bo'lishi kerak.";
    }

    if (normalizedEmail.length > 0 && !isValidEmail(normalizedEmail)) {
      nextErrors.email = "Email manzili noto'g'ri formatda.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...form,
      name: normalizedName,
      specialty: normalizedSpecialty,
      phone: normalizedPhone,
      email: normalizedEmail,
    });
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode
      ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-doctor-form-title"
        tabIndex={-1}
        className={`w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="ha-doctor-form-title" className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {doctor ? "Shifokorni tahrirlash" : "Yangi shifokor qo'shish"}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (isSaving) return;
              onClose();
            }}
            disabled={isSaving}
            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={t("doctors.form.closeModal", { defaultValue: "Modalni yopish" })}
            title={t("doctors.form.closeModal", { defaultValue: "Modalni yopish" })}
          >
            <i className={`ri-close-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={fieldId.name} className={labelClass}>To'liq ism *</label>
            <input
              id={fieldId.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${fieldId.name}-error` : undefined}
              type="text"
              className={inputClass}
              placeholder="Dr. Ism Familiya"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            {errors.name && <p id={`${fieldId.name}-error`} className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.specialty} className={labelClass}>Mutaxassislik *</label>
            <select
              id={fieldId.specialty}
              aria-invalid={Boolean(errors.specialty)}
              aria-describedby={errors.specialty ? `${fieldId.specialty}-error` : undefined}
              className={inputClass}
              value={form.specialty}
              onChange={e => setForm({ ...form, specialty: e.target.value })}
              required
            >
              <option value="">Tanlang...</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialty && <p id={`${fieldId.specialty}-error`} className="mt-1 text-xs text-red-500">{errors.specialty}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.phone} className={labelClass}>Telefon *</label>
            <input
              id={fieldId.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? `${fieldId.phone}-error` : `${fieldId.phone}-help`}
              type="tel"
              className={inputClass}
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
            <p id={`${fieldId.phone}-help`} className="sr-only">Telefon raqami xalqaro formatda kiritiladi.</p>
            {errors.phone && <p id={`${fieldId.phone}-error`} className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.email} className={labelClass}>Email</label>
            <input
              id={fieldId.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${fieldId.email}-error` : `${fieldId.email}-help`}
              type="email"
              className={inputClass}
              placeholder="doctor@medcore.uz"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <p id={`${fieldId.email}-help`} className="sr-only">Ixtiyoriy email manzil.</p>
            {errors.email && <p id={`${fieldId.email}-error`} className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.status} className={labelClass}>Holat</label>
            <select
              id={fieldId.status}
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
              onClick={() => {
                if (isSaving) return;
                onClose();
              }}
              disabled={isSaving}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saqlanmoqda..." : doctor ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
