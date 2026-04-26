import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { useModalA11y } from "@/hooks/useModalA11y";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import {
  createHAQuestion,
  createHAQuestionCategory,
  createHAQuestionTemplate,
  deleteHAQuestion,
  deleteHAQuestionCategory,
  deleteHAQuestionTemplate,
  getHAQuestionCategories,
  getHAQuestionTemplates,
  getHAQuestions,
  updateHAQuestion,
  updateHAQuestionCategory,
  updateHAQuestionTemplate,
  type HACategory,
  type HAQuestionTemplate,
  type HAQuestion,
} from "@/api/services/hospitalAdminData.service";
import { usePageState } from "@/hooks/usePageState";

type PendingDelete =
  | { type: "category"; id: string }
  | { type: "template"; id: string }
  | { type: "question"; id: string }
  | null;

function toErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

function CategoryModal({ cat, darkMode, onClose, onSave, isSubmitting }: {
  cat: HACategory | null; darkMode: boolean; onClose: () => void; onSave: (name: string) => void; isSubmitting: boolean;
}) {
  const { t } = useTranslation("hospital");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: nameInputRef });
  const fieldId = "ha-questions-category-name";
  const [name, setName] = useState(cat?.name || '');
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-category-modal-title"
        tabIndex={-1}
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="ha-category-modal-title" className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{cat ? t("questions.modal.category.editTitle") : t("questions.modal.category.createTitle")}</h2>
          <button aria-label={t("questions.modal.closeCategoryAria")} onClick={onClose} disabled={isSubmitting} className={`min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}><i aria-hidden="true" className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(name); }}>
          <label htmlFor={fieldId} className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{t("questions.modal.category.nameLabel")}</label>
          <input ref={nameInputRef} id={fieldId} type="text" className={inputClass} placeholder={t("questions.modal.category.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} required />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>{t("common:buttons.cancel")}</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}>{isSubmitting ? "Saqlanmoqda..." : t("common:buttons.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TemplateModal({ tmpl, categories, darkMode, onClose, onSave, isSubmitting }: {
  tmpl: HAQuestionTemplate | null; categories: HACategory[]; darkMode: boolean; onClose: () => void; onSave: (data: { title: string; categoryId: string }) => void; isSubmitting: boolean;
}) {
  const { t } = useTranslation("hospital");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: titleInputRef });
  const fieldId = {
    title: "ha-questions-template-title",
    category: "ha-questions-template-category",
  } as const;
  const [form, setForm] = useState({ title: tmpl?.title || '', categoryId: tmpl?.categoryId || '' });
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-template-modal-title"
        tabIndex={-1}
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="ha-template-modal-title" className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{tmpl ? t("questions.modal.template.editTitle") : t("questions.modal.template.createTitle")}</h2>
          <button aria-label={t("questions.modal.closeTemplateAria")} onClick={onClose} disabled={isSubmitting} className={`min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}><i aria-hidden="true" className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label htmlFor={fieldId.title} className={labelClass}>{t("questions.modal.template.nameLabel")}</label>
            <input ref={titleInputRef} id={fieldId.title} type="text" className={inputClass} placeholder={t("questions.modal.template.namePlaceholder")} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label htmlFor={fieldId.category} className={labelClass}>{t("questions.modal.template.categoryLabel")}</label>
            <select id={fieldId.category} className={inputClass} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
              <option value="">{t("questions.modal.template.selectPlaceholder")}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>{t("common:buttons.cancel")}</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}>{isSubmitting ? "Saqlanmoqda..." : t("common:buttons.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionModal({ question, darkMode, onClose, onSave, isSubmitting }: {
  question: HAQuestion | null;
  darkMode: boolean;
  onClose: () => void;
  onSave: (payload: { text: string; answerMode: "boolean" | "text" }) => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation("hospital");
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: questionTextareaRef });
  const fieldId = "ha-questions-question-text";
  const [text, setText] = useState(question?.text || '');
  const [answerMode, setAnswerMode] = useState<"boolean" | "text">(
    question?.type === "TEXT" || question?.isRequired === false ? "text" : "boolean",
  );
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-question-modal-title"
        tabIndex={-1}
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="ha-question-modal-title" className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{question ? t("questions.modal.question.editTitle") : t("questions.modal.question.createTitle")}</h2>
          <button aria-label={t("questions.modal.closeQuestionAria")} onClick={onClose} disabled={isSubmitting} className={`min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}><i aria-hidden="true" className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ text, answerMode }); }}>
          <label htmlFor={fieldId} className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{t("questions.modal.question.textLabel")}</label>
          <textarea
            ref={questionTextareaRef}
            id={fieldId}
            aria-describedby={`${fieldId}-help`}
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder={t("questions.modal.question.textPlaceholder")}
            value={text}
            onChange={e => setText(e.target.value)}
            required
            maxLength={500}
          />
          <p id={`${fieldId}-help`} className="sr-only">{t("questions.modal.question.help")}</p>
          <p className={`block text-xs font-medium mt-3 mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Javob shakli
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setAnswerMode("boolean")}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                answerMode === "boolean"
                  ? darkMode
                    ? "border-teal-500 bg-teal-900/30 text-teal-200"
                    : "border-teal-500 bg-teal-50 text-teal-700"
                  : darkMode
                    ? "border-[#1E2130] text-gray-300 hover:bg-[#1A2235]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              HA / YO&apos;Q
            </button>
            <button
              type="button"
              onClick={() => setAnswerMode("text")}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                answerMode === "text"
                  ? darkMode
                    ? "border-teal-500 bg-teal-900/30 text-teal-200"
                    : "border-teal-500 bg-teal-50 text-teal-700"
                  : darkMode
                    ? "border-[#1E2130] text-gray-300 hover:bg-[#1A2235]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Ixtiyoriy
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>{t("common:buttons.cancel")}</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}>{isSubmitting ? "Saqlanmoqda..." : t("common:buttons.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HAQuestionsPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.questions")}>
      <HAQuestionsPageContent />
    </HALayout>
  );
}

export function HAQuestionsPageContent() {
  const { t } = useTranslation("hospital");
  const darkMode = useHospitalAdminDarkMode();
  const { toast, showToast } = useAppToast();
  const categoriesState = usePageState(getHAQuestionCategories);
  const templatesState = usePageState(getHAQuestionTemplates);
  const questionsState = usePageState(getHAQuestions);
  const [categories, setCategories] = useState<HACategory[]>([]);
  const [templates, setTemplates] = useState<HAQuestionTemplate[]>([]);
  const [questions, setQuestions] = useState<HAQuestion[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<HAQuestionTemplate | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<HACategory | null>(null);
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [editingTmpl, setEditingTmpl] = useState<HAQuestionTemplate | null>(null);
  const [showQModal, setShowQModal] = useState(false);
  const [editingQ, setEditingQ] = useState<HAQuestion | null>(null);
  const [search, setSearch] = useState('');
  const [isMutating, setIsMutating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  useEffect(() => {
    if (categoriesState.status === "success") setCategories(categoriesState.data ?? []);
  }, [categoriesState.status, categoriesState.data]);

  useEffect(() => {
    if (templatesState.status === "success") setTemplates(templatesState.data ?? []);
  }, [templatesState.status, templatesState.data]);

  useEffect(() => {
    if (questionsState.status === "success") setQuestions(questionsState.data ?? []);
  }, [questionsState.status, questionsState.data]);

  if (categoriesState.status === "loading" || templatesState.status === "loading" || questionsState.status === "loading") {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (categoriesState.status === "error" || templatesState.status === "error" || questionsState.status === "error") {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
        <p className="mb-4">{categoriesState.error ?? templatesState.error ?? questionsState.error}</p>
        <button
          type="button"
          onClick={() => {
            void categoriesState.reload();
            void templatesState.reload();
            void questionsState.reload();
          }}
          className="min-h-[44px] px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const templateQuestions = selectedTemplate
    ? [...questions].filter((q) => q.templateId === selectedTemplate.id).sort((a, b) => a.order - b.order)
    : [];

  const reloadAll = async () => {
    await Promise.all([categoriesState.reload(), templatesState.reload(), questionsState.reload()]);
  };

  const saveCat = async (name: string) => {
    setIsMutating(true);
    try {
      if (editingCat) await updateHAQuestionCategory(editingCat.id, name);
      else await createHAQuestionCategory(name);
      await reloadAll();
      setShowCatModal(false);
      setEditingCat(null);
    } finally {
      setIsMutating(false);
    }
  };

  const saveTmpl = async (data: { title: string; categoryId: string }) => {
    setIsMutating(true);
    try {
      if (editingTmpl) await updateHAQuestionTemplate(editingTmpl.id, data);
      else await createHAQuestionTemplate(data);
      await reloadAll();
      setShowTmplModal(false);
      setEditingTmpl(null);
      showToast("Savolnoma muvaffaqiyatli saqlandi.");
    } catch (error) {
      showToast(toErrorMessage(error, "Savolnomani saqlashda xatolik yuz berdi."), "error");
    } finally {
      setIsMutating(false);
    }
  };

  const saveQ = async ({ text, answerMode }: { text: string; answerMode: "boolean" | "text" }) => {
    if (!selectedTemplate) {
      showToast("Avval savolnoma tanlang.", "error");
      return;
    }
    const type = answerMode === "text" ? "TEXT" : "SELECT";
    const isRequired = answerMode !== "text";
    setIsMutating(true);
    try {
      if (editingQ) await updateHAQuestion(editingQ.id, { text, type, isRequired });
      else await createHAQuestion({ text, templateId: selectedTemplate.id, order: templateQuestions.length + 1, type, isRequired });
      await reloadAll();
      setShowQModal(false);
      setEditingQ(null);
      showToast("Savol muvaffaqiyatli saqlandi.");
    } catch (error) {
      showToast(toErrorMessage(error, "Savolni saqlashda xatolik yuz berdi."), "error");
    } finally {
      setIsMutating(false);
    }
  };

  const deleteQ = async (id: string) => {
    setIsMutating(true);
    try {
      await deleteHAQuestion(id);
      await reloadAll();
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsMutating(true);
    try {
      if (pendingDelete.type === "category") {
        await deleteHAQuestionCategory(pendingDelete.id);
      } else if (pendingDelete.type === "template") {
        await deleteHAQuestionTemplate(pendingDelete.id);
      } else {
        await deleteHAQuestion(pendingDelete.id);
      }
      await reloadAll();
      setPendingDelete(null);
    } finally {
      setIsMutating(false);
    }
  };

  const cardBase = `rounded-xl border p-5 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;
  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;

  return (
    <>
      <AppToast toast={toast} />
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                darkMode ? "bg-[#141824] text-teal-400" : "bg-white text-teal-600"
              }`}
            >
              {t("questions.templates")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input type="text" placeholder={t("questions.search")} className={`${inputClass} pl-9 w-48`} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button
              onClick={() => { setEditingTmpl(null); setShowTmplModal(true); }}
              className="min-h-[44px] px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-base"></i>
              {t("questions.addTemplate")}
            </button>
          </div>
        </div>

        {/* Templates view */}
        {!selectedTemplate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => {
              const previewQs = [...questions]
                .filter((q) => q.templateId === tmpl.id)
                .sort((a, b) => a.order - b.order)
                .slice(0, 2);
              return (
              <div key={tmpl.id} className={`${cardBase} hover:border-teal-300 transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 flex-shrink-0">
                    <i className="ri-file-list-3-line text-teal-600 text-lg"></i>
                  </div>
                  <div className="flex items-center gap-1">
                    <button aria-label={t("questions.actions.editTemplateAria", { title: tmpl.title })} onClick={() => { setEditingTmpl(tmpl); setShowTmplModal(true); }} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                      <i aria-hidden="true" className="ri-edit-line text-sm"></i>
                    </button>
                    <button aria-label={t("questions.actions.deleteTemplateAria", { title: tmpl.title })} onClick={() => setPendingDelete({ type: "template", id: tmpl.id })} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors" disabled={isMutating}>
                      <i aria-hidden="true" className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                    darkMode ? "focus-visible:ring-offset-[#141824]" : "focus-visible:ring-offset-white"
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{tmpl.categoryName}</span>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.templateQuestionCount", { count: tmpl.questionCount })}</span>
                  </div>
                  {previewQs.length > 0 && (
                    <div className={`mt-3 space-y-1.5 border-t border-dashed pt-3 ${darkMode ? "border-[#1E2130]" : "border-gray-200"}`}>
                      {previewQs.map((q, idx) => (
                        <p key={q.id} className={`text-xs leading-snug line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          <span className={`font-semibold tabular-nums ${darkMode ? "text-teal-400" : "text-teal-600"}`}>{idx + 1}.</span>{" "}
                          {q.text}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.createdAt", { date: tmpl.createdAt })}</p>
                </button>
              </div>
              );
            })}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className={`ri-file-list-3-line text-4xl ${darkMode ? "text-gray-600" : "text-gray-300"}`}></i>
                </div>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.templateNotFound")}</p>
              </div>
            )}
          </div>
        )}

        {/* Template detail — questions */}
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedTemplate(null)} className={`flex items-center gap-2 text-sm cursor-pointer ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}>
                <i className="ri-arrow-left-line text-base"></i>
                {t("questions.backToTemplates")}
              </button>
            </div>

            <div className={`${cardBase} flex items-center justify-between`}>
              <div>
                <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedTemplate.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{selectedTemplate.categoryName}</span>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.templateQuestionCount", { count: templateQuestions.length })}</span>
                </div>
              </div>
              <button
                onClick={() => { setEditingQ(null); setShowQModal(true); }}
                className="min-h-[44px] px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line text-base"></i>
                {t("questions.addQuestion")}
              </button>
            </div>

            <div className="space-y-3">
              {templateQuestions.map((q, i) => (
                <div key={q.id} className={`${cardBase} flex items-start gap-4`}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-50 flex-shrink-0 mt-0.5">
                    <span className="text-teal-700 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className={`flex-1 text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{q.text}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button aria-label={t("questions.actions.editQuestionAria", { index: i + 1 })} onClick={() => { setEditingQ(q); setShowQModal(true); }} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                      <i aria-hidden="true" className="ri-edit-line text-sm"></i>
                    </button>
                    <button aria-label={t("questions.actions.deleteQuestionAria", { index: i + 1 })} onClick={() => setPendingDelete({ type: "question", id: q.id })} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors" disabled={isMutating}>
                      <i aria-hidden="true" className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
              {templateQuestions.length === 0 && (
                <div className={`${cardBase} text-center py-10`}>
                  <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.noQuestions")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCatModal && <CategoryModal cat={editingCat} darkMode={darkMode} onClose={() => { setShowCatModal(false); setEditingCat(null); }} onSave={saveCat} isSubmitting={isMutating} />}
      {showTmplModal && <TemplateModal tmpl={editingTmpl} categories={categories} darkMode={darkMode} onClose={() => { setShowTmplModal(false); setEditingTmpl(null); }} onSave={saveTmpl} isSubmitting={isMutating} />}
      {showQModal && selectedTemplate && <QuestionModal question={editingQ} darkMode={darkMode} onClose={() => { setShowQModal(false); setEditingQ(null); }} onSave={saveQ} isSubmitting={isMutating} />}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("questions.confirmDelete")}
        description={t("questions.confirmDeleteDesc")}
        confirmText={t("questions.confirmDeleteAction")}
        cancelText={t("questions.cancel")}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { void confirmDelete(); }}
        confirmDisabled={isMutating}
        cancelDisabled={isMutating}
        darkMode={darkMode}
      />
    </>
  );
}
