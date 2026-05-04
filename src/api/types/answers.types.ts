export interface AnswerDto {
  id: string;
  hospital_id: string;
  question_id: string;
  patient_id: string;
  /** @deprecated Kechagi typo uchun vaqtincha saqlangan */
  potient_id?: string;
  answer_text: string;
}

export interface CreateAnswerInput {
  hospital_id: string;
  question_id: string;
  patient_id: string;
  /** @deprecated Kechagi typo uchun vaqtincha saqlangan */
  potient_id?: string;
  answer_text: string;
}

export type UpdateAnswerInput = Partial<CreateAnswerInput>;
