import type { TFunction } from "i18next";
import { CHECKIN_SYMPTOMS } from "@/pages/checkin/constants/symptoms";

export type QuestionType = 'yes_no' | 'text' | 'select' | 'body_map';
export interface SelectOption {
  value: string;
  label: string;
}

export interface CheckinQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: SelectOption[];
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

interface BodyPart {
  id: string;
  label: string;
  x: number;
  y: number;
}

export const getCheckinQuestions = (t: TFunction<"checkin">): CheckinQuestion[] => [
  {
    id: 'q1',
    text: t("questions.q1.text"),
    type: 'select',
    options: [
      { value: CHECKIN_SYMPTOMS.HEADACHE, label: t("questions.q1.options.headache") },
      { value: CHECKIN_SYMPTOMS.CHEST_PAIN, label: t("questions.q1.options.chest_pain") },
      { value: CHECKIN_SYMPTOMS.ABDOMINAL_PAIN, label: t("questions.q1.options.abdominal_pain") },
      { value: CHECKIN_SYMPTOMS.JOINT_PAIN, label: t("questions.q1.options.joint_pain") },
      { value: CHECKIN_SYMPTOMS.BREATH_SHORTNESS, label: t("questions.q1.options.breath_shortness") },
      { value: CHECKIN_SYMPTOMS.FEVER, label: t("questions.q1.options.fever") },
      { value: CHECKIN_SYMPTOMS.OTHER, label: t("questions.q1.options.other") },
    ],
    required: true,
    category: t("questions.q1.category"),
  },
  {
    id: 'q2',
    text: t("questions.q2.text"),
    type: 'body_map',
    required: false,
    category: t("questions.q2.category"),
  },
  {
    id: 'q3',
    text: t("questions.q3.text"),
    type: 'select',
    options: [
      { value: "today", label: t("questions.q3.options.today") },
      { value: "day_1_3", label: t("questions.q3.options.day_1_3") },
      { value: "week_1", label: t("questions.q3.options.week_1") },
      { value: "month_1", label: t("questions.q3.options.month_1") },
      { value: "more_than_month", label: t("questions.q3.options.more_than_month") },
    ],
    required: true,
    category: t("questions.q3.category"),
  },
  {
    id: 'q4',
    text: t("questions.q4.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q4.category"),
  },
  {
    id: 'q5',
    text: t("questions.q5.text"),
    type: 'text',
    required: false,
    conditionalOn: { questionId: 'q4', answer: 'yes' },
    category: t("questions.q5.category"),
  },
  {
    id: 'q6',
    text: t("questions.q6.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q6.category"),
  },
  {
    id: 'q7',
    text: t("questions.q7.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q7.category"),
  },
  {
    id: 'q8',
    text: t("questions.q8.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q8.category"),
  },
  {
    id: 'q9',
    text: t("questions.q9.text"),
    type: 'select',
    options: [
      { value: "mild", label: t("questions.q9.options.mild") },
      { value: "medium", label: t("questions.q9.options.medium") },
      { value: "strong", label: t("questions.q9.options.strong") },
      { value: "very_strong", label: t("questions.q9.options.very_strong") },
    ],
    required: false,
    conditionalOn: { questionId: 'q8', answer: 'yes' },
    category: t("questions.q9.category"),
  },
  {
    id: 'q10',
    text: t("questions.q10.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q10.category"),
  },
  {
    id: 'q11',
    text: t("questions.q11.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q11.category"),
  },
  {
    id: 'q12',
    text: t("questions.q12.text"),
    type: 'text',
    required: false,
    category: t("questions.q12.category"),
  },
  {
    id: 'q13',
    text: t("questions.q13.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q13.category"),
  },
  {
    id: 'q14',
    text: t("questions.q14.text"),
    type: 'text',
    required: false,
    conditionalOn: { questionId: 'q13', answer: 'yes' },
    category: t("questions.q14.category"),
  },
  {
    id: 'q15',
    text: t("questions.q15.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q15.category"),
  },
  {
    id: 'q16',
    text: t("questions.q16.text"),
    type: 'select',
    options: [
      { value: "diabetes", label: t("questions.q16.options.diabetes") },
      { value: "hypertension", label: t("questions.q16.options.hypertension") },
      { value: "heart_disease", label: t("questions.q16.options.heart_disease") },
      { value: "asthma", label: t("questions.q16.options.asthma") },
      { value: "other", label: t("questions.q16.options.other") },
    ],
    required: false,
    conditionalOn: { questionId: 'q15', answer: 'yes' },
    category: t("questions.q16.category"),
  },
  {
    id: 'q17',
    text: t("questions.q17.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q17.category"),
  },
  {
    id: 'q18',
    text: t("questions.q18.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q18.category"),
  },
  {
    id: 'q19',
    text: t("questions.q19.text"),
    type: 'yes_no',
    required: true,
    category: t("questions.q19.category"),
  },
  {
    id: 'q20',
    text: t("questions.q20.text"),
    type: 'text',
    required: false,
    category: t("questions.q20.category"),
  },
];

export const getBodyParts = (t: TFunction<"checkin">): BodyPart[] => [
  { id: "head", label: t("questions.bodyParts.head"), x: 50, y: 8 },
  { id: "neck", label: t("questions.bodyParts.neck"), x: 50, y: 16 },
  { id: "chest", label: t("questions.bodyParts.chest"), x: 50, y: 28 },
  { id: "left_shoulder", label: t("questions.bodyParts.left_shoulder"), x: 30, y: 24 },
  { id: "right_shoulder", label: t("questions.bodyParts.right_shoulder"), x: 70, y: 24 },
  { id: "left_arm", label: t("questions.bodyParts.left_arm"), x: 22, y: 38 },
  { id: "right_arm", label: t("questions.bodyParts.right_arm"), x: 78, y: 38 },
  { id: "abdomen", label: t("questions.bodyParts.abdomen"), x: 50, y: 42 },
  { id: "lower_back", label: t("questions.bodyParts.lower_back"), x: 50, y: 52 },
  { id: "left_hip", label: t("questions.bodyParts.left_hip"), x: 38, y: 60 },
  { id: "right_hip", label: t("questions.bodyParts.right_hip"), x: 62, y: 60 },
  { id: "left_knee", label: t("questions.bodyParts.left_knee"), x: 36, y: 74 },
  { id: "right_knee", label: t("questions.bodyParts.right_knee"), x: 64, y: 74 },
  { id: "left_foot", label: t("questions.bodyParts.left_foot"), x: 36, y: 90 },
  { id: "right_foot", label: t("questions.bodyParts.right_foot"), x: 64, y: 90 },
];
