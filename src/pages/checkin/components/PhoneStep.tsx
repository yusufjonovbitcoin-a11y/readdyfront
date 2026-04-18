import { useState } from 'react';

interface DraftInfo {
  phone: string;
  currentStep: number;
  answersCount: number;
  updatedAt: string;
}

interface PhoneStepProps {
  onContinue: (phone: string, resumeDraft: boolean) => void;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
}

export default function PhoneStep({ onContinue, doctorName, doctorSpecialty, doctorAvatar }: PhoneStepProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<DraftInfo | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(formatPhone(raw));
    setError('');
  };

  const validatePhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    return digits.length === 9;
  };

  const checkDraft = (fullPhone: string) => {
    try {
      const key = `draft_${fullPhone}`;
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const updatedAt = new Date(parsed.updatedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed as DraftInfo;
    } catch {
      return null;
    }
  };

  const handleSubmit = () => {
    if (!validatePhone(phone)) {
      setError('Telefon raqamni to\'liq kiriting (9 ta raqam)');
      return;
    }
    setLoading(true);
    const fullPhone = `+998 ${phone}`;
    setTimeout(() => {
      setLoading(false);
      const existingDraft = checkDraft(fullPhone);
      if (existingDraft && existingDraft.currentStep > 0) {
        setDraft(existingDraft);
        setShowDraftModal(true);
      } else {
        onContinue(fullPhone, false);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4">
      {/* Draft Resume Modal */}
      {showDraftModal && draft && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 mx-auto mb-4">
              <i className="ri-save-line text-amber-600 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Saqlangan ma'lumot topildi</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Siz avval {draft.answersCount} ta savolga javob bergansiz
            </p>
            <p className="text-xs text-gray-400 text-center mb-5">
              {new Date(draft.updatedAt).toLocaleString('uz-UZ')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowDraftModal(false); onContinue(`+998 ${phone}`, true); }}
                className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-play-circle-line text-base"></i>
                Davom etish
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`draft_+998 ${phone}`);
                  setShowDraftModal(false);
                  onContinue(`+998 ${phone}`, false);
                }}
                className="w-full h-12 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Qaytadan boshlash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <i className="ri-hospital-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MedCore</h1>
          <p className="text-sm text-gray-500 mt-1">Navbatga yozilish tizimi</p>
        </div>

        {/* Doctor card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{doctorName}</p>
            <p className="text-xs text-teal-600 font-medium">{doctorSpecialty}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs text-gray-500">Qabul qilmoqda</span>
            </div>
          </div>
        </div>

        {/* Phone input card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-1">Telefon raqamingizni kiriting</h2>
          <p className="text-xs text-gray-500 mb-5">Navbat holati SMS orqali yuboriladi</p>

          <div className="flex gap-2 mb-1">
            <div className="flex items-center gap-2 px-3 h-13 rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0">
              <span className="text-lg">🇺🇿</span>
              <span className="text-sm font-semibold text-gray-700">+998</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              className={`flex-1 px-4 h-13 rounded-xl border text-sm outline-none transition-all font-medium tracking-wider ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-teal-500 focus:bg-teal-50/30'
              }`}
              placeholder="90 123 45 67"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={handleKeyDown}
              style={{ height: '52px' }}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-13 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-70 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mt-5 shadow-md shadow-teal-200"
            style={{ height: '52px' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Tekshirilmoqda...
              </>
            ) : (
              <>
                Davom etish
                <i className="ri-arrow-right-line text-base"></i>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Ma'lumotlaringiz xavfsiz saqlanadi va faqat shifokorga ko'rsatiladi
        </p>
      </div>
    </div>
  );
}
