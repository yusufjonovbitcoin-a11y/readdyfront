import { useState, useEffect } from 'react';

type ResultCase = 'queue' | 'busy' | 'info';

interface ResultStepProps {
  phone: string;
  doctorName: string;
  doctorSpecialty: string;
  answers: Record<string, string | string[]>;
  usedAI: boolean;
  onRestart: () => void;
}

function getResultCase(answers: Record<string, string | string[]>): ResultCase {
  const hasHighRisk = answers['q4'] === 'yes' || answers['q8'] === 'yes' || answers['q1'] === 'Ko\'krak og\'rig\'i';
  if (hasHighRisk) return 'queue';
  const rand = Math.random();
  if (rand < 0.6) return 'queue';
  if (rand < 0.8) return 'busy';
  return 'info';
}

function getRiskLevel(answers: Record<string, string | string[]>): 'low' | 'medium' | 'high' | 'critical' {
  let score = 0;
  if (answers['q4'] === 'yes') score += 1;
  if (answers['q8'] === 'yes') score += 2;
  if (answers['q1'] === 'Ko\'krak og\'rig\'i') score += 2;
  if (answers['q11'] === 'yes') score += 2;
  if (answers['q15'] === 'yes') score += 1;
  return score >= 5 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low';
}

const riskConfig = {
  low: { label: 'Past xavf', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  medium: { label: "O'rta xavf", color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: 'Yuqori xavf', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { label: 'Kritik xavf', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function ResultStep({ phone, doctorName, doctorSpecialty, answers, usedAI, onRestart }: ResultStepProps) {
  const [resultCase] = useState<ResultCase>(() => getResultCase(answers));
  const [queueNumber] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [waitTime] = useState(() => queueNumber * 12 + Math.floor(Math.random() * 5));
  const [notifSent, setNotifSent] = useState(false);
  const [countdown, setCountdown] = useState(waitTime * 60);
  const riskLevel = getRiskLevel(answers);
  const risk = riskConfig[riskLevel];

  useEffect(() => {
    if (resultCase !== 'queue') return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resultCase]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNotify = () => {
    setNotifSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* CASE 1: Queue available */}
        {resultCase === 'queue' && (
          <>
            <div className="text-center mb-6">
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-200 mx-auto">
                  <span className="text-3xl font-black text-white">#{queueNumber}</span>
                </div>
                {(riskLevel === 'high' || riskLevel === 'critical') && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center border-2 border-white">
                    <i className="ri-alarm-warning-line text-white text-xs"></i>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">Navbatingiz qabul qilindi!</h2>
              <p className="text-sm text-gray-500">Siz navbatga muvaffaqiyatli yozildingiz</p>
            </div>

            {/* Risk badge */}
            {(riskLevel === 'high' || riskLevel === 'critical') && (
              <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${risk.bg} ${risk.border}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white flex-shrink-0">
                  <i className={`ri-alarm-warning-line ${risk.color} text-base`}></i>
                </div>
                <div>
                  <p className={`text-xs font-bold ${risk.color}`}>{risk.label} aniqlandi</p>
                  <p className="text-xs text-gray-500">Shifokor siz bilan tezroq ko'rishadi</p>
                </div>
              </div>
            )}

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-teal-50 rounded-xl">
                  <p className="text-2xl font-black text-teal-600">#{queueNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">Navbat raqami</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-black text-emerald-600">{waitTime}</p>
                  <p className="text-xs text-gray-500 mt-1">Daqiqa kutish</p>
                </div>
              </div>

              {/* Countdown */}
              <div className="text-center py-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Taxminiy kutish vaqti</p>
                <p className="text-3xl font-mono font-black text-gray-900">{formatTime(countdown)}</p>
              </div>

              <div className="border-t border-gray-50 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Shifokor</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Bo'lim</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorSpecialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Telefon</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Sana</span>
                  <span className="text-xs font-semibold text-gray-900">{new Date().toLocaleDateString('uz-UZ')}</span>
                </div>
              </div>
            </div>

            {/* Notification */}
            {!notifSent ? (
              <button
                onClick={handleNotify}
                className="w-full h-12 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mb-3"
              >
                <i className="ri-notification-line text-base"></i>
                Navbatim kelganda xabar bering
              </button>
            ) : (
              <div className="w-full h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 mb-3">
                <i className="ri-check-line text-emerald-600 text-base"></i>
                <span className="text-sm font-medium text-emerald-700">SMS xabar yuboriladi</span>
              </div>
            )}
          </>
        )}

        {/* CASE 2: Busy */}
        {resultCase === 'busy' && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-amber-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Shifokor band</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Hozirda navbat to'liq. Iltimos, biroz kuting yoki keyinroq qayta urinib ko'ring.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-line text-amber-600 text-base"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Keyingi bo'sh vaqt</p>
                  <p className="text-xs text-gray-500">Taxminan 45-60 daqiqadan keyin</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Shifokor</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Telefon</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNotify}
              className={`w-full h-12 rounded-xl border-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mb-3 ${
                notifSent
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700'
              }`}
            >
              {notifSent ? (
                <><i className="ri-check-line text-base"></i>Xabar yuboriladi</>
              ) : (
                <><i className="ri-notification-line text-base"></i>Bo'sh bo'lganda xabar bering</>
              )}
            </button>
          </>
        )}

        {/* CASE 3: Info only */}
        {resultCase === 'info' && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-pulse-line text-teal-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Rahmat!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Javoblaringiz qabul qilindi. Shifokor siz bilan bog'lanadi.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-700 mb-3">Qabul qilingan ma'lumotlar:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Telefon</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Shifokor</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Javoblar soni</span>
                  <span className="text-xs font-semibold text-gray-900">{Object.keys(answers).length} ta</span>
                </div>
                {usedAI && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">AI tahlil</span>
                    <span className="text-xs font-semibold text-emerald-600">O'tkazildi</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full h-12 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
        >
          <i className="ri-refresh-line text-base"></i>
          Yangi ro'yxat
        </button>
      </div>
    </div>
  );
}
