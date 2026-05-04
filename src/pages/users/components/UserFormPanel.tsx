import { useTranslation } from "react-i18next";
import type { Hospital } from "@/types";

interface UserFormState {
  name: string;
  phone: string;
  role: string;
  hospitalId: string;
  password: string;
}

interface UserFormPanelProps {
  darkMode: boolean;
  open: boolean;
  editing: boolean;
  form: UserFormState;
  hospitals: Hospital[];
  isSaving: boolean;
  onFormChange: (next: UserFormState) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function UserFormPanel({
  darkMode,
  open,
  editing,
  form,
  hospitals,
  isSaving,
  onFormChange,
  onCancel,
  onSave,
}: UserFormPanelProps) {
  const { t } = useTranslation("admin");
  if (!open) return null;

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none ${
    darkMode
      ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500"
      : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
  }`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`;

  return (
    <div
      className={`rounded-xl p-4 border ${
        darkMode ? "bg-[#1A2235] border-emerald-500/30" : "bg-white border-emerald-200"
      }`}
    >
      <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {editing ? "Foydalanuvchini tahrirlash" : t("users.newUser")}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="users-form-name" className={labelClass}>{t("users.form.fullNameLabel")}</label>
          <input
            id="users-form-name"
            className={inputClass}
            placeholder={t("users.form.fullNamePlaceholder")}
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="users-form-phone" className={labelClass}>{t("users.form.phoneLabel")}</label>
          <input
            id="users-form-phone"
            className={inputClass}
            placeholder={t("users.form.phonePlaceholder")}
            value={form.phone}
            onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="users-form-role" className={labelClass}>{t("users.form.roleLabel")}</label>
          <select
            id="users-form-role"
            className={inputClass}
            value={form.role}
            onChange={(e) => onFormChange({ ...form, role: e.target.value })}
          >
            <option value="HOSPITAL_ADMIN">{t("users.form.roleOptions.hospitalAdmin")}</option>
            <option value="DOCTOR">{t("users.form.roleOptions.doctor")}</option>
            <option value="RECEPTION">{t("users.form.roleOptions.reception")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="users-form-hospital" className={labelClass}>{t("users.form.hospitalLabel")}</label>
          <select
            id="users-form-hospital"
            className={inputClass}
            value={form.hospitalId}
            onChange={(e) => onFormChange({ ...form, hospitalId: e.target.value })}
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="users-form-password" className={labelClass}>{t("users.form.passwordLabel")}</label>
          <input
            id="users-form-password"
            type="password"
            className={inputClass}
            placeholder={t("users.form.passwordPlaceholder")}
            value={form.password}
            onChange={(e) => onFormChange({ ...form, password: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${
            isSaving ? "" : "cursor-pointer"
          } ${darkMode ? "bg-[#0F1117] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-600"}`}
        >
          {t("common:buttons.cancel")}
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white whitespace-nowrap hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saqlanmoqda..." : t("users.save")}
        </button>
      </div>
    </div>
  );
}
