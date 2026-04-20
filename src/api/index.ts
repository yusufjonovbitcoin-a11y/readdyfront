import * as hospitalsHttp from "@/api/adapters/hospitals.http";
import * as hospitalsMock from "@/api/adapters/hospitals.mock";
import * as authHttp from "@/api/adapters/auth.http";
import * as authMock from "@/api/adapters/auth.mock";
import * as usersHttp from "@/api/adapters/users.http";
import * as usersMock from "@/api/adapters/users.mock";
import * as doctorHttp from "@/api/adapters/doctor.http";
import * as doctorMock from "@/api/adapters/doctor.mock";
import * as auditHttp from "@/api/adapters/audit.http";
import * as auditMock from "@/api/adapters/audit.mock";
import * as checkinHttp from "@/api/adapters/checkin.http";
import * as checkinMock from "@/api/adapters/checkin.mock";
import * as analyticsHttp from "@/api/adapters/analytics.http";
import * as analyticsMock from "@/api/adapters/analytics.mock";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

if (import.meta.env.PROD && useMock) {
  throw new Error("Mock adapterlar production rejimida yoqilishi mumkin emas (VITE_USE_MOCK=false bo'lishi kerak).");
}

export const hospitalAdapter = useMock ? hospitalsMock : hospitalsHttp;
export const authAdapter = useMock ? authMock : authHttp;
export const userAdapter = useMock ? usersMock : usersHttp;
export const doctorAdapter = useMock ? doctorMock : doctorHttp;
export const auditAdapter = useMock ? auditMock : auditHttp;
export const checkinAdapter = useMock ? checkinMock : checkinHttp;
export const analyticsAdapter = useMock ? analyticsMock : analyticsHttp;
