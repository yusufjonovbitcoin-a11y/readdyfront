import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { getBodyParts } from "@/mocks/checkin_questions";

interface BodyMapProps {
  selected: string[];
  onChange: (parts: string[]) => void;
}

export default function BodyMap({ selected, onChange }: BodyMapProps) {
  const { t, i18n } = useTranslation("checkin");
  const bodyParts = useMemo(() => getBodyParts(t), [i18n.language]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-gray-500 text-center">{t("questions.bodyMapHint")}</p>
      <div className="relative w-48 h-80 mx-auto">
        {/* Body silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Head */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-100"></div>
            {/* Neck */}
            <div className="absolute left-1/2 -translate-x-1/2 top-11 w-6 h-5 bg-gray-100 border-x-2 border-gray-300"></div>
            {/* Torso */}
            <div className="absolute left-1/2 -translate-x-1/2 top-16 w-24 h-28 rounded-lg border-2 border-gray-300 bg-gray-100"></div>
            {/* Left arm */}
            <div className="absolute top-16 left-6 w-8 h-24 rounded-full border-2 border-gray-300 bg-gray-100 -rotate-6"></div>
            {/* Right arm */}
            <div className="absolute top-16 right-6 w-8 h-24 rounded-full border-2 border-gray-300 bg-gray-100 rotate-6"></div>
            {/* Left leg */}
            <div className="absolute bottom-0 left-14 w-10 h-32 rounded-b-full border-2 border-gray-300 bg-gray-100 -rotate-3"></div>
            {/* Right leg */}
            <div className="absolute bottom-0 right-14 w-10 h-32 rounded-b-full border-2 border-gray-300 bg-gray-100 rotate-3"></div>
          </div>
        </div>

        {/* Clickable hotspots */}
        {bodyParts.map(part => {
          const isSelected = selected.includes(part.id);
          return (
            <button
              key={part.id}
              type="button"
              onClick={() => toggle(part.id)}
              aria-label={`${part.label} ni tanlash`}
              aria-pressed={isSelected}
              className={`absolute w-5 h-5 rounded-full border-2 transition-all cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                isSelected
                  ? 'bg-red-500 border-red-600 scale-125 shadow-lg shadow-red-200'
                  : 'bg-white border-teal-400 hover:bg-teal-100 hover:scale-110'
              }`}
              style={{ left: `${part.x}%`, top: `${part.y}%` }}
              title={part.label}
            />
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="w-full">
          <p className="text-xs font-semibold text-gray-700 mb-2">{t("questions.selectedParts")}</p>
          <ul className="flex flex-wrap gap-2" aria-label={t("questions.selectedParts")}>
            {selected.map(id => {
              const part = bodyParts.find(p => p.id === id);
              return part ? (
                <li key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                  <span>{part.label}</span>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="cursor-pointer hover:text-red-800"
                    aria-label={`${part.label} ni olib tashlash`}
                  >
                    <i className="ri-close-line text-xs" aria-hidden="true"></i>
                  </button>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
