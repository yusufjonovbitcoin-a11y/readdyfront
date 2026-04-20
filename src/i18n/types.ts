import adminRu from "./locales/ru/admin.json";
import authRu from "./locales/ru/auth.json";
import checkinRu from "./locales/ru/checkin.json";
import commonRu from "./locales/ru/common.json";
import doctorRu from "./locales/ru/doctor.json";
import hospitalRu from "./locales/ru/hospital.json";
import adminUz from "./locales/uz/admin.json";
import authUz from "./locales/uz/auth.json";
import checkinUz from "./locales/uz/checkin.json";
import commonUz from "./locales/uz/common.json";
import doctorUz from "./locales/uz/doctor.json";
import hospitalUz from "./locales/uz/hospital.json";

export const defaultNS = "common" as const;

/**
 * Base resource shape for type inference.
 * Uzbek namespace files are used as the source of truth for keys.
 */
export const resources = {
  uz: {
    common: commonUz,
    auth: authUz,
    checkin: checkinUz,
    hospital: hospitalUz,
    doctor: doctorUz,
    admin: adminUz,
  },
  ru: {
    common: commonRu,
    auth: authRu,
    checkin: checkinRu,
    hospital: hospitalRu,
    doctor: doctorRu,
    admin: adminRu,
  },
} as const;

export type AppResources = (typeof resources)["uz"];
export type AppNamespace = keyof AppResources;
