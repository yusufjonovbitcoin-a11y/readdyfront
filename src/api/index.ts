import * as hospitalsHttp from "@/api/adapters/hospitals.http";
import * as authHttp from "@/api/adapters/auth.http";
import * as usersHttp from "@/api/adapters/users.http";
import * as doctorHttp from "@/api/adapters/doctor.http";
import * as auditHttp from "@/api/adapters/audit.http";
import * as checkinHttp from "@/api/adapters/checkin.http";
import * as analyticsHttp from "@/api/adapters/analytics.http";
import { hospitalAdminAdapter } from "@/api/adapters/hospitalAdmin.adapter";
import { homeAdapter } from "@/api/adapters/home.adapter";
import { checkinUiAdapter } from "@/api/adapters/checkinUi.adapter";

export const hospitalAdapter = hospitalsHttp;
export const authAdapter = authHttp;
export const userAdapter = usersHttp;
export const doctorAdapter = doctorHttp;
export const auditAdapter = auditHttp;
export const checkinAdapter = checkinHttp;
export const analyticsAdapter = analyticsHttp;
export { hospitalAdminAdapter, homeAdapter, checkinUiAdapter };
