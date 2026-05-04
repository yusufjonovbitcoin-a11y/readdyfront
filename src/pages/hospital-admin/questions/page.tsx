import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { useModalA11y } from "@/hooks/useModalA11y";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import {
  createHAQuestion,
  createHAQuestionCategory,
  deleteHAQuestion,
  deleteHAQuestionCategory,
  getHAQuestionCategories,
  getHAQuestionTemplates,
  getHAQuestions,
  updateHAQuestion,
  updateHAQuestionCategory,
  updateHADepartmentAiPrompt,
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

/** Shablon ichidagi savollarni UI bo‘limlariga ajratish (backend maydonlari bilan mos). */
function partitionTemplateQuestions(questions: HAQuestion[]): {
  mandatory: HAQuestion[];
  conditional: HAQuestion[];
  domain: HAQuestion[];
  optionalFree: HAQuestion[];
} {
  const mandatory: HAQuestion[] = [];
  const conditional: HAQuestion[] = [];
  const domain: HAQuestion[] = [];
  const optionalFree: HAQuestion[] = [];
  for (const q of questions) {
    if (q.scope === "DOCTOR") {
      domain.push(q);
      continue;
    }
    if (q.isRequired === true) {
      mandatory.push(q);
      continue;
    }
    if (q.answerMode === "FREE_TEXT") {
      optionalFree.push(q);
      continue;
    }
    conditional.push(q);
  }
  return { mandatory, conditional, domain, optionalFree };
}

function QuestionCardRow({
  q,
  index,
  darkMode,
  cardBase,
  isMutating,
  onEdit,
  onDelete,
}: {
  q: HAQuestion;
  index: number;
  darkMode: boolean;
  cardBase: string;
  isMutating: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("hospital");
  const scopeLabel = q.scope === "DOCTOR" ? t("questions.questionMeta.badgeDoctor") : t("questions.questionMeta.badgeTemplate");
  const modeLabel =
    q.answerMode === "FREE_TEXT" ? t("questions.questionMeta.modeFreeText") : t("questions.questionMeta.modeYesNo");
  return (
    <div className={`${cardBase} flex items-start gap-4`}>
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-50 flex-shrink-0 mt-0.5">
        <span className="text-teal-700 text-xs font-bold">{index}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{q.text}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>
            {modeLabel}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-violet-900/40 text-violet-300" : "bg-violet-50 text-violet-700"}`}>
            {scopeLabel}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              q.isRequired
                ? darkMode
                  ? "bg-emerald-900/40 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700"
                : darkMode
                  ? "bg-amber-900/40 text-amber-300"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {q.isRequired ? t("questions.questionMeta.badgeRequired") : t("questions.questionMeta.badgeOptional")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          aria-label={t("questions.actions.editQuestionAria", { index })}
          onClick={onEdit}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
        >
          <i aria-hidden="true" className="ri-edit-line text-sm"></i>
        </button>
        <button
          type="button"
          aria-label={t("questions.actions.deleteQuestionAria", { index })}
          onClick={onDelete}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors"
          disabled={isMutating}
        >
          <i aria-hidden="true" className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}

function QuestionBucketSection({
  title,
  items,
  darkMode,
  cardBase,
  isMutating,
  emptyHint,
  onEdit,
  onDelete,
}: {
  title: string;
  items: HAQuestion[];
  darkMode: boolean;
  cardBase: string;
  isMutating: boolean;
  emptyHint: string;
  onEdit: (q: HAQuestion) => void;
  onDelete: (q: HAQuestion) => void;
}) {
  const sectionTitleClass = `text-sm font-semibold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`;
  const emptyClass = `text-xs text-center rounded-xl border border-dashed px-4 py-6 ${
    darkMode ? "border-[#1E2130] text-gray-500 bg-[#141824]/50" : "border-gray-200 text-gray-500 bg-gray-50/50"
  }`;
  return (
    <section className="space-y-3">
      <h3 className={sectionTitleClass}>{title}</h3>
      {items.length === 0 ? (
        <p className={emptyClass}>{emptyHint}</p>
      ) : (
        <div className="space-y-3">
          {items.map((q, i) => (
            <QuestionCardRow
              key={q.id}
              q={q}
              index={i + 1}
              darkMode={darkMode}
              cardBase={cardBase}
              isMutating={isMutating}
              onEdit={() => onEdit(q)}
              onDelete={() => onDelete(q)}
            />
          ))}
        </div>
      )}
    </section>
  );
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
  tmpl: HAQuestionTemplate | null; categories: HACategory[]; darkMode: boolean; onClose: () => void; onSave: (data: { directionName: string }) => void; isSubmitting: boolean;
}) {
  const { t } = useTranslation("hospital");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: titleInputRef });
  const fieldId = {
    direction: "ha-questions-template-direction",
  } as const;
  const [form, setForm] = useState({
    directionName: tmpl?.categoryName || tmpl?.title || "",
  });
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
            <label htmlFor={fieldId.direction} className={labelClass}>{t("questions.modal.template.nameLabel")}</label>
            <input
              ref={titleInputRef}
              id={fieldId.direction}
              type="text"
              className={inputClass}
              placeholder={t("questions.modal.template.namePlaceholder")}
              value={form.directionName}
              onChange={e => setForm({ ...form, directionName: e.target.value })}
              required
            />
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {t("questions.modal.template.directionHelp")}
            </p>
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

/** Shu bo‘lim (department) uchun `PATCH /api/departments/:id` → `ai_system_prompt`. Har bir yo‘nalish alohida. */
function DepartmentAiPromptModal({
  template,
  darkMode,
  onClose,
  onSave,
  isSubmitting,
}: {
  template: HAQuestionTemplate;
  darkMode: boolean;
  onClose: () => void;
  onSave: (text: string | null) => void;
  isSubmitting: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useModalA11y({ isOpen: true, onClose, initialFocusRef: textareaRef });
  const [text, setText] = useState(() => template.aiSystemPrompt ?? "");
  useEffect(() => {
    setText(template.aiSystemPrompt ?? "");
  }, [template]);
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors resize-y min-h-[140px] ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ha-ai-prompt-modal-title"
        tabIndex={-1}
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="ha-ai-prompt-modal-title" className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Bo‘lim AI prompti — {template.title}
          </h2>
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            disabled={isSubmitting}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}
          >
            <i aria-hidden="true" className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          </button>
        </div>
        <label htmlFor="ha-department-ai-prompt" className={labelClass}>
          Bo‘lim tizim prompti
        </label>
        <textarea
          ref={textareaRef}
          id="ha-department-ai-prompt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={20000}
          rows={10}
          className={inputClass}
          placeholder="Masalan: Sen LOR bo‘yicha qisqa savollar ber va..."
        />
        <p className={`text-xs mt-1 mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{text.length} / 20000</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onSave(null)}
            disabled={isSubmitting}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300 border border-[#1E2130]" : "bg-gray-100 text-gray-700 border border-gray-200"}`}
          >
            Tozalash (standart)
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => onSave(text.trim() || null)}
            disabled={isSubmitting}
            className={`flex-1 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSubmitting ? "" : "cursor-pointer"}`}
          >
            {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
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
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);
  const [aiPromptTemplate, setAiPromptTemplate] = useState<HAQuestionTemplate | null>(null);

  useEffect(() => {
    if (categoriesState.status === "success") setCategories(categoriesState.data ?? []);
  }, [categoriesState.status, categoriesState.data]);

  useEffect(() => {
    if (templatesState.status === "success") setTemplates(templatesState.data ?? []);
  }, [templatesState.status, templatesState.data]);

  useEffect(() => {
    if (questionsState.status === "success") setQuestions(questionsState.data ?? []);
  }, [questionsState.status, questionsState.data]);

  const filteredTemplates = templates.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  const templateQuestions = selectedTemplate
    ? [...questions].filter((q) => q.templateId === selectedTemplate.id).sort((a, b) => a.order - b.order)
    : [];

  const questionBuckets = useMemo(
    () => partitionTemplateQuestions(templateQuestions),
    [templateQuestions],
  );

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

  const saveTmpl = async (data: { directionName: string }) => {
    setIsMutating(true);
    try {
      const trimmedDirection = data.directionName.trim();
      if (!trimmedDirection) {
        showToast(t("questions.errors.templateNameRequired"), "error");
        setIsMutating(false);
        return;
      }
      let categoryId =
        categories.find((category) => category.name.trim().toLowerCase() === trimmedDirection.toLowerCase())?.id;
      if (!categoryId) {
        const createdCategory = await createHAQuestionCategory(trimmedDirection);
        categoryId = createdCategory.id;
      }
      if (editingTmpl) {
        await updateHAQuestionCategory(editingTmpl.categoryId, trimmedDirection);
      }
      await reloadAll();
      setShowTmplModal(false);
      setEditingTmpl(null);
      showToast(t("questions.toasts.templateSaved"));
    } catch (error) {
      showToast(toErrorMessage(error, t("questions.toasts.templateSaveError")), "error");
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
      if (editingQ) {
        const updated = await updateHAQuestion(editingQ.id, { text, type, isRequired });
        setQuestions((prev) =>
          prev.map((item) => (item.id === editingQ.id ? { ...item, ...updated } : item)),
        );
      } else {
        const created = await createHAQuestion({
          text,
          templateId: selectedTemplate.id,
          order: templateQuestions.length + 1,
          type,
          isRequired,
        });
        setQuestions((prev) => [created, ...prev]);
      }
      setShowQModal(false);
      setEditingQ(null);
      showToast(editingQ ? "Savol yangilandi." : "Savol qo'shildi.");
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
      setQuestions((prev) => prev.filter((item) => item.id !== id));
      showToast("Savol o'chirildi.");
    } finally {
      setIsMutating(false);
    }
  };

  const saveDepartmentAiPrompt = async (text: string | null) => {
    if (!aiPromptTemplate) return;
    setIsMutating(true);
    try {
      await updateHADepartmentAiPrompt(aiPromptTemplate.id, text);
      await reloadAll();
      setShowAiPromptModal(false);
      setAiPromptTemplate(null);
      showToast(text === null ? "Bo‘lim prompti tozalandi. AI faqat prompt yozilganda ishlaydi." : "Bo‘lim AI prompti saqlandi.");
    } catch (error) {
      showToast(toErrorMessage(error, "Bo‘lim promptini saqlashda xatolik yuz berdi."), "error");
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
        setCategories((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setTemplates((prev) => prev.filter((item) => item.categoryId !== pendingDelete.id));
        setQuestions((prev) => prev.filter((item) => item.templateId !== pendingDelete.id));
        if (selectedTemplate?.id === pendingDelete.id) setSelectedTemplate(null);
      } else if (pendingDelete.type === "template") {
        await deleteHAQuestionCategory(pendingDelete.id);
        setCategories((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setTemplates((prev) => prev.filter((item) => item.id !== pendingDelete.id && item.categoryId !== pendingDelete.id));
        setQuestions((prev) => prev.filter((item) => item.templateId !== pendingDelete.id));
        if (selectedTemplate?.id === pendingDelete.id) setSelectedTemplate(null);
      } else {
        await deleteHAQuestion(pendingDelete.id);
        setQuestions((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      }
      setPendingDelete(null);
      showToast("O'chirish muvaffaqiyatli bajarildi.");
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
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t("questions.templates")}
            </h1>
            <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t("questions.pageSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input
                type="text"
                placeholder={t("questions.search")}
                className={`${inputClass} h-11 pl-9 w-full`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setEditingTmpl(null); setShowTmplModal(true); }}
              className="h-11 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
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
                    <button
                      type="button"
                      title="Bo‘lim AI prompti"
                      aria-label={`Bo‘lim AI prompti — ${tmpl.title}`}
                      onClick={() => {
                        setAiPromptTemplate(tmpl);
                        setShowAiPromptModal(true);
                      }}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-violet-950/50 text-violet-400" : "hover:bg-violet-50 text-violet-600"}`}
                    >
                      <i aria-hidden="true" className="ri-sparkling-line text-sm"></i>
                    </button>
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
                    {tmpl.aiSystemPrompt?.trim() ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          darkMode
                            ? "bg-violet-900/40 text-violet-300 border-violet-700/40"
                            : "bg-violet-50 text-violet-800 border-violet-200"
                        }`}
                      >
                        AI prompt
                      </span>
                    ) : null}
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

        {/* Shablon tafsiloti — to‘rt savollar bloki */}
        {selectedTemplate && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSelectedTemplate(null)} className={`flex items-center gap-2 text-sm cursor-pointer ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}>
                <i className="ri-arrow-left-line text-base"></i>
                {t("questions.backToTemplates")}
              </button>
            </div>

            <div className={`${cardBase} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
              <div className="min-w-0 flex-1">
                <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {t("questions.templateDetail.titleWithName", { name: selectedTemplate.title })}
                </h2>
                <p className={`text-xs mt-1.5 leading-relaxed max-w-2xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {t("questions.templateDetail.intro")}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{selectedTemplate.categoryName}</span>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.templateQuestionCount", { count: templateQuestions.length })}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setEditingQ(null); setShowQModal(true); }}
                className="min-h-[44px] px-4 flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <i className="ri-add-line text-base"></i>
                {t("questions.addQuestion")}
              </button>
            </div>

            {templateQuestions.length === 0 ? (
              <div className={`${cardBase} text-center py-10`}>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("questions.noQuestions")}</p>
              </div>
            ) : (
              <div className="space-y-8">
                <QuestionBucketSection
                  title={t("questions.questionBuckets.mandatory")}
                  items={questionBuckets.mandatory}
                  darkMode={darkMode}
                  cardBase={cardBase}
                  isMutating={isMutating}
                  emptyHint={t("questions.bucketEmpty")}
                  onEdit={(q) => { setEditingQ(q); setShowQModal(true); }}
                  onDelete={(q) => setPendingDelete({ type: "question", id: q.id })}
                />
                <QuestionBucketSection
                  title={t("questions.questionBuckets.conditional")}
                  items={questionBuckets.conditional}
                  darkMode={darkMode}
                  cardBase={cardBase}
                  isMutating={isMutating}
                  emptyHint={t("questions.bucketEmpty")}
                  onEdit={(q) => { setEditingQ(q); setShowQModal(true); }}
                  onDelete={(q) => setPendingDelete({ type: "question", id: q.id })}
                />
                <QuestionBucketSection
                  title={t("questions.questionBuckets.domain")}
                  items={questionBuckets.domain}
                  darkMode={darkMode}
                  cardBase={cardBase}
                  isMutating={isMutating}
                  emptyHint={t("questions.bucketEmpty")}
                  onEdit={(q) => { setEditingQ(q); setShowQModal(true); }}
                  onDelete={(q) => setPendingDelete({ type: "question", id: q.id })}
                />
                <QuestionBucketSection
                  title={t("questions.questionBuckets.optionalFree")}
                  items={questionBuckets.optionalFree}
                  darkMode={darkMode}
                  cardBase={cardBase}
                  isMutating={isMutating}
                  emptyHint={t("questions.bucketEmpty")}
                  onEdit={(q) => { setEditingQ(q); setShowQModal(true); }}
                  onDelete={(q) => setPendingDelete({ type: "question", id: q.id })}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showAiPromptModal && aiPromptTemplate && (
        <DepartmentAiPromptModal
          template={aiPromptTemplate}
          darkMode={darkMode}
          onClose={() => {
            if (!isMutating) {
              setShowAiPromptModal(false);
              setAiPromptTemplate(null);
            }
          }}
          onSave={saveDepartmentAiPrompt}
          isSubmitting={isMutating}
        />
      )}
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
