import { useState } from "react";
import MedicalBottomSheet from "@/components/MedicalBottomSheet";

/**
 * Demo: `MedicalBottomSheet` ni alohida sahifada sinash uchun (`/chat`).
 * Asosiy integratsiya — check-in `AIAssistStep`.
 */
export default function ChatPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        <p className="text-sm font-semibold text-gray-900">Demo chat</p>
        <p className="text-xs text-gray-500">Pastdan chiqadigan tibbiy so‘rovnoma</p>
      </header>

      <div className="flex-1 relative min-h-[50vh]">
        <div className="p-4 text-sm text-gray-600">
          Bu yerda asosiy chat UI (xabarlar ro‘yxati) bo‘lardi.
        </div>

        <MedicalBottomSheet
          mountStyle="contained"
          isOpen={open}
          onClose={() => {
            setOpen(false);
            console.log("Yopildi");
          }}
          onComplete={(answers) => {
            setOpen(false);
            console.log("Javoblar:", answers);
          }}
        />
      </div>

      <footer className="bg-white border-t px-4 py-3 shrink-0">
        <button
          type="button"
          className="w-full h-10 rounded-lg bg-teal-500 text-white text-sm font-medium"
          onClick={() => setOpen(true)}
        >
          So‘rovnomani qayta ochish
        </button>
      </footer>
    </div>
  );
}
