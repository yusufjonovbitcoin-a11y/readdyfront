import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { haDoctors } from '@/mocks/ha_doctors';
import i18n from '@/i18n';
import PhoneStep from './components/PhoneStep';
import LanguageStep from './components/LanguageStep';
import type { CheckinLang } from './components/LanguageStep';
import QuestionsFlow from './components/QuestionsFlow';
import AIAssistStep from './components/AIAssistStep';
import ResultStep from './components/ResultStep';

type FlowStep = 'phone' | 'language' | 'questions' | 'ai' | 'result';

export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctor_id') || 'doc-001';
  const doctor = haDoctors.find(d => d.id === doctorId);

  const [step, setStep] = useState<FlowStep>('language');
  const [phone, setPhone] = useState('');
  const [resumeDraft, setResumeDraft] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [usedAI, setUsedAI] = useState(false);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
            <i className="ri-error-warning-line text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shifokor topilmadi</h2>
          <p className="text-sm text-gray-500">Noto'g'ri QR kod yoki shifokor mavjud emas. Iltimos, to'g'ri QR kodni skanerlang.</p>
        </div>
      </div>
    );
  }

  const handleLanguageContinue = (_: CheckinLang) => {
    setStep('phone');
  };

  const handlePhoneContinue = (p: string, resume: boolean) => {
    setPhone(p);
    setResumeDraft(resume);
    setStep('questions');
  };

  const handleQuestionsComplete = (ans: Record<string, string | string[]>) => {
    setAnswers(ans);
    setStep('ai');
  };

  const handleAIFinish = (ai: boolean) => {
    setUsedAI(ai);
    setStep('result');
  };

  const handleRestart = () => {
    void i18n.changeLanguage('uz');
    setStep('language');
    setPhone('');
    setResumeDraft(false);
    setAnswers({});
    setUsedAI(false);
  };

  return (
    <>
      {step === 'language' && (
        <LanguageStep
          onContinue={handleLanguageContinue}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          doctorAvatar={doctor.avatar}
        />
      )}
      {step === 'phone' && (
        <PhoneStep
          onContinue={handlePhoneContinue}
          onBack={() => setStep('language')}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          doctorAvatar={doctor.avatar}
        />
      )}
      {step === 'questions' && (
        <QuestionsFlow
          phone={phone}
          doctorId={doctorId}
          resumeDraft={resumeDraft}
          onComplete={handleQuestionsComplete}
        />
      )}
      {step === 'ai' && (
        <AIAssistStep
          answers={answers}
          onFinish={handleAIFinish}
        />
      )}
      {step === 'result' && (
        <ResultStep
          phone={phone}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          answers={answers}
          usedAI={usedAI}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
