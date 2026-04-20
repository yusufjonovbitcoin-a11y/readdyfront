import { useTranslation } from "react-i18next";
import { useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import type { HAPatient } from "@/mocks/ha_patients";
import { haDoctors } from "@/mocks/ha_doctors";
import { useModalA11y } from "@/hooks/useModalA11y";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PatientsFilters from "./components/PatientsFilters";
import PatientsTable from "./components/PatientsTable";
import { usePatientsPageState, type PatientFormData } from "./usePatientsPageState";
import { isBlank, isValidUzPhone, normalizeWhitespace } from "@/utils/fieldValidation";

const defaultForm: PatientFormData = {
  name: "", phone: "", age: "", gender: "male", doctorId: "", diagnosis: "", status: "active",
};

function PatientModal({ patient, darkMode, onClose, onSave }: {
  patient: HAPatient | null; darkMode: boolean; onClose: () => void; onSave: (data: PatientFormData) => void;
}) {
  const modalRef = useModalA11y({ isOpen: true, onClose });
  const fieldId = {
    name: "ha-patient-form-name",
    phone: "ha-patient-form-phone",
    age: "ha-patient-form-age",
    gender: "ha-patient-form-gender",
    status: "ha-patient-form-status",
    doctor: "ha-patient-form-doctor",
    diagnosis: "ha-patient-form-diagnosis",
  } as const;
  const [form, setForm] = useState<PatientFormData>(
    patient ? {
      name: patient.name, phone: patient.phone, age: String(patient.age),
      gender: patient.gender, doctorId: patient.doctorId, diagnosis: patient.diagnosis, status: patient.status,
    } : defaultForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof typeof fieldId, string>>>({});

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof fieldId, string>> = {};
    const normalizedName = normalizeWhitespace(form.name);
    const normalizedPhone = normalizeWhitespace(form.phone);
    const normalizedDiagnosis = normalizeWhitespace(form.diagnosis);
    const normalizedAge = form.age.trim();

    if (isBlank(normalizedName)) {
      nextErrors.name = "To'liq ism majburiy.";
    } else if (normalizedName.length < 3) {
      nextErrors.name = "Ism kamida 3 ta belgidan iborat bo'lishi kerak.";
    }

    if (!isValidUzPhone(normalizedPhone)) {
      nextErrors.phone = "Telefon +998 XX XXX XX XX formatida bo'lishi kerak.";
    }

    if (normalizedAge.length > 0) {
      const ageNumber = Number(normalizedAge);
      if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        nextErrors.age = "Yosh 0 dan 120 gacha butun son bo'lishi kerak.";
      }
    }

    if (form.status !== "discharged" && isBlank(normalizedDiagnosis)) {
      nextErrors.diagnosis = "Faol yoki rejalashtirilgan holatda tashxis majburiy.";
    }

    return {
      nextErrors,
      sanitizedForm: {
        ...form,
        name: normalizedName,
        phone: normalizedPhone,
        diagnosis: normalizedDiagnosis,
        age: normalizedAge,
      },
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Patient form modal"
        tabIndex={-1}
        className={`w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {patient ? "Bemorni tahrirlash" : "Yangi bemor qo'shish"}
          </h2>
          <button aria-label="Yopish" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer">
            <i className={`ri-close-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            const { nextErrors, sanitizedForm } = validate();
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) return;
            onSave(sanitizedForm);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor={fieldId.name} className={labelClass}>To'liq ism *</label>
              <input
                id={fieldId.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${fieldId.name}-error` : undefined}
                type="text"
                className={inputClass}
                placeholder="Ism Familiya"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
              {errors.name && <p id={`${fieldId.name}-error`} className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={fieldId.phone} className={labelClass}>Telefon *</label>
              <input
                id={fieldId.phone}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${fieldId.phone}-error` : undefined}
                type="tel"
                className={inputClass}
                placeholder="+998 90 000 00 00"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                required
              />
              {errors.phone && <p id={`${fieldId.phone}-error`} className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor={fieldId.age} className={labelClass}>Yosh</label>
              <input
                id={fieldId.age}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? `${fieldId.age}-error` : `${fieldId.age}-help`}
                type="number"
                className={inputClass}
                placeholder="25"
                min="0"
                max="120"
                value={form.age}
                onChange={e => setForm({...form, age: e.target.value})}
              />
              <p id={`${fieldId.age}-help`} className={`mt-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>0 dan 120 gacha</p>
              {errors.age && <p id={`${fieldId.age}-error`} className="mt-1 text-xs text-red-500">{errors.age}</p>}
            </div>
            <div>
              <label htmlFor={fieldId.gender} className={labelClass}>Jinsi</label>
              <select id={fieldId.gender} className={inputClass} value={form.gender} onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female'})}>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div>
              <label htmlFor={fieldId.status} className={labelClass}>Holat</label>
              <select id={fieldId.status} className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as HAPatient['status']})}>
                <option value="active">Faol</option>
                <option value="scheduled">Rejalashtirilgan</option>
                <option value="discharged">Chiqarilgan</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={fieldId.doctor} className={labelClass}>Shifokor</label>
              <select id={fieldId.doctor} className={inputClass} value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                <option value="">Tanlang...</option>
                {haDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={fieldId.diagnosis} className={labelClass}>Tashxis</label>
              <input
                id={fieldId.diagnosis}
                aria-invalid={Boolean(errors.diagnosis)}
                aria-describedby={errors.diagnosis ? `${fieldId.diagnosis}-error` : undefined}
                type="text"
                className={inputClass}
                placeholder="Tashxis..."
                value={form.diagnosis}
                onChange={e => setForm({...form, diagnosis: e.target.value})}
              />
              {errors.diagnosis && <p id={`${fieldId.diagnosis}-error`} className="mt-1 text-xs text-red-500">{errors.diagnosis}</p>}
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
  const modalRef = useModalA11y({ isOpen: true, onClose });
  const rec = patient.dischargeRecord;
  const block = `rounded-xl border p-4 ${darkMode ? "bg-[#1A2235]/60 border-[#1E2130]" : "bg-gray-50 border-gray-100"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Discharged patient archive modal"
        tabIndex={-1}
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
                {rec.qa.map((row) => (
                  <div
                    key={row.id}
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
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.patients")}>
      <HAPatientsPageContent />
    </HALayout>
  );
}

export function HAPatientsPageContent() {
  const { t } = useTranslation("hospital");
  const darkMode = useHospitalAdminDarkMode();
  const {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterGender,
    setFilterGender,
    filterDoctor,
    setFilterDoctor,
    showModal,
    setShowModal,
    editingPatient,
    setEditingPatient,
    deleteConfirm,
    setDeleteConfirm,
    dischargeDetailPatient,
    setDischargeDetailPatient,
    page,
    setPage,
    perPage,
    pool,
    filtered,
    statusCounts,
    totalPages,
    paginated,
    handleSave,
    handleDelete,
  } = usePatientsPageState();

  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  const cardClass = `rounded-xl border p-4 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  return (
    <>
      <div className="space-y-5">
        <PatientsFilters
          darkMode={darkMode}
          inputClass={inputClass}
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          filterStatus={filterStatus}
          onFilterStatusChange={(value) => { setFilterStatus(value); setPage(1); }}
          filterGender={filterGender}
          onFilterGenderChange={(value) => { setFilterGender(value); setPage(1); }}
          filterDoctor={filterDoctor}
          onFilterDoctorChange={(value) => { setFilterDoctor(value); setPage(1); }}
          doctorOptions={haDoctors.map((d) => ({ id: d.id, name: d.name }))}
          t={t}
        />

        <PatientsTable
          darkMode={darkMode}
          cardClass={cardClass}
          paginated={paginated}
          poolCount={pool.length}
          filteredCount={filtered.length}
          statusCounts={statusCounts}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setPage={setPage}
          page={page}
          perPage={perPage}
          totalPages={totalPages}
          onEdit={(patient) => {
            setEditingPatient(patient);
            setShowModal(true);
          }}
          onDelete={(id) => setDeleteConfirm(id)}
          onOpenDischargeDetail={setDischargeDetailPatient}
          t={t}
        />
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

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title={t("patients.confirmDelete")}
        description={t("patients.confirmDeleteDesc")}
        confirmText={t("common:buttons.delete")}
        cancelText={t("common:buttons.cancel")}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (!deleteConfirm) return;
          handleDelete(deleteConfirm);
        }}
        darkMode={darkMode}
      />
    </>
  );
}
