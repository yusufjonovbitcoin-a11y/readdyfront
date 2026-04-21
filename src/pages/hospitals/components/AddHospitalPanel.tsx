import { useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/react";
import { useModalA11y } from "@/hooks/useModalA11y";

interface AddHospitalPanelProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Record<string, string>) => Promise<void> | void;
  darkMode: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  submitting?: boolean;
}

export default function AddHospitalPanel({ open, onClose, onAdd, darkMode, triggerRef, submitting = false }: AddHospitalPanelProps) {
  const { t } = useTranslation("hospital");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    adminName: "",
    adminPhone: "",
    adminPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useModalA11y({
    isOpen: open,
    onClose,
    triggerRef,
    inertSelectors: ["header", "main", "aside"],
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Kasalxona nomi kiritilishi shart";
    if (!form.address.trim()) e.address = "Manzil kiritilishi shart";
    if (!form.phone.trim()) e.phone = "Telefon raqami kiritilishi shart";
    if (!form.adminName.trim()) e.adminName = "Admin ismi kiritilishi shart";
    if (!form.adminPhone.trim()) e.adminPhone = "Admin telefoni kiritilishi shart";
    if (!form.adminPassword.trim() || form.adminPassword.length < 6) e.adminPassword = "Parol kamida 6 ta belgi bo'lishi kerak";
    return e;
  };

  const handleSubmit = async () => {
    if (loading || submitting) return;
    setSubmitError(null);
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      await Promise.resolve(onAdd(form));
      setForm({ name: "", address: "", phone: "", adminName: "", adminPhone: "", adminPassword: "" });
      setErrors({});
      onClose();
    } catch (err) {
      setSubmitError(t("addHospital.errors.submitFailed", { defaultValue: "Saqlashda xatolik yuz berdi." }));
      Sentry.captureException(err, {
        tags: { area: "hospitals", op: "create" },
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors ${
      darkMode
        ? `bg-[#0F1117] border ${errors[field] ? "border-red-500" : "border-[#1E2A3A]"} text-white placeholder-gray-600 focus:border-emerald-500`
        : `bg-gray-50 border ${errors[field] ? "border-red-400" : "border-gray-200"} text-gray-900 placeholder-gray-400 focus:border-emerald-500`
    }`;

  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      {/* Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-hospital-panel-title"
        tabIndex={-1}
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl transition-transform duration-300 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
          <div>
            <h2 id="add-hospital-panel-title" className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Kasalxona Qo'shish</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Yangi kasalxona va admin yaratish</p>
          </div>
          <button
            onClick={onClose}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            aria-label="Kasalxona qo'shish panelini yopish"
          >
            <i className="ri-close-line text-lg" aria-hidden="true"></i>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Hospital Info */}
          <div>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <div className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-500/20">
                <i className="ri-hospital-line text-emerald-400 text-sm"></i>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Kasalxona Ma'lumotlari</span>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="add-hospital-name" className={labelClass}>Kasalxona Nomi *</label>
                <input id="add-hospital-name" className={inputClass("name")} placeholder="Masalan: Toshkent Klinik Kasalxonasi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="add-hospital-address" className={labelClass}>Manzil *</label>
                <input id="add-hospital-address" className={inputClass("address")} placeholder="Shahar, tuman, ko'cha" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label htmlFor="add-hospital-phone" className={labelClass}>Telefon Raqami *</label>
                <input id="add-hospital-phone" className={inputClass("phone")} placeholder="+998 XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <div className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-500/20">
                <i className="ri-user-settings-line text-blue-400 text-sm"></i>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Admin Yaratish</span>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="add-hospital-admin-name" className={labelClass}>Admin Ismi *</label>
                <input id="add-hospital-admin-name" className={inputClass("adminName")} placeholder="To'liq ism" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
                {errors.adminName && <p className="text-red-400 text-xs mt-1">{errors.adminName}</p>}
              </div>
              <div>
                <label htmlFor="add-hospital-admin-phone" className={labelClass}>Admin Telefoni *</label>
                <input id="add-hospital-admin-phone" className={inputClass("adminPhone")} placeholder="+998 XX XXX XX XX" value={form.adminPhone} onChange={(e) => setForm({ ...form, adminPhone: e.target.value })} />
                {errors.adminPhone && <p className="text-red-400 text-xs mt-1">{errors.adminPhone}</p>}
              </div>
              <div>
                <label htmlFor="add-hospital-admin-password" className={labelClass}>Parol *</label>
                <input id="add-hospital-admin-password" type="password" className={inputClass("adminPassword")} placeholder="Kamida 6 ta belgi" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
                {errors.adminPassword && <p className="text-red-400 text-xs mt-1">{errors.adminPassword}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t space-y-2 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
          {submitError && (
            <p className="text-xs text-red-500" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading || submitting}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${loading || submitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1E2A3A] text-gray-300 hover:bg-[#243040]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Bekor qilish
          </button>
          <button
            onClick={() => { void handleSubmit(); }}
            disabled={loading || submitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading || submitting ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          </div>
        </div>
      </div>
    </>
  );
}
