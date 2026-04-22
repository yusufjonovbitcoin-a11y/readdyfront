import { apiRequest } from "@/api/client";
import type { AnswerDto, CreateAnswerInput, UpdateAnswerInput } from "@/api/types/answers.types";

export async function getAnswers(): Promise<AnswerDto[]> {
  return apiRequest<AnswerDto[]>("/api/answers");
}

export async function getAnswerById(id: string): Promise<AnswerDto | null> {
  return apiRequest<AnswerDto | null>(`/api/answers/${encodeURIComponent(id)}`);
}

export async function createAnswer(input: CreateAnswerInput): Promise<AnswerDto> {
  return apiRequest<AnswerDto>("/api/answers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAnswer(id: string, input: UpdateAnswerInput): Promise<AnswerDto | null> {
  return apiRequest<AnswerDto | null>(`/api/answers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAnswer(id: string): Promise<boolean> {
  await apiRequest<null>(`/api/answers/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}
