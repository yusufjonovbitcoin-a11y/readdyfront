import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import AddHospitalPanel from "./components/AddHospitalPanel";
import HospitalsToolbar from "./components/HospitalsToolbar";
import HospitalsDataSection from "./components/HospitalsDataSection";
import { createHospital, deleteHospital, updateHospital } from "@/api/hospitals";
import { createUser } from "@/api/users";
import type { Hospital } from "@/types";
import { clampPage, getWindowedPageItems, paginateCollection } from "@/utils/pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import { useHospitals } from "@/hooks/useHospitals";

export function HospitalsPageContent() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dm = useMainLayoutDarkMode();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  const [togglingHospitalIds, setTogglingHospitalIds] = useState<Set<string>>(new Set());
  const [deletingHospitalId, setDeletingHospitalId] = useState<string | null>(null);
  const { toast, showToast } = useAppToast();
  const [page, setPage] = useState(1);
  const { hospitals, isLoading, isFetching, error, refetch } = useHospitals();
  const addHospitalTriggerRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);

  const PAGE_SIZE = 3;
  const cardClass = `rounded-xl p-4 border ${dm ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  const filtered = hospitals.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginationItems = getWindowedPageItems(page, totalPages);

  const pageRows = paginateCollection(filtered, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setPage((p) => clampPage(p, totalPages));
  }, [totalPages]);

  const updateHospitalsCache = useCallback(
    (updater: (prev: Hospital[]) => Hospital[]) => {
      queryClient.setQueryData<Hospital[]>(["hospitals"], (prev) => updater(prev ?? []));
    },
    [queryClient],
  );

  const handleAdd = async (data: Record<string, string>) => {
    if (isAddingHospital) return;
    setIsAddingHospital(true);
    let createdHospital: Hospital | null = null;
    try {
      const hospital = await createHospital({
        name: data.name,
        viloyat: "Boshqa",
        address: data.address,
        phone: data.phone,
        adminName: data.adminName,
        adminPhone: data.adminPhone,
      });
      createdHospital = hospital;
      try {
        await createUser({
          name: data.adminName,
          phone: data.adminPhone,
          email: "",
          role: "HOSPITAL_ADMIN",
          hospitalId: hospital.id,
          password: data.adminPassword,
        });
      } catch (adminError) {
        // Prevent partial state: hospital created but admin failed.
        await deleteHospital(hospital.id).catch(() => undefined);
        throw adminError;
      }
      updateHospitalsCache((prev) => [
        {
          ...hospital,
          adminName: data.adminName,
          adminPhone: data.adminPhone,
        },
        ...prev,
      ]);
      showToast(t("hospitals.toast.added"));
    } catch (error: unknown) {
      const apiError =
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: number; message?: string })
          : null;
      if (apiError?.status === 409) {
        showToast("Bu telefon raqami bilan kasalxona yoki foydalanuvchi allaqachon mavjud.", "error");
      } else if (apiError?.status === 400) {
        showToast(apiError.message || "Kiritilgan ma'lumotlar noto'g'ri.", "error");
      } else {
        showToast("Kasalxona yoki admin yaratishda xatolik yuz berdi", "error");
      }
      throw error;
    } finally {
      setIsAddingHospital(false);
    }
  };

  const renderListSkeleton = () => (
    <div className={`${cardClass} p-0 overflow-hidden`} aria-hidden="true">
      <div className="p-4 md:p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`hospital-skeleton-${idx}`}
            className={`h-14 rounded-lg animate-pulse ${dm ? "bg-[#1A2235]" : "bg-gray-100"}`}
          />
        ))}
      </div>
    </div>
  );

  const handleDelete = (id: string) => {
    if (deletingHospitalId) return;
    void (async () => {
      setDeletingHospitalId(id);
      try {
        const deleted = await deleteHospital(id);
        if (!deleted) {
          showToast("Kasalxonani o'chirib bo'lmadi", "error");
          return;
        }
        updateHospitalsCache((prev) => prev.filter((h) => h.id !== id));
        setDeleteId(null);
        showToast(t("hospitals.toast.deleted"));
      } catch {
        showToast("Kasalxonani o'chirishda xatolik yuz berdi", "error");
      } finally {
        setDeletingHospitalId(null);
      }
    })();
  };

  const toggleStatus = (id: string) => {
    if (togglingHospitalIds.has(id)) return;
    void (async () => {
      setTogglingHospitalIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      try {
        const target = hospitals.find((hospital) => hospital.id === id);
        if (!target) return;
        const updated = await updateHospital(id, {
          status: target.status === "active" ? "inactive" : "active",
        });
        if (!updated) {
          showToast("Kasalxona holatini yangilab bo'lmadi", "error");
          return;
        }
        updateHospitalsCache((prev) => prev.map((hospital) => (hospital.id === id ? updated : hospital)));
        showToast("Kasalxona holati yangilandi");
      } catch {
        showToast("Kasalxona holatini yangilashda xatolik yuz berdi", "error");
      } finally {
        setTogglingHospitalIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    })();
  };
  return (
    <>
      <AppToast toast={toast} />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t("hospitals.deleteConfirm.title")}
        description={t("hospitals.deleteConfirm.description")}
        confirmText={t("common:buttons.delete")}
        cancelText={t("common:buttons.cancel")}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        confirmDisabled={Boolean(deletingHospitalId)}
        cancelDisabled={Boolean(deletingHospitalId)}
        darkMode={dm}
        triggerRef={deleteTriggerRef}
      />

      <div className="space-y-5">
        {isLoading && hospitals.length === 0 ? renderListSkeleton() : null}
        {error ? (
          <div className={`${cardClass} py-14 text-center`}>
            <i className="ri-error-warning-line text-2xl text-red-500" />
            <p className={`mt-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{error.message}</p>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
            >
              Qayta yuklash
            </button>
          </div>
        ) : null}
        {!isLoading && !error && hospitals.length === 0 && !showAdd ? (
          <div className={`${cardClass} py-14 text-center`}>
            <i className={`ri-hospital-line text-3xl ${dm ? "text-gray-500" : "text-gray-400"}`} />
            <p className={`mt-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>Kasalxonalar ro'yxati hozircha bo'sh.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                disabled={isAddingHospital}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("hospitals.add")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${dm ? "bg-[#0F1117] text-gray-300" : "bg-gray-100 text-gray-700"}`}
              >
                Qayta tekshirish
              </button>
            </div>
          </div>
        ) : null}
        {error || (isLoading && hospitals.length === 0) ? null : (
        <>
          {isFetching ? (
            <div className={`h-1 w-full rounded-full overflow-hidden ${dm ? "bg-[#1A2235]" : "bg-gray-100"}`}>
              <div className="h-full w-1/3 bg-emerald-500 animate-pulse" />
            </div>
          ) : null}
          <HospitalsToolbar
            darkMode={dm}
            search={search}
            statusFilter={statusFilter}
            isAddingHospital={isAddingHospital}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onAddClick={() => setShowAdd(true)}
            addButtonRef={addHospitalTriggerRef}
          />

          <HospitalsDataSection
            darkMode={dm}
            hospitals={hospitals}
            filtered={filtered}
            pageRows={pageRows}
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            paginationItems={paginationItems}
            togglingHospitalIds={togglingHospitalIds}
            deletingHospitalId={deletingHospitalId}
            onToggleStatus={toggleStatus}
            onDeleteRequest={(id, trigger) => {
              deleteTriggerRef.current = trigger;
              setDeleteId(id);
            }}
            onNavigateDetail={(id) => navigate(`/hospitals/${id}`)}
            onPageChange={setPage}
          />
        </>
        )}
      </div>

      <AddHospitalPanel
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
        submitting={isAddingHospital}
        darkMode={dm}
        triggerRef={addHospitalTriggerRef}
      />
    </>
  );
}

export default function HospitalsPage() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("titles.hospitals")}>
      <HospitalsPageContent />
    </MainLayout>
  );
}
