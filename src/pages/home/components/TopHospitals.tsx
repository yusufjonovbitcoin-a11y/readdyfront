import { useMemo, useState } from "react";
import { mockTopHospitals } from "@/mocks/analytics";
import { mockHospitals } from "@/mocks/hospitals";

interface TopHospitalsProps {
  darkMode: boolean;
}

function countByViloyat() {
  const map = new Map<string, number>();
  for (const h of mockHospitals) {
    const v = h.viloyat;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([viloyat, count]) => ({ viloyat, count }))
    .sort((a, b) => a.viloyat.localeCompare(b.viloyat, "uz"));
}

export default function TopHospitals({ darkMode }: TopHospitalsProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedViloyat, setSelectedViloyat] = useState<string | null>(null);
  const byViloyat = useMemo(countByViloyat, []);
  const totalHospitals = mockHospitals.length;

  const hospitalsInViloyat = useMemo(() => {
    if (!selectedViloyat) return [];
    return mockHospitals.filter((h) => h.viloyat === selectedViloyat);
  }, [selectedViloyat]);

  function openPanel() {
    setSelectedViloyat(null);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setSelectedViloyat(null);
  }

  return (
    <>
      <div className={`rounded-xl p-5 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Top Kasalxonalar</h3>
          <button
            type="button"
            onClick={openPanel}
            className={`text-sm ${darkMode ? "text-emerald-400" : "text-emerald-600"} cursor-pointer hover:underline`}
          >
            Barchasini ko'rish
          </button>
        </div>
        <div className="space-y-4">
          {mockTopHospitals.map((h, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{i + 1}</span>
                  <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{h.name}</span>
                </div>
                <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{h.patients}</span>
              </div>
              <div className={`h-1.5 rounded-full ${darkMode ? "bg-[#0F1117]" : "bg-gray-100"}`}>
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(h.patients / h.max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
            aria-hidden="true"
            onClick={closePanel}
          />
          <div
            className={`fixed right-0 top-0 z-[70] h-full w-full max-w-md shadow-2xl flex flex-col ${
              darkMode ? "bg-[#141824] border-l border-[#1E2130]" : "bg-white border-l border-gray-100"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viloyat-panel-title"
          >
            <div className={`flex items-center gap-2 px-5 py-4 border-b shrink-0 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              {selectedViloyat ? (
                <button
                  type="button"
                  onClick={() => setSelectedViloyat(null)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer shrink-0 transition-colors ${
                    darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                  aria-label="Viloyatlar ro'yxatiga qaytish"
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
              ) : null}
              <div className="flex-1 min-w-0">
                <h2 id="viloyat-panel-title" className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedViloyat ?? "Viloyatlar bo'yicha kasalxonalar"}
                </h2>
                <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {selectedViloyat
                    ? `${hospitalsInViloyat.length} ta kasalxona`
                    : `Jami ${totalHospitals} ta kasalxona`}
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className={`w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer shrink-0 transition-colors ${
                  darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
                aria-label="Yopish"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {selectedViloyat ? (
                <ul className="space-y-2">
                  {hospitalsInViloyat.map((h) => (
                    <li
                      key={h.id}
                      className={`rounded-xl px-4 py-3 ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.name}</p>
                          <p className={`text-sm mt-0.5 line-clamp-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{h.address}</p>
                          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <span className="tabular-nums">{h.dailyPatients}</span> bemor/kun ·{" "}
                            <span className="tabular-nums">{h.doctorsCount}</span> shifokor
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-md ${
                            h.status === "active"
                              ? darkMode
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-emerald-50 text-emerald-700"
                              : darkMode
                                ? "bg-gray-500/20 text-gray-400"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {h.status === "active" ? "Faol" : "Nofaol"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {byViloyat.map(({ viloyat, count }) => (
                    <li key={viloyat}>
                      <button
                        type="button"
                        onClick={() => setSelectedViloyat(viloyat)}
                        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left cursor-pointer transition-colors ${
                          darkMode ? "bg-[#1A2235] hover:bg-[#1f2a42]" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <i className="ri-map-pin-line text-emerald-400 text-sm"></i>
                          </div>
                          <span className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{viloyat}</span>
                        </div>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                              darkMode ? "bg-[#0F1117] text-emerald-400" : "bg-white text-emerald-600 shadow-sm"
                            }`}
                          >
                            {count}
                          </span>
                          <i className={`ri-arrow-right-s-line text-lg ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
