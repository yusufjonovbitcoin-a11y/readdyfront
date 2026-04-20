export const CHECKIN_SYMPTOMS = {
  HEADACHE: "headache",
  CHEST_PAIN: "chest_pain",
  ABDOMINAL_PAIN: "abdominal_pain",
  JOINT_PAIN: "joint_pain",
  BREATH_SHORTNESS: "breath_shortness",
  FEVER: "fever",
  OTHER: "other",
} as const;

export type CheckinSymptomValue = (typeof CHECKIN_SYMPTOMS)[keyof typeof CHECKIN_SYMPTOMS];
