import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import DoctorCard from "./components/DoctorCard";
import DoctorFormModal from "./components/DoctorFormModal";
import { deleteDoctor, getDoctors, updateDoctorStatus } from "@/api/doctor";
import type { DoctorDto as HADoctor } from "@/api/types/doctor.types";
import { createHADoctor } from "@/api/services/hospitalAdminData.service";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import { doctorsQueryOptions } from "@/lib/coreQueryCache";
import type { ApiError } from "@/api/client";

export default function HADoctorsPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.doctors")}>
      <HADoctorsPageContent />
    </HALayout>
  );
}

export function HADoctorsPageContent() {
  const { t } = useTranslation("hospital");
  const darkMode = useHospitalAdminDarkMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [doctors, setDoctors] = useState<HADoctor[]>([]);
  const pageState = useQuery({
    ...doctorsQueryOptions(),
    queryFn: getDoctors,
  });
  const [view, setView] = useState<'card' | 'table'>('card');
  const [search, setSearch] = useState(qParam);
  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      if (currentQ === search) return;

      const nextParams = new URLSearchParams(searchParams);
      if (search) nextParams.set("q", search);
      else nextParams.delete("q");

      setSearchParams(nextParams, { replace: true });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchParams, setSearchParams]);
  useEffect(() => {
    if (!pageState.data) return;
    setDoctors(pageState.data);
  }, [pageState.data]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<HADoctor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast, showToast } = useAppToast();
  const navigate = useNavigate();

  const filtered = doctors.filter(d => {
    const haystack = `${d.name} ${d.departmentName} ${d.specialty}`.toLowerCase();
    const matchSearch = haystack.includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Partial<HADoctor> & { password?: string }) => {
    if (isSaving) return;
    setIsSaving(true);
    void (async () => {
      try {
        if (editingDoctor) {
          const requestedStatus = data.status;
          const statusChanged =
            (requestedStatus === "active" || requestedStatus === "inactive") &&
            requestedStatus !== editingDoctor.status;

          const localProfileChanged = Boolean(
            (typeof data.name === "string" && data.name !== editingDoctor.name) ||
            (typeof data.specialty === "string" && data.specialty !== editingDoctor.specialty) ||
            (typeof data.phone === "string" && data.phone !== editingDoctor.phone) ||
            (typeof data.email === "string" && data.email !== editingDoctor.email),
          );

          let resolvedStatus = editingDoctor.status;
          if (statusChanged && requestedStatus) {
            const updated = await updateDoctorStatus(editingDoctor.id, { status: requestedStatus });
            if (!updated) {
              throw new Error("Doctor status update failed");
            }
            resolvedStatus = updated.status;
          }

          setDoctors((prev) =>
            prev.map((d) =>
              d.id === editingDoctor.id
                ? {
                    ...d,
                    ...data,
                    status: resolvedStatus,
                  }
                : d,
            ),
          );

          if (statusChanged && localProfileChanged) {
            showToast("Holat yangilandi. Qolgan tahrirlar hozircha faqat interfeysda aks etdi.", "info");
          } else if (statusChanged) {
            showToast("Shifokor holati server orqali muvaffaqiyatli yangilandi.", "success");
          } else {
            showToast("Shifokor tahriri hozircha faqat interfeysda aks etdi.", "info");
          }
        } else {
          if (!data.password) {
            throw new Error("Password is required");
          }
          await createHADoctor({
            name: data.name ?? "",
            specialty: data.specialty ?? "",
            phone: data.phone ?? "",
            password: data.password,
          });
          await pageState.refetch();
          showToast("Yangi shifokor serverga muvaffaqiyatli qo'shildi.", "success");
        }
        setShowModal(false);
        setEditingDoctor(null);
      } catch {
        showToast("Amalni bajarishda xatolik yuz berdi.", "error");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = (id: string) => {
    void (async () => {
      try {
        await deleteDoctor(id);
        setDoctors((prev) => prev.filter((d) => d.id !== id));
        setDeleteConfirm(null);
        showToast("Shifokor backenddan ham muvaffaqiyatli o'chirildi.", "success");
      } catch (error) {
        const apiError = error as Partial<ApiError> | null;
        if (apiError?.status === 409) {
          showToast(
            "Bu shifokorni o'chirib bo'lmaydi: unga bog'langan bemor javoblari mavjud.",
            "error",
          );
          return;
        }
        showToast("Shifokorni o'chirishda xatolik yuz berdi.", "error");
      }
    })();
  };

  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;

  return (
    <>
      <AppToast toast={toast} />
      {pageState.isLoading ? (
        <div className={`rounded-xl border py-16 text-center ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <i className="ri-loader-4-line always-spin text-2xl text-teal-500" />
          <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Shifokorlar yuklanmoqda...</p>
        </div>
      ) : null}
      {pageState.isError ? (
        <div className={`rounded-xl border py-14 text-center ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <i className="ri-error-warning-line text-2xl text-red-500" />
          <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{pageState.error instanceof Error ? pageState.error.message : "Shifokorlarni yuklashda xatolik yuz berdi."}</p>
          <button
            type="button"
            onClick={() => { void pageState.refetch(); }}
            className="mt-4 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
          >
            Qayta yuklash
          </button>
        </div>
      ) : null}
      {pageState.isSuccess && doctors.length === 0 && !showModal ? (
        <div className={`rounded-xl border py-14 text-center ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <i className={`ri-stethoscope-line text-3xl ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{t("doctors.empty")}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => { setEditingDoctor(null); setShowModal(true); }}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
            >
              {t("doctors.add")}
            </button>
            <button
              type="button"
              onClick={() => { void pageState.refetch(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}
            >
              Qayta tekshirish
            </button>
          </div>
        </div>
      ) : null}
      {pageState.status !== "success" || doctors.length === 0 ? null : (
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative w-full sm:w-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input
                type="text"
                placeholder={t("doctors.search")}
                className={`${inputClass} pl-9 w-full sm:w-64`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className={inputClass}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">{t("doctors.filters.allStatuses")}</option>
              <option value="active">{t("common:status.active")}</option>
              <option value="inactive">{t("common:status.inactive")}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className={`flex items-center rounded-lg p-1 ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
              <button
                onClick={() => setView('card')}
                aria-label="Card view"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${view === 'card' ? 'bg-white text-teal-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <i className="ri-layout-grid-line text-sm"></i>
              </button>
              <button
                onClick={() => setView('table')}
                aria-label="Table view"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${view === 'table' ? 'bg-white text-teal-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>

            <button
              onClick={() => { setEditingDoctor(null); setShowModal(true); }}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-base"></i>
              {t("doctors.add")}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t("doctors.total")} <strong className={darkMode ? "text-white" : "text-gray-900"}>{filtered.length}</strong> {t("doctors.doctorsCount")}
          </span>
          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            {filtered.filter(d => d.status === 'active').length} {t("common:status.active")}
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
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("doctors.empty")}</p>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
            <div className="overflow-x-auto">
              <ResponsiveTable minWidthClassName="min-w-[860px]" caption="Hospital admin doctors table">
                <thead>
                  <tr className={`text-xs border-b ${darkMode ? "border-[#1E2130] text-gray-400" : "border-gray-100 text-gray-500"}`}>
                    <th scope="col" className="text-left px-5 py-3 font-medium">{t("doctors.table.doctor")}</th>
                    <th scope="col" className="text-left px-5 py-3 font-medium">{t("doctors.table.specialty")}</th>
                    <th scope="col" className="hidden md:table-cell text-left px-5 py-3 font-medium">{t("doctors.table.phone")}</th>
                    <th scope="col" className="text-left px-5 py-3 font-medium">{t("doctors.table.todayPatients")}</th>
                    <th scope="col" className="hidden sm:table-cell text-left px-5 py-3 font-medium">{t("doctors.table.rating")}</th>
                    <th scope="col" className="text-left px-5 py-3 font-medium">{t("doctors.table.status")}</th>
                    <th scope="col" className="text-left px-5 py-3 font-medium">{t("doctors.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const rowDisplayName = doc.name?.trim() || doc.specialty?.trim() || "Doctor";
                    return (
                    <tr key={doc.id} className={`border-b last:border-0 ${darkMode ? "border-[#1E2130] hover:bg-[#1A2235]" : "border-gray-50 hover:bg-gray-50"} transition-colors`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={doc.avatar} alt={rowDisplayName} className="w-full h-full object-cover object-top" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{rowDisplayName}</p>
                            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doc.specialty}</td>
                      <td className={`hidden md:table-cell px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doc.phone}</td>
                      <td className={`px-5 py-3 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.todayPatients}</td>
                      <td className="hidden sm:table-cell px-5 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-star-fill text-amber-400 text-xs"></i>
                          </div>
                          <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.rating}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusChip
                          label={doc.status === 'active' ? t("common:status.active") : t("common:status.inactive")}
                          tone={doc.status === "active" ? "success" : "danger"}
                          icon={
                            <i
                              className={doc.status === "active" ? "ri-checkbox-circle-line text-[11px]" : "ri-close-circle-line text-[11px]"}
                              aria-hidden="true"
                            />
                          }
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button aria-label={`View doctor ${rowDisplayName}`} onClick={() => navigate(`/hospital-admin/doctors/${doc.id}`)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer hover:bg-teal-50 text-teal-600 transition-colors">
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                          <button aria-label={`Edit doctor ${rowDisplayName}`} onClick={() => { setEditingDoctor(doc); setShowModal(true); }} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button aria-label={`Delete doctor ${rowDisplayName}`} onClick={() => setDeleteConfirm(doc.id)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors">
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </ResponsiveTable>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <DoctorFormModal
          doctor={editingDoctor}
          darkMode={darkMode}
          isSaving={isSaving}
          onClose={() => {
            if (isSaving) return;
            setShowModal(false);
            setEditingDoctor(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title={t("doctors.confirmDelete")}
        description={t("doctors.confirmDeleteDesc")}
        confirmText={t("common:buttons.delete")}
        cancelText={t("common:buttons.cancel")}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDelete(deleteConfirm);
        }}
        darkMode={darkMode}
      />
    </>
  );
}
