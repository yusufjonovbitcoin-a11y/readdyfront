export type PatientStatus = 'queue' | 'in_progress' | 'completed' | 'history';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Gender = 'male' | 'female';

export interface DocPatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  status: PatientStatus;
  queueTime: string;
  queueNumber: number;
  riskLevel: RiskLevel;
  doctorId: string;
  hospitalId: string;
  symptoms: string[];
  riskFactors: string[];
  notes: string;
  diagnosis: string;
  date: string;
  consultationDuration: number;
}

export const docPatients: DocPatient[] = [
  {
    id: 'dp-001',
    name: 'Sardor Umarov',
    phone: '+998 90 111 22 33',
    age: 45,
    gender: 'male',
    status: 'queue',
    queueTime: '09:15',
    queueNumber: 1,
    riskLevel: 'medium',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Ko\'krak og\'rig\'i', 'Nafas qisishi', 'Charchoq'],
    riskFactors: ['Qon bosimi yuqori', 'Oilada yurak kasalligi', 'Chekadi'],
    notes: '',
    diagnosis: '',
    date: '2026-04-19',
    consultationDuration: 0,
  },
  {
    id: 'dp-002',
    name: 'Mohira Xasanova',
    phone: '+998 91 222 33 44',
    age: 32,
    gender: 'female',
    status: 'queue',
    queueTime: '09:30',
    queueNumber: 2,
    riskLevel: 'low',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Bosh og\'rig\'i', 'Ko\'ngil aynishi'],
    riskFactors: [],
    notes: '',
    diagnosis: '',
    date: '2026-04-19',
    consultationDuration: 0,
  },
  {
    id: 'dp-003',
    name: 'Ulugbek Qodirov',
    phone: '+998 93 333 44 55',
    age: 58,
    gender: 'male',
    status: 'queue',
    queueTime: '09:45',
    queueNumber: 3,
    riskLevel: 'high',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Og\'ir nafas olish', 'Ko\'krak siqilishi', 'Terlash', 'Holsizlik'],
    riskFactors: ['Diabet', 'Semizlik', 'Qon bosimi yuqori', 'Chekadi', 'Harakatsiz turmush tarzi'],
    notes: '',
    diagnosis: '',
    date: '2026-04-19',
    consultationDuration: 0,
  },
  {
    id: 'dp-004',
    name: 'Dilnoza Ergasheva',
    phone: '+998 94 444 55 66',
    age: 28,
    gender: 'female',
    status: 'in_progress',
    queueTime: '08:50',
    queueNumber: 0,
    riskLevel: 'low',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Yo\'tal', 'Burun oqishi', 'Isitma'],
    riskFactors: [],
    notes: 'Bemor 3 kundan beri yo\'talmoqda',
    diagnosis: '',
    date: '2026-04-19',
    consultationDuration: 12,
  },
  {
    id: 'dp-005',
    name: 'Firdavs Normatov',
    phone: '+998 95 555 66 77',
    age: 67,
    gender: 'male',
    status: 'in_progress',
    queueTime: '09:00',
    queueNumber: 0,
    riskLevel: 'critical',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Kuchli ko\'krak og\'rig\'i', 'Chap qo\'lga tarqaluvchi og\'riq', 'Terlash', 'Nafas qisishi', 'Holsizlik'],
    riskFactors: ['Yurak kasalligi tarixi', 'Qon bosimi yuqori', 'Diabet', 'Semizlik', 'Chekadi', '65+ yosh'],
    notes: 'Shoshilinch tekshiruv talab etiladi',
    diagnosis: '',
    date: '2026-04-19',
    consultationDuration: 25,
  },
  {
    id: 'dp-006',
    name: 'Gulnora Tursunova',
    phone: '+998 97 666 77 88',
    age: 41,
    gender: 'female',
    status: 'completed',
    queueTime: '08:00',
    queueNumber: 0,
    riskLevel: 'medium',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Bosh aylanishi', 'Ko\'ngil aynishi', 'Qo\'l titroq'],
    riskFactors: ['Qon bosimi yuqori', 'Stress'],
    notes: 'Dori buyurildi, 1 haftadan keyin qayta ko\'rik',
    diagnosis: 'Arterial gipertenziya, 1-daraja',
    date: '2026-04-19',
    consultationDuration: 18,
  },
  {
    id: 'dp-007',
    name: 'Sherzod Alimov',
    phone: '+998 98 777 88 99',
    age: 35,
    gender: 'male',
    status: 'completed',
    queueTime: '08:20',
    queueNumber: 0,
    riskLevel: 'low',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Charchoq', 'Uyqu buzilishi'],
    riskFactors: [],
    notes: 'Vitaminlar buyurildi, dam olish tavsiya etildi',
    diagnosis: 'Asteniya',
    date: '2026-04-19',
    consultationDuration: 15,
  },
  {
    id: 'dp-008',
    name: 'Barno Xolmatova',
    phone: '+998 99 888 99 00',
    age: 52,
    gender: 'female',
    status: 'history',
    queueTime: '10:00',
    queueNumber: 0,
    riskLevel: 'medium',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Bo\'g\'im og\'rig\'i', 'Shishish'],
    riskFactors: ['Semizlik', 'Harakatsiz turmush tarzi'],
    notes: 'Fizioterapiya kursi tayinlandi',
    diagnosis: 'Osteoartrit',
    date: '2026-04-17',
    consultationDuration: 22,
  },
  {
    id: 'dp-009',
    name: 'Nodir Yuldashev',
    phone: '+998 90 999 00 11',
    age: 23,
    gender: 'male',
    status: 'history',
    queueTime: '11:00',
    queueNumber: 0,
    riskLevel: 'low',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Yo\'tal', 'Nafas qisishi'],
    riskFactors: [],
    notes: 'Inhaler buyurildi',
    diagnosis: 'Bronxial astma, engil shakl',
    date: '2026-04-16',
    consultationDuration: 20,
  },
  {
    id: 'dp-010',
    name: 'Kamola Ismoilova',
    phone: '+998 91 000 11 22',
    age: 39,
    gender: 'female',
    status: 'history',
    queueTime: '14:00',
    queueNumber: 0,
    riskLevel: 'low',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Teri qichishi', 'Qizarish'],
    riskFactors: ['Allergiya'],
    notes: 'Antihistamin dori buyurildi',
    diagnosis: 'Allergik dermatit',
    date: '2026-04-15',
    consultationDuration: 14,
  },
  {
    id: 'dp-011',
    name: 'Ravshan Sobirov',
    phone: '+998 93 111 22 33',
    age: 48,
    gender: 'male',
    status: 'history',
    queueTime: '09:00',
    queueNumber: 0,
    riskLevel: 'high',
    doctorId: 'doc-001',
    hospitalId: 'hosp-001',
    symptoms: ['Ko\'krak og\'rig\'i', 'Nafas qisishi', 'Terlash'],
    riskFactors: ['Qon bosimi yuqori', 'Chekadi', 'Oilada yurak kasalligi'],
    notes: 'Kardiolog konsultatsiyasiga yo\'naltirildi',
    diagnosis: 'Stenokardiya',
    date: '2026-04-14',
    consultationDuration: 30,
  },
];

export interface DocQuestion {
  id: string;
  text: string;
  category: string;
  categoryId: string;
  status: 'active' | 'inactive';
  isCustom: boolean;
  doctorId: string;
  createdAt: string;
}

export const docQuestions: DocQuestion[] = [
  { id: 'dq-001', text: 'Qachondan beri og\'riq sezmoqdasiz?', category: 'Umumiy', categoryId: 'cat-001', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-10' },
  { id: 'dq-002', text: 'Og\'riq darajasini 1-10 shkala bo\'yicha baholang', category: 'Umumiy', categoryId: 'cat-001', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-10' },
  { id: 'dq-003', text: 'Ko\'krak og\'rig\'i bormi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-004', text: 'Nafas qisishini his qilyapsizmi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-005', text: 'Qon bosimingiz qancha?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-006', text: 'Oilada yurak kasalligi bormi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-007', text: 'Chekasizmi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-008', text: 'Spirtli ichimlik ichasizmi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'inactive', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-15' },
  { id: 'dq-009', text: 'Bemor so\'nggi 6 oyda vazn yo\'qotdimi?', category: 'Umumiy', categoryId: 'cat-001', status: 'active', isCustom: true, doctorId: 'doc-001', createdAt: '2026-02-20' },
  { id: 'dq-010', text: 'Tunda terlash kuzatiladimi?', category: 'Umumiy', categoryId: 'cat-001', status: 'active', isCustom: true, doctorId: 'doc-001', createdAt: '2026-02-20' },
  { id: 'dq-011', text: 'Yurak urishi tezlashganmi?', category: 'Yurak-qon tomir', categoryId: 'cat-002', status: 'active', isCustom: true, doctorId: 'doc-001', createdAt: '2026-03-05' },
  { id: 'dq-012', text: 'Qanday dorilar qabul qilmoqdasiz?', category: 'Umumiy', categoryId: 'cat-001', status: 'active', isCustom: false, doctorId: 'doc-001', createdAt: '2026-01-10' },
];

export interface DocAnalyticsDay {
  date: string;
  patients: number;
  avgDuration: number;
  diagnoses: number;
}

export const docAnalytics: DocAnalyticsDay[] = [
  { date: '2026-04-12', patients: 14, avgDuration: 18, diagnoses: 12 },
  { date: '2026-04-13', patients: 11, avgDuration: 20, diagnoses: 9 },
  { date: '2026-04-14', patients: 16, avgDuration: 17, diagnoses: 14 },
  { date: '2026-04-15', patients: 9, avgDuration: 22, diagnoses: 8 },
  { date: '2026-04-16', patients: 13, avgDuration: 19, diagnoses: 11 },
  { date: '2026-04-17', patients: 15, avgDuration: 16, diagnoses: 13 },
  { date: '2026-04-18', patients: 7, avgDuration: 21, diagnoses: 4 },
];
