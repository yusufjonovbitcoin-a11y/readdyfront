import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQrPngDataUrl } from "@/hooks/useQrPngDataUrl";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  getDoctorAnalytics,
  getDoctorById,
  getDoctorPatients,
} from "@/api/doctor";
import type {
  DoctorAnalyticsDto,
  DoctorDto,
  DoctorPatientDto,
} from "@/api/types/doctor.types";
import { copyTextWithFallback } from "@/utils/clipboard";

type TabType = 'overview' | 'patients' | 'analytics' | 'qr';
const VALID_TABS = ["overview", "patients", "analytics", "qr"] as const;

function isValidTab(value: string | null): value is TabType {
  return value !== null && (VALID_TABS as readonly string[]).includes(value);
}

function toAbsoluteCheckinUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (typeof window === "undefined") return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${window.location.origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function QRCodeDisplay({ doctorId, doctorName, qrUrl, darkMode }: { doctorId: string; doctorName: string; qrUrl: string; darkMode: boolean }) {
  const resolvedQrUrl = useMemo(
    () => toAbsoluteCheckinUrl(qrUrl),
    [qrUrl],
  );
  const qrSize = 180;
  const { dataUrl, loading } = useQrPngDataUrl(resolvedQrUrl, qrSize);
  const [copyToast, setCopyToast] = useState<{ message: string; isError: boolean } | null>(null);

  const showCopyToast = (message: string, isError = false) => {
    setCopyToast({ message, isError });
    window.setTimeout(() => setCopyToast(null), 2200);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${doctorId}.png`;
    a.click();
  };

  const handleCopy = () => {
    if (!resolvedQrUrl) return;
    void (async () => {
      const copied = await copyTextWithFallback(resolvedQrUrl);
      showCopyToast(copied ? "Nusxalandi" : "Nusxalab bo'lmadi", !copied);
    })();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {copyToast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
            copyToast.isError ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {copyToast.message}
        </div>
      )}
      <div
        className={`rounded-2xl p-6 ${darkMode ? "bg-white" : "border border-gray-100 bg-white"}`}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt=""
            width={qrSize}
            height={qrSize}
            className="block max-h-full max-w-full select-none rounded-sm"
            draggable={false}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[11px] text-gray-500"
            style={{ width: qrSize, height: qrSize }}
            role="status"
            aria-live="polite"
          >
            {loading ? "Yuklanmoqda…" : "QR yaratilmadi"}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{doctorName}</p>
        <p className={`text-xs mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{resolvedQrUrl}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="h-9 px-4 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line text-sm"></i>
            Yuklab olish
          </button>
          <button
            onClick={handleCopy}
            className={`h-9 px-4 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            <i className="ri-links-line text-sm"></i>
            Nusxa olish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HADoctorDetailPage() {
  return (
    <HALayout title="Shifokor tafsiloti">
      <HADoctorDetailContent />
    </HALayout>
  );
}

export function HADoctorDetailContent() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const darkMode = useHospitalAdminDarkMode();
  const rawTab = searchParams.get("tab");
  const activeTab: TabType = isValidTab(rawTab) ? rawTab : "overview";
  const [doctor, setDoctor] = useState<DoctorDto | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatientDto[]>([]);
  const [dailyData, setDailyData] = useState<DoctorAnalyticsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setDoctor(null);
      setDoctorPatients([]);
      setDailyData([]);
      setLoading(false);
      setLoadError("Shifokor identifikatori topilmadi.");
      return () => {
        mounted = false;
      };
    }
    void (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const doctorResponse = await getDoctorById(id);
        if (!doctorResponse) {
          throw new Error("Doctor not found");
        }
        const [patientsResponse, analyticsResponse] = await Promise.all([
          getDoctorPatients().catch(() => [] as DoctorPatientDto[]),
          getDoctorAnalytics().catch(() => [] as DoctorAnalyticsDto[]),
        ]);
        if (!mounted) return;
        setDoctor(doctorResponse);
        setDoctorPatients(
          patientsResponse.filter((patient) => patient.doctorId === id),
        );
        setDailyData(analyticsResponse);
      } catch {
        if (!mounted) return;
        setLoadError("Shifokor tafsilotlarini yuklashda xatolik yuz berdi.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (isValidTab(rawTab)) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "overview");
    setSearchParams(nextParams, { replace: true });
  }, [rawTab, searchParams, setSearchParams]);

  const handleTabChange = (nextTab: TabType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  const normalizedPatients = useMemo(
    () =>
      doctorPatients.map((patient) => ({
        ...patient,
        lastVisit: patient.date,
        visitCount: patient.consultationDuration > 0 ? 1 : 0,
        statusLabel:
          patient.status === "queue"
            ? "Navbatda"
            : patient.status === "in_progress"
              ? "Jarayonda"
              : patient.status === "completed"
                ? "Yakunlangan"
                : "Arxiv",
        statusTone:
          patient.status === "queue"
            ? "bg-indigo-50 text-indigo-700"
            : patient.status === "in_progress"
              ? "bg-blue-50 text-blue-700"
              : patient.status === "completed"
                ? "bg-teal-50 text-teal-700"
                : "bg-gray-100 text-gray-600",
      })),
    [doctorPatients],
  );

  const max = Math.max(...dailyData.map((d) => d.patients), 1);

  if (loading) {
    return (
      <div className="text-center py-20">
        <i className="ri-loader-4-line always-spin text-2xl text-teal-500" />
        <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Shifokor tafsilotlari yuklanmoqda...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-20">
        <p className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"}`}>{loadError}</p>
        <button
          type="button"
          onClick={() => navigate("/hospital-admin/doctors")}
          className="mt-4 text-teal-600 text-sm cursor-pointer"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Shifokor topilmadi</p>
        <button onClick={() => navigate('/hospital-admin/doctors')} className="mt-4 text-teal-600 text-sm cursor-pointer">Orqaga qaytish</button>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Umumiy', icon: 'ri-user-line' },
    { key: 'patients', label: 'Bemorlar', icon: 'ri-user-heart-line' },
    { key: 'analytics', label: 'Tahlil', icon: 'ri-bar-chart-line' },
    { key: 'qr', label: 'QR Kod', icon: 'ri-qr-code-line' },
  ];

  return (
      <div className="space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate('/hospital-admin/doctors')}
          className={`flex items-center gap-2 text-sm cursor-pointer ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}
        >
          <i className="ri-arrow-left-line text-base"></i>
          Shifokorlar ro'yxatiga qaytish
        </button>

        {/* Profile header */}
        <div className={`rounded-xl p-6 ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{doctor.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doctor.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                  {doctor.status === 'active' ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              <p className="text-teal-600 font-medium text-sm mt-0.5">{doctor.specialty}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-phone-line text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
                  </div>
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-mail-line text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
                  </div>
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-star-fill text-amber-400 text-xs"></i>
                  </div>
                  <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doctor.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className={`text-center px-4 py-3 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}>
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{doctor.todayPatients}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bugun</p>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}>
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{doctor.totalPatients.toLocaleString()}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Jami</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? darkMode ? "bg-[#141824] text-teal-400" : "bg-white text-teal-600"
                  : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className={`rounded-xl p-5 ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Shaxsiy ma'lumotlar</h3>
              <div className="space-y-3">
                {[
                  { label: 'To\'liq ism', value: doctor.name },
                  { label: 'Mutaxassislik', value: doctor.specialty },
                  { label: 'Telefon', value: doctor.phone },
                  { label: 'Email', value: doctor.email },
                  { label: 'Ishga kirgan sana', value: doctor.joinDate },
                  { label: 'Holat', value: doctor.status === 'active' ? 'Faol' : 'Nofaol' },
                ].map(item => (
                  <div key={item.label} className={`flex items-center justify-between py-2 border-b last:border-0 ${darkMode ? "border-[#1E2130]" : "border-gray-50"}`}>
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                    <span className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-xl p-5 ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Statistika</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Bugungi bemorlar', value: doctor.todayPatients, color: 'text-teal-600' },
                  { label: 'Jami bemorlar', value: doctor.totalPatients.toLocaleString(), color: 'text-indigo-600' },
                  { label: 'Reyting', value: `${doctor.rating} / 5.0`, color: 'text-amber-600' },
                  { label: 'Haftalik o\'rtacha', value: Math.round(doctor.totalPatients / 52), color: 'text-emerald-600' },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}>
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                    <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
            <div className={`px-5 py-4 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Bemorlar ({doctorPatients.length})
              </h3>
            </div>
            <table className="w-full">
              <caption className="sr-only">Shifokor bemorlari ro'yxati</caption>
              <thead>
                <tr className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <th scope="col" className="text-left px-5 py-3 font-medium">Bemor</th>
                  <th scope="col" className="text-left px-5 py-3 font-medium">Tashxis</th>
                  <th scope="col" className="text-left px-5 py-3 font-medium">So'nggi tashrif</th>
                  <th scope="col" className="text-left px-5 py-3 font-medium">Tashriflar soni</th>
                  <th scope="col" className="text-left px-5 py-3 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody>
                {normalizedPatients.map(p => (
                  <tr key={p.id} className={`border-t ${darkMode ? "border-[#1E2130]" : "border-gray-50"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-teal-700 text-xs font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
                    <td className={`px-5 py-3 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.lastVisit}</td>
                    <td className={`px-5 py-3 text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{p.visitCount}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.statusTone}`}>
                        {p.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
                {doctorPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`px-5 py-10 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Bemorlar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className={`rounded-xl p-5 ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Haftalik bemor oqimi</h3>
              <div className="flex items-end gap-2 h-32">
                {dailyData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{d.patients}</span>
                    <div
                      className="w-full rounded-t-md bg-teal-500"
                      style={{ height: `${(d.patients / max) * 96}px` }}
                    ></div>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-xl p-5 ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Ishlash ko'rsatkichlari</h3>
              <div className="space-y-4">
                {[
                  { label: 'Bugungi bemorlar', value: doctor.todayPatients, max: 30, color: 'bg-teal-500' },
                  { label: 'Reyting', value: doctor.rating * 10, max: 50, color: 'bg-amber-500' },
                  { label: 'Haftalik o\'rtacha', value: Math.round(doctor.totalPatients / 52), max: 100, color: 'bg-indigo-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                      <span className={`text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{item.label === 'Reyting' ? doctor.rating : item.value}</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className={`rounded-xl p-8 flex justify-center ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
            <QRCodeDisplay doctorId={doctor.id} doctorName={doctor.name} qrUrl={doctor.qrCode} darkMode={darkMode} />
          </div>
        )}
      </div>
  );
}
