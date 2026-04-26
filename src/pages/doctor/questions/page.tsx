import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useModalA11y } from "@/hooks/useModalA11y";
import {
  createDoctorQuestionWithTemplate,
  deleteDoctorQuestion,
  getDoctorById,
  getDoctorQuestionCategories,
  getDoctorQuestions,
  getDoctorQuestionTemplates,
  updateDoctorQuestion,
} from "@/api/doctor";
import type {
  DoctorQuestionCategoryDto,
  DoctorQuestionDto as DocQuestion,
  DoctorQuestionTemplateDto,
} from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";
import PageStateBoundary from "@/components/ui/PageStateBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useAppToast } from "@/hooks/useAppToast";
import AppToast from "@/components/ui/AppToast";

interface QuestionFormData {
  questionnaireTitle: string;
  text: string;
  category: string;
  categoryId: string;
  answerMode: "boolean" | "text";
}

interface DoctorQuestionsPageData {
  questions: DocQuestion[];
  categories: DoctorQuestionCategoryDto[];
  templates: DoctorQuestionTemplateDto[];
}

const MODAL_INERT_SELECTORS = ["header", "main", "aside"];

function getDefaultQuestionFormData(categories: DoctorQuestionCategoryDto[]): QuestionFormData {
  const defaultCategory =
    categories.find((category) => category.id !== "all") ??
    categories[0];
  return {
    questionnaireTitle: "",
    text: "",
    category: defaultCategory?.name ?? "General",
    categoryId: defaultCategory?.id ?? "cat-001",
    answerMode: "boolean",
  };
}

export default function DocQuestionsPage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("sidebar.questions")}>
      <DocQuestionsContent />
    </DocLayout>
  );
}

export function DocQuestionsContent() {
  const { t } = useTranslation("doctor");
  const { darkMode } = useDoctorTheme();
  const { user } = useAuth();
  const canMutateQuestions = true;
  const [questions, setQuestions] = useState<DocQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DocQuestion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categories, setCategories] = useState<DoctorQuestionCategoryDto[]>([]);
  const [templates, setTemplates] = useState<DoctorQuestionTemplateDto[]>([]);
  const [formData, setFormData] = useState<QuestionFormData>({
    questionnaireTitle: "",
    text: "",
    category: t("questions.defaultCategory"),
    categoryId: "cat-001",
    answerMode: "boolean",
  });
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [doctorDepartmentId, setDoctorDepartmentId] = useState<string | null>(null);
  const [questionAnswerModes, setQuestionAnswerModes] = useState<Record<string, "boolean" | "text">>({});
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const { toast, showToast } = useAppToast();
  const fetchPageData = useCallback(async (): Promise<DoctorQuestionsPageData> => {
    const [questionsData, categoriesData, templatesData] = await Promise.all([
      getDoctorQuestions(),
      getDoctorQuestionCategories(),
      getDoctorQuestionTemplates(),
    ]);
    return { questions: questionsData, categories: categoriesData, templates: templatesData };
  }, []);
  const pageState = usePageState(fetchPageData);
  useEffect(() => {
    if (!pageState.data) return;
    const loadedData = pageState.data;
    setQuestions(loadedData.questions);
    setCategories(loadedData.categories);
    setTemplates(loadedData.templates);
    setFormData((prev) => {
      if (prev.text.trim().length > 0) return prev;
      if (loadedData.categories.some((category) => category.id === prev.categoryId)) {
        return prev;
      }
      return getDefaultQuestionFormData(loadedData.categories);
    });
  }, [pageState.data]);

  useEffect(() => {
    if (user?.role !== "DOCTOR" || !user.id || categories.length === 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const doctor = await getDoctorById(user.id);
        if (cancelled || !doctor?.specialty) return;
        const matched = categories.find(
          (category) => category.name.trim().toLowerCase() === doctor.specialty.trim().toLowerCase(),
        );
        if (matched) {
          setDoctorDepartmentId(matched.id);
        }
      } catch {
        // ignore, fallback to categories list
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categories, user?.id, user?.role]);

  const addQuestionButtonRef = useRef<HTMLButtonElement>(null);
  const cloneButtonRef = useRef<HTMLButtonElement>(null);
  const addEditTextRef = useRef<HTMLTextAreaElement>(null);
  const questionnaireTitleInputRef = useRef<HTMLInputElement>(null);

  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const cardHover = darkMode ? "hover:border-violet-500/40" : "hover:border-violet-200";
  const borderSubtle = darkMode ? "border-[#30363D]" : "border-gray-100";
  const textBody = darkMode ? "text-gray-200" : "text-gray-800";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-400";
  const inputBase = darkMode
    ? "pl-9 pr-4 py-2 text-sm rounded-lg bg-[#0D1117] border border-[#30363D] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 w-52"
    : "pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 w-52";
  const searchIcon = darkMode ? "text-gray-500" : "text-gray-400";
  const btnGhost = darkMode
    ? "border border-[#30363D] bg-[#21262D] text-gray-200 hover:bg-[#30363D]"
    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
  const statGreen = darkMode ? "text-emerald-400" : "text-green-600";
  const statGray = darkMode ? "text-gray-500" : "text-gray-400";
  const statViolet = darkMode ? "text-violet-400" : "text-violet-600";
  const badgeCat = darkMode ? "bg-violet-900/40 text-violet-300" : "bg-violet-100 text-violet-700";
  const badgeCustom = darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700";
  const iconBtn = darkMode
    ? "hover:bg-[#21262D] text-gray-400 hover:text-gray-200"
    : "hover:bg-gray-100 text-gray-400 hover:text-gray-700";
  const iconBtnDel = darkMode ? "hover:bg-red-950/40 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500";
  const modalPanel = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white";
  const modalTitle = darkMode ? "text-white" : "text-gray-900";
  const labelCls = darkMode ? "text-gray-300" : "text-gray-700";
  const fieldBase = darkMode
    ? "w-full text-sm border border-[#30363D] rounded-lg px-3 py-2.5 bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
    : "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400";
  const btnSecondary = darkMode
    ? "border border-[#30363D] text-gray-200 hover:bg-[#21262D]"
    : "border border-gray-200 text-gray-600 hover:bg-gray-50";
  const closeBtn = darkMode ? "hover:bg-[#21262D] text-gray-400" : "hover:bg-gray-100 text-gray-400";
  const cloneRow = darkMode
    ? "border border-[#30363D] hover:border-violet-500/40"
    : "border border-gray-100 hover:border-violet-200";
  const cloneText = darkMode ? "text-gray-200" : "text-gray-800";
  const cloneCat = darkMode ? "text-violet-400" : "text-violet-600";
  const cloneBtn = darkMode
    ? "bg-violet-900/40 text-violet-200 hover:bg-violet-900/60"
    : "bg-violet-50 text-violet-700 hover:bg-violet-100";
  const questionTextId = "doctor-question-form-text";
  const questionTextHelpId = "doctor-question-form-text-help";
  const questionnaireTitleId = "doctor-questionnaire-form-title";
  const questionnaireTitleHelpId = "doctor-questionnaire-form-title-help";
  const questionCategoryId = "doctor-question-form-category";
  const questionCategoryHelpId = "doctor-question-form-category-help";
  const selectableCategories = doctorDepartmentId
    ? categories.filter((category) => category.id === doctorDepartmentId)
    : categories.filter((category) => category.id !== "all");

  const filtered = questions.filter((q) => q.text.toLowerCase().includes(search.toLowerCase()));
  const filteredOrderIndex = new Map(filtered.map((q, index) => [q.id, index]));

  const moveQuestionBefore = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setQuestions((prev) => {
      const source = prev.find((q) => q.id === sourceId);
      const target = prev.find((q) => q.id === targetId);
      if (!source || !target) return prev;

      const sourceFilteredIndex = filteredOrderIndex.get(sourceId);
      const targetFilteredIndex = filteredOrderIndex.get(targetId);
      if (sourceFilteredIndex == null || targetFilteredIndex == null) return prev;

      const filteredWithoutSource = filtered.filter((q) => q.id !== sourceId);
      const insertAt = filteredWithoutSource.findIndex((q) => q.id === targetId);
      if (insertAt < 0) return prev;
      const reorderedFiltered = [...filteredWithoutSource];
      reorderedFiltered.splice(insertAt, 0, source);
      const reorderedIds = new Set(reorderedFiltered.map((q) => q.id));
      let writeIndex = 0;
      return prev.map((q) => {
        if (!reorderedIds.has(q.id)) return q;
        const nextQuestion = reorderedFiltered[writeIndex];
        writeIndex += 1;
        return nextQuestion;
      });
    });
  };

  const handleAdd = async () => {
    if (!canMutateQuestions) return;
    if (!formData.text.trim()) {
      showToast("Savol matnini kiriting.", "error");
      return;
    }
    if (!formData.questionnaireTitle.trim()) {
      showToast("Shablon nomini kiriting.", "error");
      return;
    }
    if (!formData.categoryId || formData.categoryId === "all") {
      showToast("Bo'lim aniqlanmadi. Sahifani yangilab qayta urinib ko'ring.", "error");
      return;
    }
    if (!selectableCategories.some((category) => category.id === formData.categoryId)) {
      showToast("Tanlangan bo'lim yaroqsiz. Bo'limni qayta tanlang.", "error");
      return;
    }
    setIsSubmittingQuestion(true);
    try {
      const createdQuestion = await createDoctorQuestionWithTemplate({
        title: formData.questionnaireTitle,
        text: formData.text,
        departmentId: formData.categoryId,
        answerMode: formData.answerMode,
      });
      setQuestions((prev) => [createdQuestion, ...prev]);
      setQuestionAnswerModes((prev) => ({ ...prev, [createdQuestion.id]: formData.answerMode }));
      setFormData(getDefaultQuestionFormData(categories));
      setShowAddModal(false);
    } catch (error) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Savolni qo'shib bo'lmadi. Bo'lim yoki API ma'lumotlarini tekshirib qayta urinib ko'ring.";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleEdit = () => {
    if (!canMutateQuestions) return;
    if (!editingQuestion || !formData.text.trim()) return;
    void (async () => {
      try {
        await updateDoctorQuestion(editingQuestion.id, formData.text);
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion.id ? { ...q, text: formData.text, category: formData.category, categoryId: formData.categoryId } : q
          )
        );
        setQuestionAnswerModes((prev) => ({ ...prev, [editingQuestion.id]: formData.answerMode }));
        setEditingQuestion(null);
        setFormData(getDefaultQuestionFormData(categories));
        showToast("Savol muvaffaqiyatli yangilandi.", "success");
      } catch (error) {
        const message =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : "Savolni yangilab bo'lmadi.";
        showToast(message, "error");
      }
    })();
  };

  const handleDelete = (id: string) => {
    if (!canMutateQuestions) return;
    void (async () => {
      try {
        await deleteDoctorQuestion(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setQuestionAnswerModes((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setDeleteConfirm(null);
        showToast("Savol o'chirildi.", "success");
      } catch (error) {
        const message =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : "Savolni o'chirib bo'lmadi.";
        showToast(message, "error");
      }
    })();
  };

  const handleToggleStatus = (id: string) => {
    if (!canMutateQuestions) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: q.status === "active" ? "inactive" : "active" } : q))
    );
  };

  const handleClone = (template: DoctorQuestionTemplateDto) => {
    if (!canMutateQuestions) return;
    void (async () => {
      try {
        const created = await createDoctorQuestionWithTemplate({
          title: template.text.slice(0, 80) || "Template question",
          text: template.text,
          departmentId: template.categoryId,
          answerMode: "boolean",
        });
        setQuestions((prev) => [created, ...prev]);
        setQuestionAnswerModes((prev) => ({ ...prev, [created.id]: "boolean" }));
        setShowCloneModal(false);
        showToast("Shablondan savol qo'shildi.", "success");
      } catch (error) {
        const message =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : "Shablondan savol qo'shib bo'lmadi.";
        showToast(message, "error");
      }
    })();
  };

  const openEdit = (q: DocQuestion) => {
    setEditingQuestion(q);
    setFormData({
      questionnaireTitle: q.text.slice(0, 80),
      text: q.text,
      category: q.category,
      categoryId: q.categoryId,
      answerMode: questionAnswerModes[q.id] ?? "boolean",
    });
  };
  const closeAddEditModal = useCallback(() => {
    setShowAddModal(false);
    setEditingQuestion(null);
  }, []);
  const addEditModalRef = useModalA11y({
    isOpen: showAddModal || Boolean(editingQuestion),
    onClose: closeAddEditModal,
    returnFocusRef: addQuestionButtonRef,
    inertSelectors: MODAL_INERT_SELECTORS,
  });
  const cloneModalRef = useModalA11y({
    isOpen: showCloneModal,
    onClose: () => setShowCloneModal(false),
    returnFocusRef: cloneButtonRef,
    inertSelectors: MODAL_INERT_SELECTORS,
  });
  const deleteModalRef = useModalA11y({
    isOpen: Boolean(deleteConfirm),
    onClose: () => setDeleteConfirm(null),
    inertSelectors: MODAL_INERT_SELECTORS,
  });

  return (
    <>
      <AppToast toast={toast} />
      <PageStateBoundary state={pageState}>
        {() => (
          <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-bold ${pageTitle}`}>{t("questions.title")}</h2>
          <p className={`text-sm mt-0.5 ${pageMuted}`}>{t("questions.subtitle")} {questions.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={cloneButtonRef}
            type="button"
            disabled={!canMutateQuestions}
            onClick={() => setShowCloneModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${btnGhost}`}
          >
            <i className="ri-file-copy-line text-sm"></i>
            {t("questions.cloneTemplate")}
          </button>
          <button
            ref={addQuestionButtonRef}
            type="button"
            disabled={!canMutateQuestions}
            onClick={() => {
              setShowAddModal(true);
              setFormData(() => {
                const next = getDefaultQuestionFormData(categories);
                if (!doctorDepartmentId) return next;
                const matched = categories.find((category) => category.id === doctorDepartmentId);
                if (!matched) return next;
                return {
                  ...next,
                  categoryId: matched.id,
                  category: matched.name,
                  answerMode: "boolean",
                };
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-add-line text-sm"></i>
            {t("questions.add")}
          </button>
        </div>
      </div>
      {!canMutateQuestions && (
        <p className={`text-xs ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
          {t("questions.mutationsDisabled")}
        </p>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm ${searchIcon}`}></i>
        <input
          type="text"
          placeholder={t("questions.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statGreen}`}>{questions.filter((q) => q.status === "active").length}</span> {t("questions.stats.active")}
        </span>
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statGray}`}>{questions.filter((q) => q.status === "inactive").length}</span> {t("questions.stats.inactive")}
        </span>
        <span className={`text-sm ${pageMuted}`}>
          <span className={`font-semibold ${statViolet}`}>{questions.filter((q) => q.isCustom).length}</span> {t("questions.stats.custom")}
        </span>
      </div>

      {/* Questions Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
            <i className={`ri-questionnaire-line text-2xl ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
          </div>
          <p className={`font-medium ${pageMuted}`}>{t("questions.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q, i) => (
            <div
              key={q.id}
              draggable
              onDragStart={() => {
                setDraggingQuestionId(q.id);
                setDragOverQuestionId(q.id);
              }}
              onDragEnter={() => {
                if (!draggingQuestionId || draggingQuestionId === q.id) return;
                setDragOverQuestionId(q.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggingQuestionId || draggingQuestionId === q.id) return;
                moveQuestionBefore(draggingQuestionId, q.id);
                setDraggingQuestionId(null);
                setDragOverQuestionId(null);
              }}
              onDragEnd={() => {
                setDraggingQuestionId(null);
                setDragOverQuestionId(null);
              }}
              className={`rounded-xl p-4 transition-all ${cardBase} ${
                q.status === "inactive" ? `opacity-60 ${darkMode ? "border-[#30363D]" : "border-gray-100"}` : cardHover
              } ${
                draggingQuestionId === q.id ? "opacity-60 scale-[0.98]" : ""
              } ${
                dragOverQuestionId === q.id && draggingQuestionId !== q.id
                  ? darkMode
                    ? "ring-2 ring-violet-500/50"
                    : "ring-2 ring-violet-300"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 flex-wrap pr-2">
                  <span
                    className={`flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-lg px-1.5 text-xs font-bold tabular-nums ${
                      darkMode ? "bg-violet-900/45 text-violet-200" : "bg-violet-100 text-violet-700"
                    }`}
                    title={t("questions.orderTitle", { order: i + 1 })}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCat}`}>{q.category}</span>
                  {q.isCustom && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCustom}`}>{t("questions.stats.custom")}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-[#21262D] text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                    {questionAnswerModes[q.id] === "text" ? "Ixtiyoriy" : "HA / YO'Q"}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!canMutateQuestions}
                  role="switch"
                  aria-checked={q.status === "active"}
                  aria-label={q.status === "active" ? t("questions.aria.deactivate") : t("questions.aria.activate")}
                  onClick={() => handleToggleStatus(q.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode ? "focus-visible:ring-offset-[#0D1117]" : "focus-visible:ring-offset-white"
                  } ${
                    q.status === "active"
                      ? "bg-emerald-500"
                      : darkMode
                        ? "bg-[#30363D]"
                        : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                      q.status === "active" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className={`text-sm font-medium leading-relaxed mb-4 ${textBody}`}>{q.text}</p>

              <div className={`flex items-center justify-between pt-3 border-t ${borderSubtle}`}>
                <span className={`text-xs ${textMuted}`}>{q.createdAt}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!canMutateQuestions}
                    onClick={() => openEdit(q)}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${iconBtn}`}
                    aria-label={t("questions.aria.edit", { text: q.text })}
                  >
                    <i className="ri-edit-2-line text-sm" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    disabled={!canMutateQuestions}
                    onClick={() => setDeleteConfirm(q.id)}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${iconBtnDel}`}
                    aria-label={t("questions.aria.delete", { text: q.text })}
                  >
                    <i className="ri-delete-bin-line text-sm" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingQuestion) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            ref={addEditModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-question-edit-title"
            tabIndex={-1}
            className={`rounded-2xl p-6 w-full max-w-md mx-4 ${modalPanel}`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 id="doctor-question-edit-title" className={`text-base font-semibold ${modalTitle}`}>
                {editingQuestion ? t("questions.editTitle") : t("questions.newTitle")}
              </h3>
              <button
                onClick={closeAddEditModal}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer ${closeBtn}`}
                aria-label={t("questions.aria.closeQuestionModal")}
              >
                <i className="ri-close-line text-base" aria-hidden="true"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor={questionnaireTitleId} className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                  Shablon nomi
                </label>
                <input
                  ref={questionnaireTitleInputRef}
                  autoFocus={showAddModal && !editingQuestion}
                  id={questionnaireTitleId}
                  value={formData.questionnaireTitle}
                  onChange={(e) => setFormData({ ...formData, questionnaireTitle: e.target.value })}
                  placeholder="Masalan: Patient satisfaction survey"
                  maxLength={120}
                  aria-describedby={questionnaireTitleHelpId}
                  className={fieldBase}
                />
                <p id={questionnaireTitleHelpId} className={`text-xs mt-1 ${textMuted}`}>
                  120 belgigacha
                </p>
              </div>
              <div>
                <p className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Javob shakli</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, answerMode: "boolean" })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      formData.answerMode === "boolean"
                        ? darkMode
                          ? "border-violet-500 bg-violet-900/30 text-violet-200"
                          : "border-violet-500 bg-violet-50 text-violet-700"
                        : darkMode
                          ? "border-[#30363D] text-gray-300 hover:bg-[#21262D]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    HA / YO'Q
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, answerMode: "text" })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      formData.answerMode === "text"
                        ? darkMode
                          ? "border-violet-500 bg-violet-900/30 text-violet-200"
                          : "border-violet-500 bg-violet-50 text-violet-700"
                        : darkMode
                          ? "border-[#30363D] text-gray-300 hover:bg-[#21262D]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Ixtiyoriy
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor={questionTextId} className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t("questions.questionText")}</label>
                <textarea
                  ref={addEditTextRef}
                  autoFocus={Boolean(editingQuestion)}
                  id={questionTextId}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder={t("questions.questionPlaceholder")}
                  rows={3}
                  maxLength={500}
                  aria-describedby={questionTextHelpId}
                  className={`${fieldBase} resize-none`}
                />
                <p id={questionTextHelpId} className={`text-xs mt-1 ${textMuted}`}>{formData.text.length}/500</p>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={closeAddEditModal}
                className={`flex-1 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnSecondary}`}
              >
                {t("common:buttons.cancel")}
              </button>
              <button
                onClick={() => {
                  if (editingQuestion) {
                    handleEdit();
                    return;
                  }
                  void handleAdd();
                }}
                disabled={
                  !formData.text.trim() ||
                  (!editingQuestion && (!formData.questionnaireTitle.trim() || isSubmittingQuestion))
                }
                className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {editingQuestion ? t("questions.save") : isSubmittingQuestion ? "Yaratilmoqda..." : t("questions.add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            ref={cloneModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-question-clone-title"
            tabIndex={-1}
            className={`rounded-2xl p-6 w-full max-w-md mx-4 ${modalPanel}`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 id="doctor-question-clone-title" className={`text-base font-semibold ${modalTitle}`}>{t("questions.globalTemplates")}</h3>
              <button
                onClick={() => setShowCloneModal(false)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer ${closeBtn}`}
                aria-label={t("questions.aria.closeTemplateModal")}
              >
                <i className="ri-close-line text-base" aria-hidden="true"></i>
              </button>
            </div>
            <p className={`text-sm mb-4 ${pageMuted}`}>{t("questions.chooseTemplate")}</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {templates.map((tpl) => (
                <div key={tpl.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${cloneRow}`}>
                  <div>
                    <p className={`text-sm ${cloneText}`}>{tpl.text}</p>
                    <span className={`text-xs ${cloneCat}`}>{tpl.category}</span>
                  </div>
                  <button
                    onClick={() => handleClone(tpl)}
                    className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${cloneBtn}`}
                  >
                    {t("questions.clone")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

          {/* Delete Confirm */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div
                ref={deleteModalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="doctor-question-delete-title"
                tabIndex={-1}
                className={`rounded-2xl p-6 w-full max-w-sm mx-4 ${modalPanel}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${darkMode ? "bg-red-950/50" : "bg-red-100"}`}>
                    <i className="ri-delete-bin-line text-red-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 id="doctor-question-delete-title" className={`text-base font-semibold ${modalTitle}`}>{t("questions.confirmDelete")}</h3>
                    <p className={`text-sm ${pageMuted}`}>{t("questions.deleteWarning")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className={`flex-1 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnSecondary}`}
                  >
                    {t("common:buttons.cancel")}
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {t("common:buttons.delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </PageStateBoundary>
    </>
  );
}
