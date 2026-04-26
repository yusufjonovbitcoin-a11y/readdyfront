import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DoctorDto as HADoctor } from "@/api/types/doctor.types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getHADepartments } from "@/api/services/hospitalAdminData.service";
import { isBlank, isValidUzPhone, normalizeWhitespace } from "@/utils/fieldValidation";

interface DoctorFormModalProps {
  doctor: HADoctor | null;
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<HADoctor> & { password?: string }) => void;
  isSaving?: boolean;
}

function withDoctorPrefix(value: string): string {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  if (/^dr\.?\s*/i.test(normalized)) {
    return normalized.replace(/^dr\.?\s*/i, "Dr. ");
  }
  return `Dr. ${normalized}`;
}

export default function DoctorFormModal({ doctor, darkMode, onClose, onSave, isSaving = false }: DoctorFormModalProps) {
  const { t } = useTranslation("hospital");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const specialtySelectRef = useRef<HTMLSelectElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [activeField, setActiveField] = useState<"name" | "specialty" | "phone" | "password">("name");
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: nameInputRef });
  const fieldId = {
    name: "ha-doctor-form-name",
    specialty: "ha-doctor-form-specialty",
    phone: "ha-doctor-form-phone",
    password: "ha-doctor-form-password",
  } as const;
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    password: '',
  });
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof fieldId, string>>>({});

  useEffect(() => {
    if (doctor) {
      setForm({ name: doctor.name, specialty: doctor.specialty, phone: doctor.phone, password: "" });
    }
  }, [doctor]);

  useEffect(() => {
    let mounted = true;
    const currentSpecialty = normalizeWhitespace(doctor?.specialty ?? "");
    void (async () => {
      setIsDepartmentsLoading(true);
      try {
        const departments = await getHADepartments();
        if (!mounted) return;
        const names = departments
          .map((item) => normalizeWhitespace(item.name))
          .filter((name): name is string => name.length > 0);
        if (names.length === 0) {
          setDepartmentOptions(currentSpecialty ? [currentSpecialty] : []);
          return;
        }
        const unique = Array.from(new Set(names));
        setDepartmentOptions(() => {
          if (currentSpecialty && !unique.includes(currentSpecialty)) {
            return [currentSpecialty, ...unique];
          }
          return unique;
        });
      } catch {
        if (!mounted) return;
        setDepartmentOptions(currentSpecialty ? [currentSpecialty] : []);
      } finally {
        if (mounted) {
          setIsDepartmentsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [doctor?.id, doctor?.specialty]);

  useEffect(() => {
    const targetRef =
      activeField === "name"
        ? nameInputRef
        : activeField === "specialty"
          ? specialtySelectRef
          : activeField === "phone"
            ? phoneInputRef
            : passwordInputRef;
    const el = targetRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.focus();
    }
  }, [form, activeField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const nextErrors: Partial<Record<keyof typeof fieldId, string>> = {};
    const normalizedName = withDoctorPrefix(form.name);
    const normalizedSpecialty = normalizeWhitespace(form.specialty);
    const normalizedPhone = normalizeWhitespace(form.phone);

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

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      name: normalizedName,
      specialty: normalizedSpecialty,
      phone: normalizedPhone,
      password: form.password.trim(),
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
              ref={nameInputRef}
              id={fieldId.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${fieldId.name}-error` : undefined}
              type="text"
              className={inputClass}
              placeholder="Dr. Ism Familiya"
              value={form.name}
              onFocus={() => setActiveField("name")}
              onChange={e => setForm({ ...form, name: withDoctorPrefix(e.target.value) })}
              required
            />
            {errors.name && <p id={`${fieldId.name}-error`} className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.specialty} className={labelClass}>Bo'lim *</label>
            <select
              ref={specialtySelectRef}
              id={fieldId.specialty}
              aria-invalid={Boolean(errors.specialty)}
              aria-describedby={errors.specialty ? `${fieldId.specialty}-error` : undefined}
              className={inputClass}
              value={form.specialty}
              onFocus={() => setActiveField("specialty")}
              onChange={e => setForm({ ...form, specialty: e.target.value })}
              required
            >
              <option value="">
                {isDepartmentsLoading ? "Bo'limlar yuklanmoqda..." : "Tanlang..."}
              </option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.specialty && <p id={`${fieldId.specialty}-error`} className="mt-1 text-xs text-red-500">{errors.specialty}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.phone} className={labelClass}>Telefon *</label>
            <input
              ref={phoneInputRef}
              id={fieldId.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? `${fieldId.phone}-error` : `${fieldId.phone}-help`}
              type="tel"
              className={inputClass}
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onFocus={() => setActiveField("phone")}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
            <p id={`${fieldId.phone}-help`} className="sr-only">Telefon raqami xalqaro formatda kiritiladi.</p>
            {errors.phone && <p id={`${fieldId.phone}-error`} className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor={fieldId.password} className={labelClass}>Parol</label>
            <input
              ref={passwordInputRef}
              id={fieldId.password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${fieldId.password}-error` : `${fieldId.password}-help`}
              type="password"
              className={inputClass}
              placeholder="Kamida 8 ta belgi"
              value={form.password}
              onFocus={() => setActiveField("password")}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <p id={`${fieldId.password}-help`} className="sr-only">Ixtiyoriy parol maydoni.</p>
            {errors.password && <p id={`${fieldId.password}-error`} className="mt-1 text-xs text-red-500">{errors.password}</p>}
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
