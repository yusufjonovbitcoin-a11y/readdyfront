import type { TFunction } from "i18next";

type BodyPart = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export const checkinUiAdapter = {
  getBodyParts: (t: TFunction<"checkin">): BodyPart[] => [
    { id: "head", label: t("questions.bodyParts.head"), x: 50, y: 8 },
    { id: "neck", label: t("questions.bodyParts.neck"), x: 50, y: 16 },
    { id: "chest", label: t("questions.bodyParts.chest"), x: 50, y: 26 },
    { id: "abdomen", label: t("questions.bodyParts.abdomen"), x: 50, y: 38 },
    { id: "left_shoulder", label: t("questions.bodyParts.left_shoulder"), x: 33, y: 21 },
    { id: "right_shoulder", label: t("questions.bodyParts.right_shoulder"), x: 67, y: 21 },
    { id: "left_arm", label: t("questions.bodyParts.left_arm"), x: 24, y: 31 },
    { id: "right_arm", label: t("questions.bodyParts.right_arm"), x: 76, y: 31 },
    { id: "lower_back", label: t("questions.bodyParts.lower_back"), x: 50, y: 50 },
    { id: "left_hip", label: t("questions.bodyParts.left_hip"), x: 42, y: 58 },
    { id: "right_hip", label: t("questions.bodyParts.right_hip"), x: 58, y: 58 },
    { id: "left_knee", label: t("questions.bodyParts.left_knee"), x: 41, y: 71 },
    { id: "right_knee", label: t("questions.bodyParts.right_knee"), x: 59, y: 71 },
    { id: "left_foot", label: t("questions.bodyParts.left_foot"), x: 40, y: 86 },
    { id: "right_foot", label: t("questions.bodyParts.right_foot"), x: 60, y: 86 },
  ],
};
