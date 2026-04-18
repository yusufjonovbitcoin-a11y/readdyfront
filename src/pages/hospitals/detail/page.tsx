import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { mockHospitals, mockHospitalDetail } from "@/mocks/hospitals";
import { mockDoctors } from "@/mocks/doctors";
import { mockPatients } from "@/mocks/patients";
import { mockDailyData } from "@/mocks/analytics";

type Tab = "overview" | "doctors" | "admins" | "patients" | "analytics" | "settings";

function HospitalDetailContent() {
  const dm = useMainLayoutDarkMode();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [patientSearch, setPatientSearch] = useState("");
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: "", specialty: "", phone: "" });

  const hospital = mockHospitals.find((h) => h.id === id) || mockHospitals[0];
  const detail = mockHospitalDetail;
  const doctors = mockDoctors.filter((d) => d.hospitalId === (id || "1"));
  const patients = mockPatients.filter((p) => p.hospitalId === (id || "1")).filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Umumiy", icon: "ri-information-line" },
    { key: "doctors", label: "Shifokorlar", icon: "ri-stethoscope-line" },
    { key: "admins", label: "Administratorlar", icon: "ri-user-settings-line" },
    { key: "patients", label: "Bemorlar", icon: "ri-user-heart-line" },
    { key: "analytics", label: "Tahlil", icon: "ri-bar-chart-2-line" },
    { key: "settings", label: "Sozlamalar", icon: "ri-settings-3-line" },
  ];

  const maxPatients = Math.max(...mockDailyData.map((d) => d.patients));

  return (
      <div className="space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/hospitals")} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${dm ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-white text-gray-400 hover:text-gray-700"}`}>
            <i className="ri-arrow-left-line text-sm"></i>
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
                  { label: "Yangi Bemorlar", value: detail.todayStats.newPatients, color: "text-emerald-400", icon: "ri-user-add-line" },
                  { label: "Uchrashuvlar", value: detail.todayStats.appointments, color: "text-blue-400", icon: "ri-calendar-check-line" },
                  { label: "Yakunlangan", value: detail.todayStats.completed, color: "text-violet-400", icon: "ri-checkbox-circle-line" },
                  { label: "Bekor qilingan", value: detail.todayStats.cancelled, color: "text-red-400", icon: "ri-close-circle-line" },
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
            <div className="flex items-center justify-between">
              <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>{doctors.length} ta shifokor</p>
              <button onClick={() => setShowAddDoctor(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                <i className="ri-add-line"></i> Shifokor qo'shish
              </button>
            </div>

            {showAddDoctor && (
              <div className={`rounded-xl p-5 border ${dm ? "bg-[#1A2235] border-emerald-500/30" : "bg-white border-emerald-200"}`}>
                <h4 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Yangi Shifokor</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "name", placeholder: "To'liq ism" },
                    { key: "specialty", placeholder: "Mutaxassislik" },
                    { key: "phone", placeholder: "Telefon" },
                  ].map((f) => (
                    <input
                      key={f.key}
                      className={`px-3 py-2 rounded-lg text-sm outline-none ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"}`}
                      placeholder={f.placeholder}
                      value={doctorForm[f.key as keyof typeof doctorForm]}
                      onChange={(e) => setDoctorForm({ ...doctorForm, [f.key]: e.target.value })}
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowAddDoctor(false)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${dm ? "bg-[#0F1117] text-gray-400" : "bg-gray-100 text-gray-600"}`}>Bekor</button>
                  <button onClick={() => setShowAddDoctor(false)} className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white cursor-pointer whitespace-nowrap hover:bg-emerald-600">Saqlash</button>
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
                      <p className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{d.patientsToday} bemor</p>
                    </div>
                    <div>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Tajriba</p>
                      <p className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{d.experience} yil</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg max-w-xs ${dm ? "bg-[#1A2235]" : "bg-white border border-gray-200"}`}>
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
              <table className="w-full">
                <thead>
                  <tr className={dm ? "bg-[#0F1117]" : "bg-gray-50"}>
                    {["Ism", "Telefon", "Tug'ilgan sana", "Jins", "Shifokor", "So'nggi tashrif", "Tashxis", "Holat"].map((col) => (
                      <th key={col} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => (
                    <tr key={p.id} className={`border-t ${dm ? "border-[#1E2130]" : "border-gray-50"} ${i % 2 === 0 ? dm ? "bg-[#1A2235]" : "" : dm ? "bg-[#161D2E]" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                      </td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.phone}</td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.dob}</td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.gender}</td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>
                        {mockDoctors.find((d) => d.id === p.doctorId)?.name || "-"}
                      </td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.lastVisit}</td>
                      <td className={`px-4 py-3 text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
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
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Kunlik Tashriflar (So'nggi 7 kun)</h3>
              <div className="flex items-end gap-2 h-40">
                {mockDailyData.map((d, i) => (
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
              <button className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
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
            <div className="space-y-4">
              {[
                { label: "Kasalxona Nomi", value: hospital.name },
                { label: "Manzil", value: hospital.address },
                { label: "Telefon", value: hospital.phone },
              ].map((f, i) => (
                <div key={i}>
                  <label className={`block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`}>{f.label}</label>
                  <input
                    defaultValue={f.value}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500"}`}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>Kasalxona holati</p>
                  <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>Faol/Nofaol qilish</p>
                </div>
                <div className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${hospital.status === "active" ? "bg-emerald-500" : dm ? "bg-[#1E2A3A]" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-transform ${hospital.status === "active" ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`}></div>
                </div>
              </div>
              <button className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                Saqlash
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

export default function HospitalDetailPage() {
  const { id } = useParams();
  const hospital = mockHospitals.find((h) => h.id === id) || mockHospitals[0];
  return (
    <MainLayout title={hospital.name}>
      <HospitalDetailContent />
    </MainLayout>
  );
}
