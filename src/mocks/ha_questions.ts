export interface HACategory {
  id: string;
  name: string;
}

export interface HAQuestionTemplate {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  questionCount: number;
  createdAt: string;
}

export interface HAQuestion {
  id: string;
  text: string;
  templateId: string;
  order: number;
}

export const haCategories: HACategory[] = [
  { id: 'cat-001', name: 'Umumiy sog\'liq' },
  { id: 'cat-002', name: 'Yurak-qon tomir' },
  { id: 'cat-003', name: 'Nevrologiya' },
  { id: 'cat-004', name: 'Pediatriya' },
  { id: 'cat-005', name: 'Ortopediya' },
];

export const haQuestionTemplates: HAQuestionTemplate[] = [
  { id: 'tmpl-001', title: 'Dastlabki ko\'rik anketi', categoryId: 'cat-001', categoryName: 'Umumiy sog\'liq', questionCount: 5, createdAt: '2026-01-10' },
  { id: 'tmpl-002', title: 'Yurak tekshiruvi', categoryId: 'cat-002', categoryName: 'Yurak-qon tomir', questionCount: 7, createdAt: '2026-01-15' },
  { id: 'tmpl-003', title: 'Bosh og\'riq tahlili', categoryId: 'cat-003', categoryName: 'Nevrologiya', questionCount: 6, createdAt: '2026-02-01' },
  { id: 'tmpl-004', title: 'Bolalar sog\'lig\'i', categoryId: 'cat-004', categoryName: 'Pediatriya', questionCount: 8, createdAt: '2026-02-10' },
  { id: 'tmpl-005', title: 'Bo\'g\'im og\'rig\'i', categoryId: 'cat-005', categoryName: 'Ortopediya', questionCount: 5, createdAt: '2026-03-05' },
  { id: 'tmpl-006', title: 'Qon bosimi monitoringi', categoryId: 'cat-002', categoryName: 'Yurak-qon tomir', questionCount: 4, createdAt: '2026-03-20' },
];

export const haQuestions: HAQuestion[] = [
  { id: 'q-001', text: 'Qachondan beri og\'riq sezmoqdasiz?', templateId: 'tmpl-001', order: 1 },
  { id: 'q-002', text: 'Og\'riq qayerda joylashgan?', templateId: 'tmpl-001', order: 2 },
  { id: 'q-003', text: 'Og\'riq darajasini 1-10 shkala bo\'yicha baholang', templateId: 'tmpl-001', order: 3 },
  { id: 'q-004', text: 'Qanday dorilar qabul qilmoqdasiz?', templateId: 'tmpl-001', order: 4 },
  { id: 'q-005', text: 'Allergiyangiz bormi?', templateId: 'tmpl-001', order: 5 },
  { id: 'q-006', text: 'Ko\'krak og\'rig\'i bormi?', templateId: 'tmpl-002', order: 1 },
  { id: 'q-007', text: 'Nafas qisishini his qilyapsizmi?', templateId: 'tmpl-002', order: 2 },
  { id: 'q-008', text: 'Qon bosimingiz qancha?', templateId: 'tmpl-002', order: 3 },
  { id: 'q-009', text: 'Yurak urishi tezlashganmi?', templateId: 'tmpl-002', order: 4 },
  { id: 'q-010', text: 'Oilada yurak kasalligi bormi?', templateId: 'tmpl-002', order: 5 },
  { id: 'q-011', text: 'Chekasizmi?', templateId: 'tmpl-002', order: 6 },
  { id: 'q-012', text: 'Spirtli ichimlik ichasizmi?', templateId: 'tmpl-002', order: 7 },
];
