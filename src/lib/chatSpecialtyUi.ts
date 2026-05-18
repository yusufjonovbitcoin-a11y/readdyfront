import { specialtyBadgeColors, specialtyColors } from "@/mocks/adminChatGroups";

const SPECIALTY_ALIASES: Record<string, string> = {
  kardiologiya: "Kardiologiya",
  cardiology: "Kardiologiya",
  nevrologiya: "Nevrologiya",
  neurology: "Nevrologiya",
  ortopediya: "Ortopediya",
  orthopedics: "Ortopediya",
  orthopedic: "Ortopediya",
  pediatriya: "Pediatriya",
  pediatrics: "Pediatriya",
  xirurgiya: "Xirurgiya",
  surgery: "Xirurgiya",
  surgical: "Xirurgiya",
  ginekologiya: "Ginekologiya",
  gynecology: "Ginekologiya",
  gynecolo: "Ginekologiya",
  genecology: "Ginekologiya",
  urolog: "Ginekologiya",
  urology: "Ginekologiya",
};

const SPECIALTY_ICONS: Record<string, string> = {
  Kardiologiya: "heart-pulse",
  Nevrologiya: "brain",
  Ortopediya: "armchair",
  Pediatriya: "bear-smile",
  Xirurgiya: "scissors",
  Ginekologiya: "women",
};

const FALLBACK_COLOR_PALETTE = [
  "bg-rose-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-violet-600",
  "bg-pink-600",
  "bg-indigo-600",
];

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function normalizeSpecialtyKey(specialty: string): string {
  const trimmed = specialty.trim();
  if (!trimmed) return trimmed;
  if (specialtyColors[trimmed]) return trimmed;
  const alias = SPECIALTY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  return trimmed;
}

export function getSpecialtyColorClass(specialty: string): string {
  const key = normalizeSpecialtyKey(specialty);
  if (specialtyColors[key]) return specialtyColors[key]!;
  return FALLBACK_COLOR_PALETTE[hashString(key || specialty) % FALLBACK_COLOR_PALETTE.length]!;
}

export function getSpecialtyBadgeClass(specialty: string): string {
  const key = normalizeSpecialtyKey(specialty);
  return specialtyBadgeColors[key] ?? "bg-gray-500/10 text-gray-500";
}

export function getSpecialtyIcon(specialty: string): string {
  const key = normalizeSpecialtyKey(specialty);
  return SPECIALTY_ICONS[key] ?? "chat-smile";
}

export function chatSenderUserId(user: { id: string; userId?: string }): string {
  return user.userId?.trim() || user.id;
}

export function getPeerMessageAvatarClass(senderId: string, isMe: boolean, roomSpecialty: string): string {
  if (isMe) return "bg-emerald-600";
  const id = senderId.toLowerCase();
  if (id.includes("cardio")) return "bg-rose-600";
  if (id.includes("neuro")) return "bg-sky-600";
  if (id.includes("ortho")) return "bg-emerald-600";
  if (id.includes("ped")) return "bg-amber-600";
  if (id.includes("surg")) return "bg-violet-600";
  return getSpecialtyColorClass(roomSpecialty);
}
