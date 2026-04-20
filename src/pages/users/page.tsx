import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { createUser, deleteUser, getUsers, updateUser } from "@/api/users";
import { getHospitals } from "@/api/hospitals";
import type { UserDto } from "@/api/types/users.types";
import type { Hospital } from "@/types";
import { layoutSystem } from "@/styles/layoutSystem";
import { clampPage, getWindowedPageItems, paginateCollection } from "@/utils/pagination";
import { usePageState } from "@/hooks/usePageState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import UsersToolbar from "./components/UsersToolbar";
import UserFormPanel from "./components/UserFormPanel";
import UsersDataSection from "./components/UsersDataSection";

type User = UserDto;
type RoleFilter = "all" | "HOSPITAL_ADMIN" | "DOCTOR";

export function UsersPageContent() {
  const { t } = useTranslation("admin");
  const dm = useMainLayoutDarkMode();
  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [togglingUserIds, setTogglingUserIds] = useState<Set<string>>(new Set());
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "HOSPITAL_ADMIN", hospitalId: "1", password: "" });
  const { toast, showToast } = useAppToast();
  const [page, setPage] = useState(1);
  const fetchInitialData = useCallback(async () => {
    const [usersData, hospitalsData] = await Promise.all([getUsers(), getHospitals()]);
    return { usersData, hospitalsData };
  }, []);
  const pageState = usePageState(fetchInitialData);

  const PAGE_SIZE = 5;

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = paginateCollection(filtered, page, PAGE_SIZE);
  const paginationItems = getWindowedPageItems(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    setPage((p) => clampPage(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!pageState.data) return;
    setUsers(pageState.data.usersData);
    setHospitals(pageState.data.hospitalsData);
  }, [pageState.data]);

  const resetForm = useCallback(() => {
    setForm({ name: "", phone: "", email: "", role: "HOSPITAL_ADMIN", hospitalId: hospitals[0]?.id ?? "1", password: "" });
    setEditingUser(null);
  }, [hospitals]);

  const handleSaveUser = () => {
    if (isSavingUser) return;
    if (!form.name || !form.phone) return;
    if (!editingUser && !form.password) return;
    void (async () => {
      setIsSavingUser(true);
      try {
        if (editingUser) {
          const updated = await updateUser(editingUser.id, {
            name: form.name,
            phone: form.phone,
            email: form.email,
            role: form.role as User["role"],
            hospitalId: form.hospitalId,
            ...(form.password ? { password: form.password } : {}),
          });
          if (!updated) throw new Error("User topilmadi");
          setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? updated : user)));
          showToast("Foydalanuvchi yangilandi");
        } else {
          const created = await createUser({
            name: form.name,
            phone: form.phone,
            email: form.email,
            role: form.role as User["role"],
            hospitalId: form.hospitalId,
            password: form.password,
          });
          setUsers((prev) => [created, ...prev]);
          showToast(t("users.toast.added"));
        }
        setShowAdd(false);
        resetForm();
      } catch {
        showToast("Amalni bajarishda xatolik yuz berdi", "error");
      } finally {
        setIsSavingUser(false);
      }
    })();
  };

  const handleToggleStatus = (id: string) => {
    if (togglingUserIds.has(id)) return;
    void (async () => {
      setTogglingUserIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      try {
        const target = users.find((user) => user.id === id);
        if (!target) return;
        const updated = await updateUser(id, { status: target.status === "active" ? "inactive" : "active" });
        if (!updated) {
          showToast("Foydalanuvchi holatini yangilab bo'lmadi", "error");
          return;
        }
        setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
        showToast("Foydalanuvchi holati yangilandi");
      } catch {
        showToast("Amalni bajarishda xatolik yuz berdi", "error");
      } finally {
        setTogglingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    })();
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
      password: "",
    });
    setShowAdd(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    if (deletingUserId) return;
    void (async () => {
      setDeletingUserId(deleteConfirmId);
      try {
        const ok = await deleteUser(deleteConfirmId);
        if (!ok) throw new Error("Delete failed");
        setUsers((prev) => prev.filter((user) => user.id !== deleteConfirmId));
        setDeleteConfirmId(null);
        showToast(t("users.toast.deleted", { defaultValue: "Foydalanuvchi o'chirildi" }));
      } catch {
        showToast("Amalni bajarishda xatolik yuz berdi", "error");
      } finally {
        setDeletingUserId(null);
      }
    })();
  };

  const cardClass = `rounded-xl ${layoutSystem.cardPaddingCompact} border ${dm ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  return (
    <>
      <AppToast toast={toast} />

      {pageState.status === "loading" ? (
        <div className={`${cardClass} py-16 text-center`}>
          <i className="ri-loader-4-line animate-spin text-2xl text-emerald-500" />
          <p className={`mt-3 text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>Foydalanuvchilar yuklanmoqda...</p>
        </div>
      ) : null}

      {pageState.status === "error" ? (
        <div className={`${cardClass} py-14 text-center`}>
          <i className="ri-error-warning-line text-2xl text-red-500" />
          <p className={`mt-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{pageState.error}</p>
          <button
            type="button"
            onClick={pageState.reload}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
          >
            Qayta yuklash
          </button>
        </div>
      ) : null}

      {pageState.status !== "success" ? null : users.length === 0 && !showAdd ? (
        <div className={`${cardClass} py-14 text-center`}>
          <i className={`ri-user-search-line text-3xl ${dm ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`mt-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>Foydalanuvchilar ro'yxati hozircha bo'sh.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => { resetForm(); setShowAdd(true); }}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
            >
              {t("users.add")}
            </button>
            <button
              type="button"
              onClick={pageState.reload}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${dm ? "bg-[#0F1117] text-gray-300" : "bg-gray-100 text-gray-700"}`}
            >
              Qayta tekshirish
            </button>
          </div>
        </div>
      ) : (

      <div className={layoutSystem.sectionStack}>
        <UsersToolbar
          darkMode={dm}
          search={search}
          roleFilter={roleFilter}
          onSearchChange={setSearch}
          onRoleFilterChange={setRoleFilter}
          onAddClick={() => {
            resetForm();
            setShowAdd(true);
          }}
        />

        <UserFormPanel
          darkMode={dm}
          open={showAdd}
          editing={Boolean(editingUser)}
          form={form}
          hospitals={hospitals}
          isSaving={isSavingUser}
          onFormChange={setForm}
          onCancel={() => {
            setShowAdd(false);
            resetForm();
          }}
          onSave={handleSaveUser}
        />

        <UsersDataSection
          darkMode={dm}
          users={users}
          filteredCount={filtered.length}
          pageRows={pageRows}
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          paginationItems={paginationItems}
          isSavingUser={isSavingUser}
          togglingUserIds={togglingUserIds}
          deletingUserId={deletingUserId}
          onToggleStatus={handleToggleStatus}
          onEditUser={openEdit}
          onDeleteUser={setDeleteConfirmId}
          onPageChange={setPage}
        />
      </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Foydalanuvchini o'chirish"
        description="Ushbu foydalanuvchini o'chirmoqchimisiz?"
        confirmText={t("common:buttons.delete")}
        cancelText={t("common:buttons.cancel")}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        confirmDisabled={Boolean(deletingUserId)}
        cancelDisabled={Boolean(deletingUserId)}
        darkMode={dm}
      />
    </>
  );
}

export default function UsersPage() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("titles.users")}>
      <UsersPageContent />
    </MainLayout>
  );
}
