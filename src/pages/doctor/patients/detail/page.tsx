import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { docPatients, type RiskLevel } from "@/mocks/doc_patients";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: string; desc: string }> = {
  low: {
    label: "Past Xavf",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "ri-shield-check-line",
    desc: "Bemor holati barqaror. Oddiy ko'rik va kuzatuv tavsiya etiladi.",
  },
  medium: {
    label: "O'rta Xavf",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "ri-shield-line",
    desc: "Bir nechta xavf omillari aniqlandi. Qo'shimcha tekshiruvlar tavsiya etiladi.",
  },
  high: {
    label: "Yuqori Xavf",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "ri-shield-flash-line",
    desc: "Jiddiy xavf omillari mavjud. Zudlik bilan tibbiy aralashuv talab etiladi.",
  },
  critical: {
    label: "Kritik Xavf",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "ri-alarm-warning-line",
    desc: "SHOSHILINCH! Darhol tibbiy yordam ko'rsatilishi shart.",
  },
};

const aiConditions: Record<RiskLevel, string[]> = {
  low: ["Umumiy charchoq", "Stress reaktsiyasi", "Vitamin yetishmovchiligi"],
  medium: ["Arterial gipertenziya", "Vegetovascular distoniya", "Surunkali stress"],
  high: ["Yurak ishemik kasalligi", "Gipertenziv kriz", "Metabolik sindrom"],
  critical: ["Miokard infarkti (shubhali)", "O'tkir koronar sindrom", "Gipertenziv favqulodda holat"],
};

const aiActions: Record<RiskLevel, string[]> = {
  low: ["Qon tahlili buyurish", "Umumiy ko'rik o'tkazish", "1 oydan keyin qayta ko'rik"],
  medium: ["EKG o'tkazish", "Qon bosimini kuzatish", "Kardiolog konsultatsiyasi", "2 haftadan keyin qayta ko'rik"],
  high: ["Darhol EKG va EXO-KG", "Kardiolog konsultatsiyasi (bugun)", "Qon tahlillari (troponin, BNP)", "Kasalxonaga yotqizish ko'rib chiqilsin"],
  critical: ["DARHOL reanimatsiya bo'limiga", "Troponin, D-dimer tahlillari", "EKG monitoring", "Kardiolog va reanimatolog chaqirish"],
};

export default function DocPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = docPatients.find((p) => p.id === id);

  const [notes, setNotes] = useState(patient?.notes || '');
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  if (!patient) {
    return (
      <DocLayout title="Bemor topilmadi">
        <div className="flex flex-col items-center justify-center py-20">
          <i className="ri-user-unfollow-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Bemor ma'lumotlari topilmadi</p>
          <button onClick={() => navigate('/doctor/patients')} className="mt-4 text-violet-600 text-sm cursor-pointer">
            Orqaga qaytish
          </button>
        </div>
      </DocLayout>
    );
  }

  const risk = riskConfig[patient.riskLevel];
  const conditions = aiConditions[patient.riskLevel];
  const actions = aiActions[patient.riskLevel];

  const handleAction = (action: string) => {
    setShowConfirm(action);
  };

  const confirmAction = () => {
    setActionDone(showConfirm);
    setShowConfirm(null);
  };

  return (
    <DocLayout title="Bemor Tafsiloti">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/patients')}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-line text-base"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-sm text-gray-500">{patient.age} yosh • {patient.gender === 'male' ? 'Erkak' : 'Ayol'} • {patient.phone}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-semibold border ${risk.bg} ${risk.color} ${risk.border}`}>
              <i className={`${risk.icon} text-sm`}></i>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Action Done Banner */}
        {actionDone && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
              <i className="ri-checkbox-circle-line text-green-600"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">
                {actionDone === 'diagnosed' && 'Bemor tashxis qo\'yildi deb belgilandi'}
                {actionDone === 'test' && 'Bemor tahlilga yuborildi'}
                {actionDone === 'rejected' && 'Bemor rad etildi'}
              </p>
              <p className="text-xs text-green-600">Holat muvaffaqiyatli yangilandi</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Answers Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-questionnaire-line text-violet-600"></i>
                </div>
                Javoblar Tahlili
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Symptoms */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100">
                      <i className="ri-stethoscope-line text-blue-600 text-xs"></i>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Simptomlar</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{patient.symptoms.length}</span>
                  </div>
                  {patient.symptoms.length > 0 ? (
                    <div className="space-y-2">
                      {patient.symptoms.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <i className="ri-checkbox-circle-fill text-blue-500 text-sm"></i>
                          </div>
                          {s}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Simptom aniqlanmadi</p>
                  )}
                </div>

                {/* Risk Factors */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100">
                      <i className="ri-error-warning-line text-red-600 text-xs"></i>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Xavf Omillari</span>
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{patient.riskFactors.length}</span>
                  </div>
                  {patient.riskFactors.length > 0 ? (
                    <div className="space-y-2">
                      {patient.riskFactors.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <i className="ri-close-circle-fill text-red-500 text-sm"></i>
                          </div>
                          {r}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Xavf omili aniqlanmadi</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className={`rounded-xl border p-5 ${risk.bg} ${risk.border}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/80">
                    <i className="ri-robot-line text-violet-600 text-base"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">AI Tavsiya</h3>
                    <p className="text-xs text-gray-500">Sun'iy intellekt tahlili</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${risk.bg} ${risk.color} ${risk.border}`}>
                  <i className={`${risk.icon} mr-1`}></i>
                  {risk.label}
                </span>
              </div>

              {/* Disclaimer */}
              <div className="bg-white/70 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-amber-600 text-sm"></i>
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  AI tavsiyasi tibbiy tashxis emas. Yakuniy qaror faqat shifokor tomonidan qabul qilinadi.
                </p>
              </div>

              <p className="text-sm text-gray-700 mb-4">{risk.desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Mumkin bo'lgan holatlar</p>
                  <div className="space-y-1.5">
                    {conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <i className="ri-arrow-right-s-line text-violet-500"></i>
                        </div>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tavsiya etilgan harakatlar</p>
                  <div className="space-y-1.5">
                    {actions.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <i className="ri-checkbox-circle-line text-green-500"></i>
                        </div>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Notes */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-edit-2-line text-violet-600"></i>
                </div>
                Shifokor Izohlari
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bemor haqida izoh yozing..."
                rows={4}
                maxLength={500}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400 resize-none text-gray-700 placeholder-gray-400"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{notes.length}/500 belgi</span>
                <button className="text-xs text-violet-600 font-medium cursor-pointer hover:text-violet-700 whitespace-nowrap">
                  Saqlash
                </button>
              </div>
            </div>
          </div>

          {/* Right Column — Doctor Actions */}
          <div className="space-y-4">
            {/* Patient Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Bemor Ma'lumoti</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                    <i className="ri-user-line text-gray-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Ism</p>
                    <p className="text-sm font-medium text-gray-800">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                    <i className="ri-phone-line text-gray-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Telefon</p>
                    <p className="text-sm font-medium text-gray-800">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                    <i className="ri-calendar-line text-gray-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sana</p>
                    <p className="text-sm font-medium text-gray-800">{patient.date}</p>
                  </div>
                </div>
                {patient.consultationDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                      <i className="ri-timer-line text-gray-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ko'rik davomiyligi</p>
                      <p className="text-sm font-medium text-gray-800">{patient.consultationDuration} daqiqa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Actions */}
            {!actionDone && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Shifokor Amallari</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction('diagnosed')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-checkbox-circle-line text-green-600"></i>
                    </div>
                    Tashxis qo'yildi
                  </button>
                  <button
                    onClick={() => handleAction('test')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-flask-line text-blue-600"></i>
                    </div>
                    Tahlilga yuborish
                  </button>
                  <button
                    onClick={() => handleAction('rejected')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-close-circle-line text-red-600"></i>
                    </div>
                    Rad etish
                  </button>
                </div>
              </div>
            )}

            {/* Flow indicator */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Bemor Oqimi</h4>
              <div className="space-y-2">
                {[
                  { label: 'Navbat', icon: 'ri-time-line', done: true },
                  { label: 'Jarayonda', icon: 'ri-loader-4-line', done: patient.status === 'in_progress' || patient.status === 'completed' || patient.status === 'history' },
                  { label: 'Tugallandi', icon: 'ri-checkbox-circle-line', done: patient.status === 'completed' || patient.status === 'history' },
                  { label: 'Tarix', icon: 'ri-history-line', done: patient.status === 'history' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                      step.done ? 'bg-violet-100' : 'bg-gray-100'
                    }`}>
                      <i className={`${step.icon} text-xs ${step.done ? 'text-violet-600' : 'text-gray-400'}`}></i>
                    </div>
                    <span className={`text-sm ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                    {step.done && <i className="ri-check-line text-xs text-violet-500 ml-auto"></i>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                showConfirm === 'rejected' ? 'bg-red-100' : showConfirm === 'test' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <i className={`text-lg ${
                  showConfirm === 'rejected' ? 'ri-close-circle-line text-red-600' :
                  showConfirm === 'test' ? 'ri-flask-line text-blue-600' :
                  'ri-checkbox-circle-line text-green-600'
                }`}></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Tasdiqlash</h3>
                <p className="text-sm text-gray-500">
                  {showConfirm === 'diagnosed' && 'Tashxis qo\'yildi deb belgilansinmi?'}
                  {showConfirm === 'test' && 'Bemor tahlilga yuborilsinmi?'}
                  {showConfirm === 'rejected' && 'Bemor rad etilsinmi?'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  showConfirm === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                  showConfirm === 'test' ? 'bg-blue-500 hover:bg-blue-600' :
                  'bg-green-500 hover:bg-green-600'
                }`}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </DocLayout>
  );
}
