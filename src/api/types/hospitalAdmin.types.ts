export interface HAPatientVisitQA {
  id: string;
  question: string;
  answer: string;
}

export interface HAPatientDischargeRecord {
  aiDiagnosis: string;
  doctorNotes: string;
  qa: HAPatientVisitQA[];
}

export interface HAPatientDto {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  doctorId: string;
  doctorName: string;
  lastVisit: string;
  nextVisit: string | null;
  diagnosis: string;
  status: "active" | "discharged" | "scheduled";
  hospitalId: string;
  visitCount: number;
  dischargeRecord?: HAPatientDischargeRecord;
}

export interface HACategoryDto {
  id: string;
  name: string;
}

export interface HAQuestionTemplateDto {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  questionCount: number;
  createdAt: string;
}

export interface HAQuestionDto {
  id: string;
  text: string;
  templateId: string;
  order: number;
}
