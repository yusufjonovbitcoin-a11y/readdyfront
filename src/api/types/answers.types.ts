export interface AnswerDto {
  id: string;
  hospital_id: string;
  question_id: string;
  potient_id: string;
  answer_text: string;
}

export interface CreateAnswerInput {
  hospital_id: string;
  question_id: string;
  potient_id: string;
  answer_text: string;
}

export type UpdateAnswerInput = Partial<CreateAnswerInput>;
