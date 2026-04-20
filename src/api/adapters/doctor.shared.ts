import type {
  DoctorAnalyticsPresetsDto,
  DoctorQuestionCategoryDto,
  DoctorQuestionTemplateDto,
} from "@/api/types/doctor.types";

const QUESTION_CATEGORIES: DoctorQuestionCategoryDto[] = [
  { id: "all", name: "Barchasi" },
  { id: "cat-001", name: "Umumiy" },
  { id: "cat-002", name: "Yurak-qon tomir" },
  { id: "cat-003", name: "Nevrologiya" },
  { id: "cat-004", name: "Pediatriya" },
  { id: "cat-005", name: "Ortopediya" },
];

const QUESTION_TEMPLATES: DoctorQuestionTemplateDto[] = [
  { id: "gt-001", text: "Allergiyangiz bormi?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-002", text: "Qanday dorilar qabul qilmoqdasiz?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-003", text: "Oilada surunkali kasalliklar bormi?", category: "Umumiy", categoryId: "cat-001" },
  { id: "gt-004", text: "Bosh aylanishi kuzatiladimi?", category: "Nevrologiya", categoryId: "cat-003" },
  { id: "gt-005", text: "Uyqu muammolari bormi?", category: "Nevrologiya", categoryId: "cat-003" },
];

const ANALYTICS_PRESETS: DoctorAnalyticsPresetsDto = {
  weekly: [
    { label: "Du", patients: 14, diagnoses: 12, avgDuration: 18 },
    { label: "Se", patients: 11, diagnoses: 9, avgDuration: 20 },
    { label: "Ch", patients: 16, diagnoses: 14, avgDuration: 17 },
    { label: "Pa", patients: 9, diagnoses: 8, avgDuration: 22 },
    { label: "Ju", patients: 13, diagnoses: 11, avgDuration: 19 },
    { label: "Sh", patients: 15, diagnoses: 13, avgDuration: 16 },
    { label: "Ya", patients: 7, diagnoses: 4, avgDuration: 21 },
  ],
  monthly: [
    { label: "1-hafta", patients: 68, diagnoses: 58, avgDuration: 19 },
    { label: "2-hafta", patients: 74, diagnoses: 63, avgDuration: 18 },
    { label: "3-hafta", patients: 61, diagnoses: 52, avgDuration: 20 },
    { label: "4-hafta", patients: 85, diagnoses: 71, avgDuration: 17 },
  ],
  diagnosisShares: {
    daily: [
      { name: "Arterial gipertenziya", share: 32, color: "bg-violet-500" },
      { name: "Stenokardiya", share: 22, color: "bg-blue-500" },
      { name: "Yurak yetishmovchiligi", share: 18, color: "bg-red-500" },
      { name: "Aritmiya", share: 14, color: "bg-amber-500" },
      { name: "Boshqa", share: 14, color: "bg-gray-400" },
    ],
    weekly: [
      { name: "Arterial gipertenziya", share: 30, color: "bg-violet-500" },
      { name: "Stenokardiya", share: 21, color: "bg-blue-500" },
      { name: "Yurak yetishmovchiligi", share: 16, color: "bg-red-500" },
      { name: "Aritmiya", share: 12, color: "bg-amber-500" },
      { name: "Boshqa", share: 21, color: "bg-gray-400" },
    ],
    monthly: [
      { name: "Arterial gipertenziya", share: 28, color: "bg-violet-500" },
      { name: "Stenokardiya", share: 20, color: "bg-blue-500" },
      { name: "Yurak yetishmovchiligi", share: 18, color: "bg-red-500" },
      { name: "Aritmiya", share: 15, color: "bg-amber-500" },
      { name: "Boshqa", share: 19, color: "bg-gray-400" },
    ],
  },
  peakHours: {
    daily: [
      { hour: "08:00", count: 2 },
      { hour: "09:00", count: 6 },
      { hour: "10:00", count: 10 },
      { hour: "11:00", count: 8 },
      { hour: "12:00", count: 4 },
      { hour: "13:00", count: 2 },
      { hour: "14:00", count: 7 },
      { hour: "15:00", count: 9 },
      { hour: "16:00", count: 6 },
      { hour: "17:00", count: 3 },
    ],
    weekly: [
      { hour: "08:00", count: 3 },
      { hour: "09:00", count: 8 },
      { hour: "10:00", count: 12 },
      { hour: "11:00", count: 10 },
      { hour: "12:00", count: 5 },
      { hour: "13:00", count: 2 },
      { hour: "14:00", count: 9 },
      { hour: "15:00", count: 11 },
      { hour: "16:00", count: 7 },
      { hour: "17:00", count: 4 },
    ],
    monthly: [
      { hour: "08:00", count: 5 },
      { hour: "09:00", count: 12 },
      { hour: "10:00", count: 18 },
      { hour: "11:00", count: 15 },
      { hour: "12:00", count: 9 },
      { hour: "13:00", count: 4 },
      { hour: "14:00", count: 14 },
      { hour: "15:00", count: 16 },
      { hour: "16:00", count: 11 },
      { hour: "17:00", count: 7 },
    ],
  },
  trends: {
    daily: { patients: "+4%", diagnoses: "+2%", avgTime: "-1 daq", efficiency: "+1%" },
    weekly: { patients: "+12%", diagnoses: "+8%", avgTime: "-2 daq", efficiency: "+3%" },
    monthly: { patients: "+18%", diagnoses: "+14%", avgTime: "-3 daq", efficiency: "+5%" },
  },
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDefaultDoctorQuestionCategories(): DoctorQuestionCategoryDto[] {
  return deepClone(QUESTION_CATEGORIES);
}

export function getDefaultDoctorQuestionTemplates(): DoctorQuestionTemplateDto[] {
  return deepClone(QUESTION_TEMPLATES);
}

export function getDefaultDoctorAnalyticsPresets(): DoctorAnalyticsPresetsDto {
  return deepClone(ANALYTICS_PRESETS);
}
