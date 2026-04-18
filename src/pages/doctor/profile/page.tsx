import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";

export default function DocProfilePage() {
  const navigate = useNavigate();
  const [qrCopied, setQrCopied] = useState(false);

  const doctor = {
    id: "doc-001",
    name: "Dr. Alisher Karimov",
    specialty: "Kardiologiya",
    phone: "+998 90 123 45 67",
    email: "a.karimov@medcore.uz",
    experience: "8 yil",
    hospital: "Toshkent Klinikasi",
    joinDate: "2021-03-15",
    totalPatients: 1240,
    todayPatients: 7,
    rating: 4.9,
    bio: "Yurak-qon tomir kasalliklari bo'yicha mutaxassis. Toshkent Tibbiyot Akademiyasini tamomlagan. Kardiologiya sohasida 8 yillik tajribaga ega.",
    checkinUrl: "/checkin?doctor_id=doc-001",
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${doctor.checkinUrl}`);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  const qrCells = Array.from({ length: 21 }, (_, row) =>
    Array.from({ length: 21 }, (_, col) => {
      const isCorner = (row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7);
      const isInnerCorner =
        (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
        (row >= 2 && row <= 4 && col >= 16 && col <= 18) ||
        (row >= 16 && row <= 18 && col >= 2 && col <= 4);
      const isBorder =
        ((row === 0 || row === 6) && col <= 6) ||
        ((row === 0 || row === 6) && col >= 14) ||
        ((row === 14 || row === 20) && col <= 6) ||
        ((col === 0 || col === 6) && row <= 6) ||
        ((col === 14 || col === 20) && row <= 6) ||
        ((col === 0 || col === 6) && row >= 14);
      const isData = (row + col + row * col) % 3 === 0 && !isCorner;
      return isInnerCorner || isBorder || isData;
    })
  );

  return (
    <DocLayout title="Profil">
      <div className="max-w-4xl mx-auto space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          Orqaga
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">AK</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                  <p className="text-violet-600 font-medium">{doctor.specialty}</p>
                  <p className="text-sm text-gray-500 mt-1">{doctor.hospital}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 flex items-center justify-center">
                        <i
                          className={`ri-star-fill text-sm ${i < Math.floor(doctor.rating) ? "text-amber-400" : "text-gray-200"}`}
                        ></i>
                      </div>
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">{doctor.rating}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/doctor/settings")}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  <i className="ri-edit-2-line text-base"></i>
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>

              <div className="grid grid-cols-2 gap-4 mt-5">
                {[
                  { icon: "ri-phone-line", label: "Telefon", value: doctor.phone },
                  { icon: "ri-mail-line", label: "Email", value: doctor.email },
                  { icon: "ri-time-line", label: "Tajriba", value: doctor.experience },
                  { icon: "ri-calendar-line", label: "Qo'shilgan", value: doctor.joinDate },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
                      <i className={`${item.icon} text-gray-500 text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Jami bemorlar", value: doctor.totalPatients, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Bugun", value: doctor.todayPatients, icon: "ri-calendar-check-line", color: "text-green-600", bg: "bg-green-50" },
                { label: "Reyting", value: doctor.rating, icon: "ri-star-line", color: "text-amber-600", bg: "bg-amber-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg} mx-auto mb-2`}>
                    <i className={`${stat.icon} text-lg ${stat.color}`}></i>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-1">QR Kod</h3>
              <p className="text-xs text-gray-500 mb-4">Bemorlar bu QR orqali navbatga yoziladi</p>

              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white border-2 border-gray-200 rounded-xl inline-block">
                  <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(21, 10px)` }}>
                    {qrCells.map((row, ri) =>
                      row.map((cell, ci) => (
                        <div key={`${ri}-${ci}`} className={`w-2.5 h-2.5 ${cell ? "bg-gray-900" : "bg-white"}`}></div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500 mb-4 break-all">
                {window.location.origin}
                {doctor.checkinUrl}
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    qrCopied
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i className={`${qrCopied ? "ri-checkbox-circle-line" : "ri-link"} text-sm`}></i>
                  {qrCopied ? "Nusxalandi!" : "Havolani nusxalash"}
                </button>
                <button
                  onClick={() => navigate(doctor.checkinUrl)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-external-link-line text-sm"></i>
                  Check-in sahifasini ko'rish
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Tezkor havolalar</h4>
              <div className="space-y-2">
                {[
                  { label: "Bugungi bemorlar", path: "/doctor/patients", icon: "ri-user-add-line" },
                  { label: "Tahlil", path: "/doctor/analytics", icon: "ri-bar-chart-2-line" },
                  { label: "Sozlamalar", path: "/doctor/settings", icon: "ri-settings-3-line" },
                ].map((link, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(link.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 cursor-pointer transition-colors text-left"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`${link.icon} text-violet-500`}></i>
                    </div>
                    {link.label}
                    <i className="ri-arrow-right-s-line ml-auto text-gray-400"></i>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocLayout>
  );
}
