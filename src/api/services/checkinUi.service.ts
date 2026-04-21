import { checkinUiAdapter } from "@/api";
import type { TFunction } from "i18next";

export function getCheckinBodyParts(t: TFunction<"checkin">) {
  return checkinUiAdapter.getBodyParts(t);
}
