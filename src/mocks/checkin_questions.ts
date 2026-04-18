export type QuestionType = 'yes_no' | 'text' | 'select' | 'body_map';

export interface CheckinQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  conditionalOn?: { questionId: string; answer: string };
  category: string;
}

export interface AICondition {
  name: string;
  probability: number;
  description: string;
}

export interface AIRecommendation {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  conditions: AICondition[];
  actions: string[];
  disclaimer: string;
}

export const checkinQuestions: CheckinQuestion[] = [
  {
    id: 'q1',
    text: 'Asosiy shikoyatingiz nima?',
    type: 'select',
    options: ['Bosh og\'riq', 'Ko\'krak og\'rig\'i', 'Qorin og\'rig\'i', 'Bo\'g\'im og\'rig\'i', 'Nafas qisishi', 'Harorat', 'Boshqa'],
    required: true,
    category: 'Asosiy shikoyat',
  },
  {
    id: 'q2',
    text: 'Og\'riq qayerda joylashgan? (Tana xaritasida belgilang)',
    type: 'body_map',
    required: false,
    category: 'Og\'riq joylashuvi',
  },
  {
    id: 'q3',
    text: 'Og\'riq qachondan boshlanganini ayting',
    type: 'select',
    options: ['Bugun', '1-3 kun oldin', '1 hafta oldin', '1 oy oldin', '1 oydan ko\'proq'],
    required: true,
    category: 'Davomiyligi',
  },
  {
    id: 'q4',
    text: 'Haroratiz ko\'tarilganmi?',
    type: 'yes_no',
    required: true,
    category: 'Simptomlar',
  },
  {
    id: 'q5',
    text: 'Haroratiz qancha? (°C)',
    type: 'text',
    required: false,
    conditionalOn: { questionId: 'q4', answer: 'yes' },
    category: 'Simptomlar',
  },
  {
    id: 'q6',
    text: 'Ko\'ngil aynishi yoki qusish bormi?',
    type: 'yes_no',
    required: true,
    category: 'Simptomlar',
  },
  {
    id: 'q7',
    text: 'Bosh aylanishi bormi?',
    type: 'yes_no',
    required: true,
    category: 'Simptomlar',
  },
  {
    id: 'q8',
    text: 'Nafas qisishini his qilyapsizmi?',
    type: 'yes_no',
    required: true,
    category: 'Nafas',
  },
  {
    id: 'q9',
    text: 'Nafas qisishi qanchalik kuchli?',
    type: 'select',
    options: ['Engil', 'O\'rtacha', 'Kuchli', 'Juda kuchli'],
    required: false,
    conditionalOn: { questionId: 'q8', answer: 'yes' },
    category: 'Nafas',
  },
  {
    id: 'q10',
    text: 'Qon bosimingiz yuqori bo\'lganmi?',
    type: 'yes_no',
    required: true,
    category: 'Yurak-qon tomir',
  },
  {
    id: 'q11',
    text: 'Yurak urishi tezlashganmi yoki notekis bo\'lganmi?',
    type: 'yes_no',
    required: true,
    category: 'Yurak-qon tomir',
  },
  {
    id: 'q12',
    text: 'Hozirda qanday dorilar qabul qilyapsiz?',
    type: 'text',
    required: false,
    category: 'Dorilar',
  },
  {
    id: 'q13',
    text: 'Allergiyangiz bormi?',
    type: 'yes_no',
    required: true,
    category: 'Tibbiy tarix',
  },
  {
    id: 'q14',
    text: 'Qanday allergiyangiz bor?',
    type: 'text',
    required: false,
    conditionalOn: { questionId: 'q13', answer: 'yes' },
    category: 'Tibbiy tarix',
  },
  {
    id: 'q15',
    text: 'Surunkali kasalliklaringiz bormi?',
    type: 'yes_no',
    required: true,
    category: 'Tibbiy tarix',
  },
  {
    id: 'q16',
    text: 'Qanday surunkali kasalliklaringiz bor?',
    type: 'select',
    options: ['Diabet', 'Gipertoniya', 'Yurak kasalligi', 'Astma', 'Boshqa'],
    required: false,
    conditionalOn: { questionId: 'q15', answer: 'yes' },
    category: 'Tibbiy tarix',
  },
  {
    id: 'q17',
    text: 'Oilada yurak kasalligi yoki diabet bormi?',
    type: 'yes_no',
    required: true,
    category: 'Oilaviy tarix',
  },
  {
    id: 'q18',
    text: 'Chekasizmi?',
    type: 'yes_no',
    required: true,
    category: 'Turmush tarzi',
  },
  {
    id: 'q19',
    text: 'Spirtli ichimlik ichasizmi?',
    type: 'yes_no',
    required: true,
    category: 'Turmush tarzi',
  },
  {
    id: 'q20',
    text: 'Qo\'shimcha ma\'lumot yoki shikoyat',
    type: 'text',
    required: false,
    category: 'Qo\'shimcha',
  },
];

export const bodyParts = [
  { id: 'head', label: 'Bosh', x: 50, y: 8 },
  { id: 'neck', label: 'Bo\'yin', x: 50, y: 16 },
  { id: 'chest', label: 'Ko\'krak', x: 50, y: 28 },
  { id: 'left_shoulder', label: 'Chap yelka', x: 30, y: 24 },
  { id: 'right_shoulder', label: 'O\'ng yelka', x: 70, y: 24 },
  { id: 'left_arm', label: 'Chap qo\'l', x: 22, y: 38 },
  { id: 'right_arm', label: 'O\'ng qo\'l', x: 78, y: 38 },
  { id: 'abdomen', label: 'Qorin', x: 50, y: 42 },
  { id: 'lower_back', label: 'Bel', x: 50, y: 52 },
  { id: 'left_hip', label: 'Chap son', x: 38, y: 60 },
  { id: 'right_hip', label: 'O\'ng son', x: 62, y: 60 },
  { id: 'left_knee', label: 'Chap tizza', x: 36, y: 74 },
  { id: 'right_knee', label: 'O\'ng tizza', x: 64, y: 74 },
  { id: 'left_foot', label: 'Chap oyoq', x: 36, y: 90 },
  { id: 'right_foot', label: 'O\'ng oyoq', x: 64, y: 90 },
];

export const aiChatResponses = [
  {
    trigger: 'start',
    message: 'Salom! Men sizning javoblaringizni tahlil qildim. Bir nechta savollarim bor, to\'liqroq baholash uchun.',
  },
  {
    trigger: 'follow1',
    message: 'Og\'riq doimiy yoki vaqti-vaqti bilan bo\'ladimi?',
  },
  {
    trigger: 'follow2',
    message: 'Og\'riq kuchaygan paytlarda qanday holat bo\'ladi?',
  },
  {
    trigger: 'result',
    message: 'Tahlil tugadi. Quyida dastlabki baholash natijalarini ko\'rishingiz mumkin.',
  },
];
