import "i18next";
import "react-i18next";
import type { UseTranslationOptions, UseTranslationResponse } from "react-i18next";
import type { TFunction } from "i18next";

type AppResources = {
  common: typeof import("./locales/uz/common.json");
  admin: typeof import("./locales/uz/admin.json");
  auth: typeof import("./locales/uz/auth.json");
  hospital: typeof import("./locales/uz/hospital.json");
  doctor: typeof import("./locales/uz/doctor.json");
  checkin: typeof import("./locales/uz/checkin.json");
};

type AppNamespace = keyof AppResources;
type Primitive = string | number | boolean | null | undefined;
type DotPaths<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive ? K : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];

type ScopedKey<Ns extends AppNamespace> = DotPaths<AppResources[Ns]> | `${AppNamespace}:${string}`;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: AppResources;
    allowObjectInHTMLChildren: false;
  }
}

declare module "react-i18next" {
  function useTranslation<Ns extends AppNamespace>(
    ns: Ns,
    options?: UseTranslationOptions<undefined>,
  ): Omit<UseTranslationResponse<Ns>, "t"> & {
    t: TFunction<Ns> & ((key: ScopedKey<Ns>, options?: Record<string, unknown>) => string);
  };

  function useTranslation(
    ns: AppNamespace[],
    options?: UseTranslationOptions<undefined>,
  ): UseTranslationResponse<AppNamespace[]>;
}
