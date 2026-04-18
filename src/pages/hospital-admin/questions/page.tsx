import { useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  haCategories as initCategories, HACategory,
  haQuestionTemplates as initTemplates, HAQuestionTemplate,
  haQuestions as initQuestions, HAQuestion,
} from "@/mocks/ha_questions";

type ActiveView = 'templates' | 'categories';

function CategoryModal({ cat, darkMode, onClose, onSave }: {
  cat: HACategory | null; darkMode: boolean; onClose: () => void; onSave: (name: string) => void;
}) {
  const [name, setName] = useState(cat?.name || '');
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-80 rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{cat ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center cursor-pointer"><i className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(name); }}>
          <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Kategoriya nomi *</label>
          <input type="text" className={inputClass} placeholder="Kategoriya nomi..." value={name} onChange={e => setName(e.target.value)} required />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className={`flex-1 h-9 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor</button>
            <button type="submit" className="flex-1 h-9 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TemplateModal({ tmpl, categories, darkMode, onClose, onSave }: {
  tmpl: HAQuestionTemplate | null; categories: HACategory[]; darkMode: boolean; onClose: () => void; onSave: (data: { title: string; categoryId: string }) => void;
}) {
  const [form, setForm] = useState({ title: tmpl?.title || '', categoryId: tmpl?.categoryId || '' });
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-96 rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{tmpl ? "Shablonni tahrirlash" : "Yangi shablon"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center cursor-pointer"><i className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label className={labelClass}>Shablon nomi *</label>
            <input type="text" className={inputClass} placeholder="Shablon nomi..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className={labelClass}>Kategoriya *</label>
            <select className={inputClass} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
              <option value="">Tanlang...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={`flex-1 h-9 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor</button>
            <button type="submit" className="flex-1 h-9 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionModal({ templateId, question, darkMode, onClose, onSave }: {
  templateId: string; question: HAQuestion | null; darkMode: boolean; onClose: () => void; onSave: (text: string) => void;
}) {
  const [text, setText] = useState(question?.text || '');
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-96 rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{question ? "Savolni tahrirlash" : "Yangi savol"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center cursor-pointer"><i className={`ri-close-line ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(text); }}>
          <label className={`block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Savol matni *</label>
          <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Savol matni..." value={text} onChange={e => setText(e.target.value)} required maxLength={500} />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className={`flex-1 h-9 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}>Bekor</button>
            <button type="submit" className="flex-1 h-9 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap transition-colors">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HAQuestionsPage() {
  return (
    <HALayout title="Savollar">
      <HAQuestionsPageContent />
    </HALayout>
  );
}

function HAQuestionsPageContent() {
  const darkMode = useHospitalAdminDarkMode();
  const [activeView, setActiveView] = useState<ActiveView>('templates');
  const [categories, setCategories] = useState<HACategory[]>(initCategories);
  const [templates, setTemplates] = useState<HAQuestionTemplate[]>(initTemplates);
  const [questions, setQuestions] = useState<HAQuestion[]>(initQuestions);

  const [selectedTemplate, setSelectedTemplate] = useState<HAQuestionTemplate | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<HACategory | null>(null);
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [editingTmpl, setEditingTmpl] = useState<HAQuestionTemplate | null>(null);
  const [showQModal, setShowQModal] = useState(false);
  const [editingQ, setEditingQ] = useState<HAQuestion | null>(null);
  const [search, setSearch] = useState('');

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const templateQuestions = selectedTemplate
    ? [...questions].filter((q) => q.templateId === selectedTemplate.id).sort((a, b) => a.order - b.order)
    : [];

  const saveCat = (name: string) => {
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, name } : c));
      setTemplates(prev => prev.map(t => t.categoryId === editingCat.id ? { ...t, categoryName: name } : t));
    } else {
      setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name }]);
    }
    setShowCatModal(false); setEditingCat(null);
  };

  const saveTmpl = (data: { title: string; categoryId: string }) => {
    const cat = categories.find(c => c.id === data.categoryId);
    if (editingTmpl) {
      setTemplates(prev => prev.map(t => t.id === editingTmpl.id ? { ...t, ...data, categoryName: cat?.name || '' } : t));
    } else {
      setTemplates(prev => [...prev, {
        id: `tmpl-${Date.now()}`, title: data.title, categoryId: data.categoryId,
        categoryName: cat?.name || '', questionCount: 0, createdAt: new Date().toISOString().split('T')[0],
      }]);
    }
    setShowTmplModal(false); setEditingTmpl(null);
  };

  const saveQ = (text: string) => {
    if (!selectedTemplate) return;
    if (editingQ) {
      setQuestions(prev => prev.map(q => q.id === editingQ.id ? { ...q, text } : q));
    } else {
      const newQ: HAQuestion = {
        id: `q-${Date.now()}`, text, templateId: selectedTemplate.id,
        order: templateQuestions.length + 1,
      };
      setQuestions(prev => [...prev, newQ]);
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, questionCount: t.questionCount + 1 } : t));
    }
    setShowQModal(false); setEditingQ(null);
  };

  const deleteQ = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (selectedTemplate) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, questionCount: Math.max(0, t.questionCount - 1) } : t));
    }
  };

  const cardBase = `rounded-xl border p-5 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;
  const inputClass = `px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"}`;

  return (
    <>
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
            {(['templates', 'categories'] as ActiveView[]).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeView === v ? darkMode ? "bg-[#141824] text-teal-400" : "bg-white text-teal-600" : darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {v === 'templates' ? 'Shablonlar' : 'Kategoriyalar'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'templates' && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
                </div>
                <input type="text" placeholder="Qidirish..." className={`${inputClass} pl-9 w-48`} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}
            <button
              onClick={() => activeView === 'templates' ? (setEditingTmpl(null), setShowTmplModal(true)) : (setEditingCat(null), setShowCatModal(true))}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-base"></i>
              {activeView === 'templates' ? "Shablon qo'shish" : "Kategoriya qo'shish"}
            </button>
          </div>
        </div>

        {/* Categories view */}
        {activeView === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className={cardBase}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-50">
                      <i className="ri-folder-line text-teal-600 text-base"></i>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{cat.name}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {templates.filter(t => t.categoryId === cat.id).length} ta shablon
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingCat(cat); setShowCatModal(true); }} className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))} className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates view */}
        {activeView === 'templates' && !selectedTemplate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => {
              const previewQs = [...questions]
                .filter((q) => q.templateId === tmpl.id)
                .sort((a, b) => a.order - b.order)
                .slice(0, 2);
              return (
              <div key={tmpl.id} className={`${cardBase} cursor-pointer hover:border-teal-300 transition-all`} onClick={() => setSelectedTemplate(tmpl)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 flex-shrink-0">
                    <i className="ri-file-list-3-line text-teal-600 text-lg"></i>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingTmpl(tmpl); setShowTmplModal(true); }} className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button onClick={() => setTemplates(prev => prev.filter(t => t.id !== tmpl.id))} className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
                <h3 className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{tmpl.categoryName}</span>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{tmpl.questionCount} ta savol</span>
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
                <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Yaratilgan: {tmpl.createdAt}</p>
              </div>
              );
            })}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className={`ri-file-list-3-line text-4xl ${darkMode ? "text-gray-600" : "text-gray-300"}`}></i>
                </div>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Shablon topilmadi</p>
              </div>
            )}
          </div>
        )}

        {/* Template detail — questions */}
        {activeView === 'templates' && selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedTemplate(null)} className={`flex items-center gap-2 text-sm cursor-pointer ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}>
                <i className="ri-arrow-left-line text-base"></i>
                Shablonlarga qaytish
              </button>
            </div>

            <div className={`${cardBase} flex items-center justify-between`}>
              <div>
                <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedTemplate.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">{selectedTemplate.categoryName}</span>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{templateQuestions.length} ta savol</span>
                </div>
              </div>
              <button
                onClick={() => { setEditingQ(null); setShowQModal(true); }}
                className="h-9 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line text-base"></i>
                Savol qo'shish
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
                    <button onClick={() => { setEditingQ(q); setShowQModal(true); }} className={`w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button onClick={() => deleteQ(q.id)} className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
              {templateQuestions.length === 0 && (
                <div className={`${cardBase} text-center py-10`}>
                  <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Hali savollar yo'q. Birinchi savolni qo'shing!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCatModal && <CategoryModal cat={editingCat} darkMode={darkMode} onClose={() => { setShowCatModal(false); setEditingCat(null); }} onSave={saveCat} />}
      {showTmplModal && <TemplateModal tmpl={editingTmpl} categories={categories} darkMode={darkMode} onClose={() => { setShowTmplModal(false); setEditingTmpl(null); }} onSave={saveTmpl} />}
      {showQModal && selectedTemplate && <QuestionModal templateId={selectedTemplate.id} question={editingQ} darkMode={darkMode} onClose={() => { setShowQModal(false); setEditingQ(null); }} onSave={saveQ} />}
    </>
  );
}
