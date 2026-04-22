import * as answersHttp from "@/api/adapters/answers.http";
import type { AnswerDto, CreateAnswerInput, UpdateAnswerInput } from "@/api/types/answers.types";

export function getAnswers(): Promise<AnswerDto[]> {
  return answersHttp.getAnswers();
}

export function getAnswerById(id: string): Promise<AnswerDto | null> {
  return answersHttp.getAnswerById(id);
}

export function createAnswer(input: CreateAnswerInput): Promise<AnswerDto> {
  return answersHttp.createAnswer(input);
}

export function updateAnswer(id: string, input: UpdateAnswerInput): Promise<AnswerDto | null> {
  return answersHttp.updateAnswer(id, input);
}

export function deleteAnswer(id: string): Promise<boolean> {
  return answersHttp.deleteAnswer(id);
}
