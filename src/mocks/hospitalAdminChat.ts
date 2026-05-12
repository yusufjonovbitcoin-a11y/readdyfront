export interface HAGroupMember {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  experience: number;
}

export interface HAGroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  date: string;
  read: boolean;
}

export interface HAChatGroup {
  id: string;
  name: string;
  specialty: string;
  description: string;
  members: HAGroupMember[];
  messages: HAGroupMessage[];
  unreadCount: number;
}

export const hospitalAdminMember: HAGroupMember = {
  id: "ha-admin",
  name: "Hospital Admin",
  specialty: "Administrator",
  avatar: "HA",
  status: "online",
  experience: 0,
};

export const haDepartments = [
  "Kardiologiya",
  "Nevrologiya",
  "Ortopediya",
  "Pediatriya",
  "Xirurgiya",
  "Ginekologiya",
];

function generateHAMembers(specialty: string, count: number): HAGroupMember[] {
  const firstNames = ["Alisher", "Rustam", "Dilshod", "Nodira", "Bekzod", "Gulnora", "Sherzod", "Madina", "Jasur", "Zulfiya", "Kamol", "Nilufar", "Timur", "Dilorom"];
  const lastNames = ["Karimov", "Tursunov", "Xalilov", "Rahimova", "Saidov", "Nazarova", "Mirzayev", "Yusupova", "Toshmatov", "Raxmonov", "Azizova", "Ismoilov"];
  const members: HAGroupMember[] = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const status = (["online", "offline", "busy"] as const)[Math.floor(Math.random() * 3)];
    members.push({
      id: `${specialty}-m${i}`,
      name: `Dr. ${first} ${last}`,
      specialty,
      avatar: `${first[0]}${last[0]}`,
      status,
      experience: 3 + Math.floor(Math.random() * 20),
    });
  }
  return members;
}

function generateHAMessages(groupId: string, members: HAGroupMember[], count: number): HAGroupMessage[] {
  const sampleTexts: Record<string, string[]> = {
    Kardiologiya: [
      "Bugungi EKG natijalari tayyor, dr. Karimov tekshirib ko'ring.",
      "Yangi bemor qabul qilindi, kardiomiopatiya shubhasi.",
      "Kechagi operatsiya muvaffaqiyatli o'tdi, tabriklaymiz!",
      "Statinlar zaxirasi tugamoqda, dorixonadan buyurtma berishimiz kerak.",
      "Ertangi konsilium soat 10:00 da bo'ladi.",
    ],
    Nevrologiya: [
      "MRI apparati bugun texnik xizmatda, ertaga ishga tushadi.",
      "Insult bo'limi uchun yangi protokol tayyor.",
      "Dr. Tursunov, kechagi bemor holati yaxshilandi.",
      "Neyrologik tekshiruv natijalarini muhokama qilishimiz kerak.",
    ],
    Ortopediya: [
      "Tizza protezi operatsiyasi ertaga rejalashtirilgan.",
      "Sport travmalari bo'limida yangi jihozlar o'rnatildi.",
      "PRP terapiya natijalari ijobiy, davom ettiramiz.",
      "Robotik jarrohlik uskunalari ta'mirdan chiqdi.",
    ],
    Pediatriya: [
      "Bolalar vaksinatsiya jadvali yangilandi.",
      "Neonatal bo'limda yangi inkubator o'rnatildi.",
      "Bolalar allergiya testlari natijalari tayyor.",
      "Ertangi qabul uchun 12 ta bemor ro'yxatdan o'tgan.",
    ],
    Xirurgiya: [
      "Laparoskopik operatsiya muvaffaqiyatli yakunlandi.",
      "Sterilizatsiya protokoli yangilandi, barcha xodimlar o'qisin.",
      "Operatsiya xonasi №3 ta'mirdan chiqdi.",
      "Yangi jarrohlik asboblari yetib keldi.",
    ],
    Ginekologiya: [
      "IVF laboratoriya natijalari ijobiy, 70% muvaffaqiyat.",
      "HPV skrinning dasturi kengaytirildi.",
      "Yangi USI apparati o'rnatildi.",
      "Ertangi konsultatsiya soat 9:00 da boshlanadi.",
    ],
  };

  const texts = sampleTexts[members[0]?.specialty] || sampleTexts.Kardiologiya;
  const messages: HAGroupMessage[] = [];
  for (let i = 0; i < count; i++) {
    const member = members[Math.floor(Math.random() * members.length)];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 60);
    messages.push({
      id: `${groupId}-msg-${i}`,
      senderId: member.id,
      senderName: member.name,
      senderAvatar: member.avatar,
      content: text,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      date: "2026-05-12",
      read: Math.random() > 0.3,
    });
  }
  return messages;
}

export const haChatGroups: HAChatGroup[] = [
  { id: "ha-cardio", name: "Kardiologiya Guruhi", specialty: "Kardiologiya", description: "Kasalxona kardiologiya bo'limi shifokorlari umumiy chat guruh", members: generateHAMembers("Kardiologiya", 5), messages: [], unreadCount: 3 },
  { id: "ha-neuro", name: "Nevrologiya Guruhi", specialty: "Nevrologiya", description: "Kasalxona nevrologiya bo'limi shifokorlari muloqot maydoni", members: generateHAMembers("Nevrologiya", 4), messages: [], unreadCount: 0 },
  { id: "ha-ortho", name: "Ortopediya Guruhi", specialty: "Ortopediya", description: "Kasalxona ortopediya bo'limi professional muloqot", members: generateHAMembers("Ortopediya", 3), messages: [], unreadCount: 2 },
  { id: "ha-ped", name: "Pediatriya Guruhi", specialty: "Pediatriya", description: "Kasalxona bolalar bo'limi shifokorlari chat guruh", members: generateHAMembers("Pediatriya", 4), messages: [], unreadCount: 1 },
  { id: "ha-surg", name: "Xirurgiya Guruhi", specialty: "Xirurgiya", description: "Kasalxona jarrohlik bo'limi umumiy muloqoti", members: generateHAMembers("Xirurgiya", 6), messages: [], unreadCount: 5 },
  { id: "ha-gyn", name: "Ginekologiya Guruhi", specialty: "Ginekologiya", description: "Kasalxona ginekologiya bo'limi shifokorlari chat", members: generateHAMembers("Ginekologiya", 4), messages: [], unreadCount: 0 },
];

haChatGroups.forEach((group) => {
  group.messages = generateHAMessages(group.id, group.members, 4 + Math.floor(Math.random() * 6));
});

export const haStatusColors: Record<string, string> = { online: "bg-emerald-500", offline: "bg-gray-400", busy: "bg-amber-500" };
export const haStatusLabels: Record<string, string> = { online: "Onlayn", offline: "Offlayn", busy: "Band" };
export const haSpecialtyColors: Record<string, string> = { Kardiologiya: "bg-rose-600", Nevrologiya: "bg-sky-600", Ortopediya: "bg-teal-600", Pediatriya: "bg-amber-600", Xirurgiya: "bg-violet-600", Ginekologiya: "bg-pink-600" };
export const haSpecialtyBadgeColors: Record<string, string> = { Kardiologiya: "bg-rose-500/10 text-rose-500", Nevrologiya: "bg-sky-500/10 text-sky-500", Ortopediya: "bg-teal-500/10 text-teal-500", Pediatriya: "bg-amber-500/10 text-amber-500", Xirurgiya: "bg-violet-500/10 text-violet-500", Ginekologiya: "bg-pink-500/10 text-pink-500" };
