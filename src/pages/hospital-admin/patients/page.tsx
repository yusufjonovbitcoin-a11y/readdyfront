import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { getHADoctors, getHAPatients, type HAPatient } from "@/api/services/hospitalAdminData.service";
import { createHAPatient, deleteHAPatient, updateHAPatient } from "@/api/services/hospitalAdminData.service";
import type { DoctorDto } from "@/api/types/doctor.types";
import { useModalA11y } from "@/hooks/useModalA11y";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppToast from "@/components/ui/AppToast";
import PatientsFilters from "./components/PatientsFilters";
import PatientsTable from "./components/PatientsTable";
import { usePatientsPageState, type PatientFormData } from "./usePatientsPageState";
import { isBlank, isValidUzPhone, normalizeWhitespace } from "@/utils/fieldValidation";
import { usePageState } from "@/hooks/usePageState";
import { useAppToast } from "@/hooks/useAppToast";

const defaultForm: PatientFormData = {
  name: "", phone: "", age: "", gender: "male", doctorId: "", diagnosis: "", status: "active",
};

function PatientModal({ patient, darkMode, onClose, onSave, doctors, isSubmitting }: {
  patient: HAPatient | null; darkMode: boolean; onClose: () => void; onSave: (data: PatientFormData) => void; doctors: DoctorDto[]; isSubmitting: boolean;
}) {
  const { t } = useTranslation("hospital");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: nameInputRef });
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
      nextErrors.name = t("patients.modal.errors.nameRequired");
    } else if (normalizedName.length < 3) {
      nextErrors.name = t("patients.modal.errors.nameMin");
    }

    if (!isValidUzPhone(normalizedPhone)) {
      nextErrors.phone = t("patients.modal.errors.phoneFormat");
    }

    if (normalizedAge.length > 0) {
      const ageNumber = Number(normalizedAge);
      if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        nextErrors.age = t("patients.modal.errors.ageRange");
      }
    }

    if (form.status !== "discharged" && isBlank(normalizedDiagnosis)) {
      nextErrors.diagnosis = t("patients.modal.errors.diagnosisRequired");
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
        aria-labelledby="ha-patient-form-title"
        tabIndex={-1}
        className={`w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="ha-patient-form-title" className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {patient ? t("patients.modal.editTitle") : t("patients.modal.createTitle")}
          </h2>
          <button aria-label={t("patients.modal.closeAria")} onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer">
            <i className={`ri-close-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (isSubmitting) return;
            const { nextErrors, sanitizedForm } = validate();
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) return;
            onSave(sanitizedForm);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor={fieldId.name} className={labelClass}>{t("patients.modal.fields.fullName")} *</label>
              <input
                ref={nameInputRef}
                id={fieldId.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${fieldId.name}-error` : undefined}
                type="text"
                className={inputClass}
                placeholder={t("patients.modal.placeholders.fullName")}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
              {errors.name && <p id={`${fieldId.name}-error`} className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={fieldId.phone} className={labelClass}>{t("patients.modal.fields.phone")} *</label>
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
              <label htmlFor={fieldId.age} className={labelClass}>{t("patients.modal.fields.age")}</label>
              <input
                id={fieldId.age}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? `${fieldId.age}-error` : `${fieldId.age}-help`}
                type="number"
                className={inputClass}
                placeholder={t("patients.modal.placeholders.age")}
                min="0"
                max="120"
                value={form.age}
                onChange={e => setForm({...form, age: e.target.value})}
              />
              <p id={`${fieldId.age}-help`} className={`mt-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{t("patients.modal.help.ageRange")}</p>
              {errors.age && <p id={`${fieldId.age}-error`} className="mt-1 text-xs text-red-500">{errors.age}</p>}
            </div>
            <div>
              <label htmlFor={fieldId.gender} className={labelClass}>{t("patients.modal.fields.gender")}</label>
              <select id={fieldId.gender} className={inputClass} value={form.gender} onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female'})}>
                <option value="male">{t("patients.modal.options.genderMale")}</option>
                <option value="female">{t("patients.modal.options.genderFemale")}</option>
              </select>
            </div>
            <div>
              <label htmlFor={fieldId.status} className={labelClass}>{t("patients.modal.fields.status")}</label>
              <select id={fieldId.status} className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as HAPatient['status']})}>
                <option value="active">{t("patients.modal.options.statusActive")}</option>
                <option value="scheduled">{t("patients.modal.options.statusScheduled")}</option>
                <option value="discharged">{t("patients.modal.options.statusDischarged")}</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={fieldId.doctor} className={labelClass}>{t("patients.modal.fields.doctor")}</label>
              <select id={fieldId.doctor} className={inputClass} value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                <option value="">{t("patients.modal.placeholders.selectDoctor")}</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={fieldId.diagnosis} className={labelClass}>{t("patients.modal.fields.diagnosis")}</label>
              <input
                id={fieldId.diagnosis}
                aria-invalid={Boolean(errors.diagnosis)}
                aria-describedby={errors.diagnosis ? `${fieldId.diagnosis}-error` : undefined}
                type="text"
                className={inputClass}
                placeholder={t("patients.modal.placeholders.diagnosis")}
                value={form.diagnosis}
                onChange={e => setForm({...form, diagnosis: e.target.value})}
              />
              {errors.diagnosis && <p id={`${fieldId.diagnosis}-error`} className="mt-1 text-xs text-red-500">{errors.diagnosis}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>{t("common:buttons.cancel")}</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}>
              {isSubmitting ? t("common:buttons.saving", { defaultValue: "Saqlanmoqda..." }) : patient ? t("common:buttons.save") : t("common:buttons.add")}
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
  const { t } = useTranslation("hospital");
  const modalRef = useModalA11y({ isOpen: true, onClose });
  const rec = patient.dischargeRecord;
  const block = `rounded-xl border p-4 ${darkMode ? "bg-[#1A2235]/60 border-[#1E2130]" : "bg-gray-50 border-gray-100"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-discharge-archive-title"
        tabIndex={-1}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="ha-discharge-archive-title" className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("patients.dischargeArchive.title")}</h2>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {patient.name} · <span className="text-teal-500">{patient.diagnosis}</span>
            </p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{patient.doctorName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-11 h-11 flex items-center justify-center rounded-lg shrink-0 cursor-pointer ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            aria-label={t("patients.dischargeArchive.closeAria")}
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {!rec ? (
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t("patients.dischargeArchive.empty")}
          </p>
        ) : (
          <div className="space-y-4">
            <div className={block}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-teal-400" : "text-teal-700"}`}>
                {t("patients.dischargeArchive.aiSection")}
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{rec.aiDiagnosis}</p>
            </div>
            <div className={block}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t("patients.dischargeArchive.doctorNotesSection")}
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{rec.doctorNotes}</p>
            </div>
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t("patients.dischargeArchive.qaSection")}
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
          className="mt-6 w-full min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {t("common:buttons.close")}
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
  const { toast, showToast } = useAppToast();
  const doctorsState = usePageState(getHADoctors);
  const patientsState = usePageState(getHAPatients);
  const haDoctors = doctorsState.data ?? [];
  const initialPatients = patientsState.data ?? [];
  const [isMutating, setIsMutating] = useState(false);
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
  } = usePatientsPageState(haDoctors, initialPatients);

  const handlePersistPatient = async (data: PatientFormData) => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      if (editingPatient) {
        await updateHAPatient(editingPatient.id, {
          name: data.name,
          phone: data.phone,
          age: Number(data.age || 0),
          gender: data.gender,
          doctorId: data.doctorId,
          diagnosis: data.diagnosis,
          status: data.status,
        });
      } else {
        await createHAPatient({
          name: data.name,
          phone: data.phone,
          age: Number(data.age || 0),
          gender: data.gender,
          doctorId: data.doctorId,
          diagnosis: data.diagnosis,
          status: data.status,
          nextVisit: null,
        });
      }
      await patientsState.reload();
      setShowModal(false);
      setEditingPatient(null);
      showToast(
        t("patients.toast.saveSuccess", { defaultValue: "Muvaffaqiyatli saqlandi." }),
        "success",
      );
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "ha-patients", op: "mutate-save" },
      });
      showToast(
        t("common:errors.saveFailed", { defaultValue: "Saqlashda xatolik yuz berdi." }),
        "error",
      );
      return;
    } finally {
      setIsMutating(false);
    }
  };

  const handlePersistDelete = async (id: string) => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      await deleteHAPatient(id);
      await patientsState.reload();
      setDeleteConfirm(null);
      showToast(
        t("patients.toast.deleteSuccess", { defaultValue: "Muvaffaqiyatli o'chirildi." }),
        "success",
      );
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "ha-patients", op: "mutate-delete" },
      });
      showToast(
        t("common:errors.deleteFailed", { defaultValue: "O'chirishda xatolik yuz berdi." }),
        "error",
      );
      return;
    } finally {
      setIsMutating(false);
    }
  };

  if (doctorsState.status === "loading" || patientsState.status === "loading") {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (doctorsState.status === "error" || patientsState.status === "error") {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
        <p className="mb-4">{doctorsState.error ?? patientsState.error}</p>
        <button
          type="button"
          onClick={() => {
            void doctorsState.reload();
            void patientsState.reload();
          }}
          className="min-h-[44px] px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

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
        <PatientModal patient={editingPatient} doctors={haDoctors} darkMode={darkMode} onClose={() => { setShowModal(false); setEditingPatient(null); }} onSave={handlePersistPatient} isSubmitting={isMutating} />
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
          void handlePersistDelete(deleteConfirm);
        }}
        confirmDisabled={isMutating}
        cancelDisabled={isMutating}
        darkMode={darkMode}
      />
      <AppToast toast={toast} />
    </>
  );
}
