export interface DoctorDto {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  avatar: string;
  todayPatients: number;
  totalPatients: number;
  rating: number;
  status: "active" | "inactive";
  joinDate: string;
  hospitalId: string;
  qrCode: string;
}

export type DoctorPatientStatus = "queue" | "in_progress" | "completed" | "history";
export type DoctorPatientRiskLevel = "low" | "medium" | "high" | "critical";
export type DoctorPatientGender = "male" | "female";

export interface DoctorPatientDto {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: DoctorPatientGender;
  status: DoctorPatientStatus;
  queueTime: string;
  queueNumber: number;
  riskLevel: DoctorPatientRiskLevel;
  doctorId: string;
  hospitalId: string;
  symptoms: string[];
  riskFactors: string[];
  notes: string;
  diagnosis: string;
  date: string;
  consultationDuration: number;
}

export type DoctorQuestionType = "TEXT" | "TEXTAREA" | "NUMBER" | "SELECT" | "RADIO" | "CHECKBOX" | "DATE";
export type DoctorQuestionScope = "TEMPLATE" | "DOCTOR";
export type DoctorQuestionAnswerMode = "YES_NO" | "FREE_TEXT";

export interface DoctorQuestionDto {
  id: string;
  text: string;
  category: string;
  categoryId: string;
  type?: DoctorQuestionType;
  scope?: DoctorQuestionScope;
  answerMode?: DoctorQuestionAnswerMode;
  status: "active" | "inactive";
  isCustom: boolean;
  doctorId: string;
  createdAt: string;
}

export interface DoctorQuestionCategoryDto {
  id: string;
  name: string;
}

export interface DoctorQuestionTemplateDto {
  id: string;
  text: string;
  category: string;
  categoryId: string;
}

export interface DoctorAnalyticsDto {
  date: string;
  patients: number;
  avgDuration: number;
  diagnoses: number;
}

export type DoctorAnalyticsPeriod = "daily" | "weekly" | "monthly";

export interface DoctorAnalyticsSummaryPointDto {
  label: string;
  patients: number;
  diagnoses: number;
  avgDuration: number;
}

export interface DoctorDiagnosisShareDto {
  name: string;
  share: number;
  color: string;
}

export interface DoctorPeakHourDto {
  hour: string;
  count: number;
}

export interface DoctorAnalyticsTrendsDto {
  patients: string;
  diagnoses: string;
  avgTime: string;
  efficiency: string;
}

export interface DoctorAnalyticsPresetsDto {
  weekly: DoctorAnalyticsSummaryPointDto[];
  monthly: DoctorAnalyticsSummaryPointDto[];
  diagnosisShares: Record<DoctorAnalyticsPeriod, DoctorDiagnosisShareDto[]>;
  peakHours: Record<DoctorAnalyticsPeriod, DoctorPeakHourDto[]>;
  trends: Record<DoctorAnalyticsPeriod, DoctorAnalyticsTrendsDto>;
}

export interface UpdateDoctorStatusInput {
  status: "active" | "inactive";
}
