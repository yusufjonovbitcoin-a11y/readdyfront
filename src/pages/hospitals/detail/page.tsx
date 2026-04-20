import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { isBlank, isValidUzPhone, normalizeWhitespace } from "@/utils/fieldValidation";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import { getHospitalById } from "@/api/hospitals";
import { getDoctors, getDoctorAnalytics, getDoctorPatients } from "@/api/doctor";
import type { Hospital } from "@/types";
import type { DoctorDto, DoctorPatientDto, DoctorAnalyticsDto } from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";

type Tab = "overview" | "doctors" | "admins" | "patients" | "analytics" | "settings";

type HospitalDetailPayload = {
  hospital: Hospital | null;
  doctors: DoctorDto[];
  patients: DoctorPatientDto[];
  dailyData: DoctorAnalyticsDto[];
};

export function HospitalDetailContent() {
  const dm = useMainLayoutDarkMode();
  const { id } = useParams();
  const navigate = useNavigate();
  const fetchDetail = useCallback(async (): Promise<HospitalDetailPayload> => {
    if (!id) {
      return { hospital: null, doctors: [], patients: [], dailyData: [] };
    }
    const [hospital, allDoctors, allPatients, analytics] = await Promise.all([
      getHospitalById(id),
      getDoctors(),
      getDoctorPatients(),
      getDoctorAnalytics(),
    ]);
    if (!hospital) {
      return { hospital: null, doctors: [], patients: [], dailyData: analytics };
    }
    const hospitalAliasId = hospital.id.startsWith("hosp-") ? hospital.id : `hosp-00${hospital.id}`;
    const doctors = allDoctors.filter((doctor) => doctor.hospitalId === hospital.id || doctor.hospitalId === hospitalAliasId);
    const doctorIds = new Set(doctors.map((doctor) => doctor.id));
    const patients = allPatients.filter((patient) =>
      patient.hospitalId === hospital.id ||
      patient.hospitalId === hospitalAliasId ||
      doctorIds.has(patient.doctorId),
    );
    return { hospital, doctors, patients, dailyData: analytics };
  }, [id]);
  const pageState = usePageState(fetchDetail);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [patientSearch, setPatientSearch] = useState("");
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: "", specialty: "", phone: "" });
  const [doctorFormErrors, setDoctorFormErrors] = useState<Partial<Record<keyof typeof doctorForm, string>>>({});
  const [settingsForm, setSettingsForm] = useState({ name: "", address: "", phone: "" });
  const [settingsErrors, setSettingsErrors] = useState<Partial<Record<keyof typeof settingsForm, string>>>({});
  const [demoStatus, setDemoStatus] = useState<"active" | "inactive">("active");
  const { toast, showToast } = useAppToast(2400);
  const hospital = pageState.data?.hospital ?? null;
  const doctors = pageState.data?.doctors ?? [];
  const doctorNameById = useMemo(() => {
    const m = new Map<string, string>();
    doctors.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [doctors]);
  const patients = useMemo(
    () =>
      (pageState.data?.patients ?? [])
        .filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch))
        .map((p) => ({
          ...p,
          dob: "-",
          lastVisit: p.date,
          status: p.status === "history" ? "discharged" : "active",
          doctorName: doctorNameById.get(p.doctorId) ?? "-",
          genderLabel: p.gender === "male" ? "Erkak" : "Ayol",
        })),
    [doctorNameById, pageState.data?.patients, patientSearch],
  );
  const detailTodayStats = {
    newPatients: (pageState.data?.patients ?? []).filter((p) => p.date === new Date().toISOString().slice(0, 10)).length,
    appointments: (pageState.data?.patients ?? []).length,
    completed: (pageState.data?.patients ?? []).filter((p) => p.status === "completed").length,
    cancelled: null as number | null,
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Umumiy", icon: "ri-information-line" },
    { key: "doctors", label: "Shifokorlar", icon: "ri-stethoscope-line" },
    { key: "admins", label: "Administratorlar", icon: "ri-user-settings-line" },
    { key: "patients", label: "Bemorlar", icon: "ri-user-heart-line" },
    { key: "analytics", label: "Tahlil", icon: "ri-bar-chart-2-line" },
    { key: "settings", label: "Sozlamalar", icon: "ri-settings-3-line" },
  ];

  const dailyData = pageState.data?.dailyData ?? [];
  const maxPatients = Math.max(...dailyData.map((d) => d.patients), 1);

  useEffect(() => {
    if (!hospital) return;
    setSettingsForm({
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
    });
    setDemoStatus(hospital.status === "inactive" ? "inactive" : "active");
  }, [hospital]);

  if (pageState.status === "loading") {
    return (
      <div className={`rounded-xl p-14 text-center ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
        <i className="ri-loader-4-line animate-spin text-2xl text-emerald-500" />
        <p className={`mt-3 text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>Kasalxona tafsilotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <div className={`rounded-xl p-14 text-center ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
        <i className="ri-error-warning-line text-2xl text-red-500" />
        <p className={`mt-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{pageState.error}</p>
        <button
          type="button"
          onClick={pageState.reload}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  if (!hospital) {
    return <HospitalNotFoundContent />;
  }

  const validateDoctorForm = () => {
    const nextErrors: Partial<Record<keyof typeof doctorForm, string>> = {};
    if (isBlank(doctorForm.name)) {
      nextErrors.name = "To'liq ism majburiy.";
    }
    if (isBlank(doctorForm.specialty)) {
      nextErrors.specialty = "Mutaxassislik majburiy.";
    }
    if (!isValidUzPhone(doctorForm.phone)) {
      nextErrors.phone = "Telefon +998 XX XXX XX XX formatida bo'lishi kerak.";
    }
    return nextErrors;
  };

  const handleSaveDoctorForm = () => {
    const nextErrors = validateDoctorForm();
    setDoctorFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setShowAddDoctor(false);
    showToast("Demo rejim: shifokor ma'lumoti faqat lokal ko'rinishda saqlandi.", "info");
  };

  const validateSettingsForm = () => {
    const nextErrors: Partial<Record<keyof typeof settingsForm, string>> = {};
    if (isBlank(settingsForm.name)) {
      nextErrors.name = "Kasalxona nomi majburiy.";
    }
    if (isBlank(settingsForm.address)) {
      nextErrors.address = "Manzil majburiy.";
    }
    if (!isValidUzPhone(settingsForm.phone)) {
      nextErrors.phone = "Telefon +998 XX XXX XX XX formatida bo'lishi kerak.";
    }
    return nextErrors;
  };

  const handleSaveSettings = () => {
    const nextErrors = validateSettingsForm();
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSettingsForm({
      name: normalizeWhitespace(settingsForm.name),
      address: normalizeWhitespace(settingsForm.address),
      phone: normalizeWhitespace(settingsForm.phone),
    });
    showToast("Demo rejim: sozlamalar serverga yuborilmadi.", "info");
  };

  return (
      <div className="space-y-5">
        <AppToast toast={toast} />
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/hospitals")}
            aria-label="Kasalxonalar ro'yxatiga qaytish"
            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-white text-gray-400 hover:text-gray-700"}`}
          >
            <i className="ri-arrow-left-line text-sm" aria-hidden="true"></i>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-lg font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{hospital.name}</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hospital.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {hospital.status === "active" ? "Faol" : "Nofaol"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{hospital.address}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 border-b ${dm ? "border-[#1E2130]" : "border-gray-200"} overflow-x-auto`}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === t.key
                  ? "border-emerald-500 text-emerald-400"
                  : `border-transparent ${dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${t.icon} text-sm`}></i>
              </div>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Info */}
            <div className={`lg:col-span-2 rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Umumiy Ma'lumot</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Telefon", value: hospital.phone, icon: "ri-phone-line" },
                  { label: "Admin", value: hospital.adminName, icon: "ri-user-line" },
                  { label: "Admin Telefoni", value: hospital.adminPhone, icon: "ri-smartphone-line" },
                  { label: "Yaratilgan", value: hospital.createdAt, icon: "ri-calendar-line" },
                  { label: "Jami Shifokorlar", value: String(hospital.doctorsCount), icon: "ri-stethoscope-line" },
                  { label: "Kunlik Bemorlar", value: String(hospital.dailyPatients), icon: "ri-user-heart-line" },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${item.icon} text-emerald-400 text-sm`}></i>
                      </div>
                      <span className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{item.label}</span>
                    </div>
                    <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Today Stats */}
            <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Bugungi Statistika</h3>
              <div className="space-y-3">
                {[
                  { label: "Yangi Bemorlar", value: detailTodayStats.newPatients, color: "text-emerald-400", icon: "ri-user-add-line" },
                  { label: "Uchrashuvlar", value: detailTodayStats.appointments, color: "text-blue-400", icon: "ri-calendar-check-line" },
                  { label: "Yakunlangan", value: detailTodayStats.completed, color: "text-violet-400", icon: "ri-checkbox-circle-line" },
                  { label: "Bekor qilingan", value: detailTodayStats.cancelled ?? "—", color: "text-red-400", icon: "ri-close-circle-line" },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${s.icon} ${s.color} text-sm`}></i>
                      </div>
                      <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{s.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>{doctors.length} ta shifokor</p>
              <button onClick={() => setShowAddDoctor(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                <i className="ri-add-line"></i> Shifokor qo'shish
              </button>
            </div>
            <p className={`text-xs ${dm ? "text-amber-400" : "text-amber-600"}`}>
              Demo rejim: bu bo'limdagi o'zgarishlar backendga saqlanmaydi.
            </p>

            {showAddDoctor && (
              <div className={`rounded-xl p-5 border ${dm ? "bg-[#1A2235] border-emerald-500/30" : "bg-white border-emerald-200"}`}>
                <h4 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Yangi Shifokor</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: "name", placeholder: "To'liq ism" },
                    { key: "specialty", placeholder: "Mutaxassislik" },
                    { key: "phone", placeholder: "Telefon" },
                  ].map((f) => (
                    <input
                      key={f.key}
                      id={`hospital-detail-doctor-${f.key}`}
                      aria-invalid={Boolean(doctorFormErrors[f.key as keyof typeof doctorForm])}
                      aria-describedby={doctorFormErrors[f.key as keyof typeof doctorForm] ? `hospital-detail-doctor-${f.key}-error` : undefined}
                      className={`px-3 py-2 rounded-lg text-sm outline-none ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"}`}
                      placeholder={f.placeholder}
                      value={doctorForm[f.key as keyof typeof doctorForm]}
                      onChange={(e) => {
                        setDoctorForm({ ...doctorForm, [f.key]: e.target.value });
                        if (doctorFormErrors[f.key as keyof typeof doctorForm]) {
                          setDoctorFormErrors((prev) => ({ ...prev, [f.key]: undefined }));
                        }
                      }}
                    />
                  ))}
                </div>
                {(doctorFormErrors.name || doctorFormErrors.specialty || doctorFormErrors.phone) && (
                  <div className="mt-2 space-y-1">
                    {doctorFormErrors.name && (
                      <p id="hospital-detail-doctor-name-error" className="text-xs text-red-500">{doctorFormErrors.name}</p>
                    )}
                    {doctorFormErrors.specialty && (
                      <p id="hospital-detail-doctor-specialty-error" className="text-xs text-red-500">{doctorFormErrors.specialty}</p>
                    )}
                    {doctorFormErrors.phone && (
                      <p id="hospital-detail-doctor-phone-error" className="text-xs text-red-500">{doctorFormErrors.phone}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowAddDoctor(false)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${dm ? "bg-[#0F1117] text-gray-400" : "bg-gray-100 text-gray-600"}`}>Bekor</button>
                  <button onClick={handleSaveDoctorForm} className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white cursor-pointer whitespace-nowrap hover:bg-emerald-600">Saqlash</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <div key={d.id} className={`rounded-xl p-4 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 text-sm font-bold">{d.avatar}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{d.name}</p>
                        <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{d.specialty}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${d.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {d.status === "active" ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
                    <div>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Bugun</p>
                      <p className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{d.todayPatients} bemor</p>
                    </div>
                    <div>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Tajriba</p>
                      <p className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{("experience" in d && typeof d.experience === "number") ? `${d.experience} yil` : "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg w-full sm:max-w-xs ${dm ? "bg-[#1A2235]" : "bg-white border border-gray-200"}`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`ri-search-line text-sm ${dm ? "text-gray-400" : "text-gray-400"}`}></i>
              </div>
              <input
                className={`flex-1 bg-transparent text-sm outline-none ${dm ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
                placeholder="Bemor qidirish..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>

            <div className={`rounded-xl overflow-hidden ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <div className="space-y-3 p-3 md:hidden">
                {patients.map((p) => (
                  <article
                    key={p.id}
                    className={`rounded-lg border p-3 ${dm ? "border-[#1E2130] bg-[#0F1117]/40" : "border-gray-100 bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{p.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {p.status === "active" ? "Faol" : "Chiqarilgan"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">Shifokor:</span> {p.doctorName}
                      </p>
                      <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">Tug'ilgan sana:</span> {p.dob}
                      </p>
                      <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">Jins:</span> {p.genderLabel}
                      </p>
                      <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">So'nggi tashrif:</span> {p.lastVisit}
                      </p>
                    </div>
                    <p className={`mt-2 text-xs ${dm ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="font-medium">Tashxis:</span> {p.diagnosis}
                    </p>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[940px]">
                  <thead>
                    <tr className={dm ? "bg-[#0F1117]" : "bg-gray-50"}>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Ism</th>
                      <th className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Telefon</th>
                      <th className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Tug'ilgan sana</th>
                      <th className={`hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Jins</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Shifokor</th>
                      <th className={`hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>So'nggi tashrif</th>
                      <th className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Tashxis</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, i) => (
                      <tr key={p.id} className={`border-t ${dm ? "border-[#1E2130]" : "border-gray-50"} ${i % 2 === 0 ? dm ? "bg-[#1A2235]" : "" : dm ? "bg-[#161D2E]" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-3">
                          <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        </td>
                        <td className={`hidden sm:table-cell px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.phone}</td>
                        <td className={`hidden md:table-cell px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.dob}</td>
                        <td className={`hidden lg:table-cell px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.genderLabel}</td>
                        <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>
                          {p.doctorName}
                        </td>
                        <td className={`hidden lg:table-cell px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.lastVisit}</td>
                        <td className={`hidden md:table-cell px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {p.status === "active" ? "Faol" : "Chiqarilgan"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Kunlik Tashriflar (So'nggi 7 kun)</h3>
              <div className="flex items-end gap-2 h-40">
                {dailyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{d.patients}</span>
                    <div
                      className="w-full rounded-t-md bg-emerald-500 transition-all"
                      style={{ height: `${(d.patients / maxPatients) * 120}px` }}
                    ></div>
                    <span className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "O'rtacha kunlik", value: "312", icon: "ri-user-heart-line", color: "text-emerald-400" },
                { label: "Eng yuqori kun", value: "Apr 15 — 356", icon: "ri-arrow-up-line", color: "text-blue-400" },
                { label: "Yakunlash darajasi", value: "87%", icon: "ri-checkbox-circle-line", color: "text-violet-400" },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-4 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${s.icon} ${s.color} text-sm`}></i>
                    </div>
                    <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{s.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>Administratorlar</h3>
              <button
                onClick={() => showToast("Demo rejim: admin qo'shish backendga ulanmagan.", "info")}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm cursor-pointer hover:bg-emerald-600 whitespace-nowrap"
              >
                <i className="ri-add-line"></i> Admin qo'shish
              </button>
            </div>
            <div className="space-y-3">
              {[{ name: hospital.adminName, phone: hospital.adminPhone, role: "HOSPITAL_ADMIN", status: "active" }].map((a, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-sm font-bold">{a.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{a.name}</p>
                      <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{a.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">{a.role}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Faol</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className={`rounded-xl p-5 max-w-lg ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
            <h3 className={`text-sm font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Kasalxona Sozlamalari</h3>
            <p className={`text-xs mb-4 ${dm ? "text-amber-400" : "text-amber-600"}`}>
              Demo rejim: bu bo'limdagi saqlash amallari serverga yuborilmaydi.
            </p>
            <div className="space-y-4">
              {[
                { label: "Kasalxona Nomi", value: hospital.name },
                { label: "Manzil", value: hospital.address },
                { label: "Telefon", value: hospital.phone },
              ].map((f, i) => (
                <div key={i}>
                  <label htmlFor={`hospital-settings-${i}`} className={`block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`}>{f.label}</label>
                  <input
                    id={`hospital-settings-${i}`}
                    aria-invalid={i === 0 ? Boolean(settingsErrors.name) : i === 1 ? Boolean(settingsErrors.address) : Boolean(settingsErrors.phone)}
                    aria-describedby={
                      i === 0 && settingsErrors.name
                        ? "hospital-settings-name-error"
                        : i === 1 && settingsErrors.address
                          ? "hospital-settings-address-error"
                          : i === 2 && settingsErrors.phone
                            ? "hospital-settings-phone-error"
                            : undefined
                    }
                    value={i === 0 ? settingsForm.name : i === 1 ? settingsForm.address : settingsForm.phone}
                    onChange={(e) => {
                      if (i === 0) {
                        setSettingsForm((prev) => ({ ...prev, name: e.target.value }));
                        if (settingsErrors.name) setSettingsErrors((prev) => ({ ...prev, name: undefined }));
                      } else if (i === 1) {
                        setSettingsForm((prev) => ({ ...prev, address: e.target.value }));
                        if (settingsErrors.address) setSettingsErrors((prev) => ({ ...prev, address: undefined }));
                      } else {
                        setSettingsForm((prev) => ({ ...prev, phone: e.target.value }));
                        if (settingsErrors.phone) setSettingsErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500"}`}
                  />
                </div>
              ))}
              {settingsErrors.name && <p id="hospital-settings-name-error" className="text-xs text-red-500">{settingsErrors.name}</p>}
              {settingsErrors.address && <p id="hospital-settings-address-error" className="text-xs text-red-500">{settingsErrors.address}</p>}
              {settingsErrors.phone && <p id="hospital-settings-phone-error" className="text-xs text-red-500">{settingsErrors.phone}</p>}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>Kasalxona holati</p>
                  <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>Faol/Nofaol qilish</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={demoStatus === "active"}
                  aria-label="Kasalxona holatini demo tarzda almashtirish"
                  onClick={() => {
                    setDemoStatus((prev) => (prev === "active" ? "inactive" : "active"));
                    showToast("Demo rejim: holat o'zgarishi lokal ko'rinishda.", "info");
                  }}
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    demoStatus === "active" ? "bg-emerald-500" : dm ? "bg-[#1E2A3A]" : "bg-gray-200"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-transform ${demoStatus === "active" ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`}></div>
                </button>
              </div>
              <button onClick={handleSaveSettings} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                Saqlash
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

function HospitalNotFoundContent() {
  const dm = useMainLayoutDarkMode();
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <i className={`ri-hospital-line text-4xl mb-4 ${dm ? "text-gray-600" : "text-gray-300"}`} />
      <h2 className={`text-lg font-semibold mb-1 ${dm ? "text-white" : "text-gray-900"}`}>Kasalxona topilmadi</h2>
      <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>ID: {id ?? "unknown"}</p>
      <button
        onClick={() => navigate("/hospitals")}
        className="mt-5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium cursor-pointer whitespace-nowrap"
      >
        Kasalxonalar ro'yxatiga qaytish
      </button>
    </div>
  );
}

export default function HospitalDetailPage() {
  return (
    <MainLayout title="Kasalxona tafsiloti">
      <HospitalDetailContent />
    </MainLayout>
  );
}
