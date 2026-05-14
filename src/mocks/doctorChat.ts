/** Mock: bir mutaxassislik (bo'lim) bo'yicha bitta guruh chat + a'zolar. */

export interface ChatDoctor {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  lastSeen?: string;
  experience: number;
  phone: string;
  email: string;
}

/** 1:1 suhbat xabarlari (guruh mockidan alohida). */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  date: string;
  type: "text" | "image" | "file";
  read: boolean;
}

export interface DoctorConversation {
  id: string;
  doctorId: string;
  doctor: ChatDoctor;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessageAt: string;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderHospital: string;
  content: string;
  time: string;
  date: string;
  read: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  experience: number;
}

export interface DoctorGroup {
  id: string;
  name: string;
  specialty: string;
  description: string;
  members: GroupMember[];
  messages: GroupMessage[];
  unreadCount: number;
  createdAt: string;
}

export const specialtyLabels: Record<string, string> = {
  Kardiologiya: "Kardiologiya",
  Nevrologiya: "Nevrologiya",
  Ortopediya: "Ortopediya",
  Pediatriya: "Pediatriya",
  Xirurgiya: "Xirurgiya",
  Ginekologiya: "Ginekologiya",
};

export const statusColors: Record<ChatDoctor["status"], string> = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-amber-500",
};

export const statusLabels: Record<ChatDoctor["status"], string> = {
  online: "Onlayn",
  offline: "Offlayn",
  busy: "Band",
};

export const currentChatDoctor: ChatDoctor = {
  id: "d-current",
  name: "Dr. Alisher Karimov",
  specialty: "Kardiologiya",
  hospitalId: "1",
  hospitalName: "Toshkent Klinikasi",
  avatar: "AK",
  status: "online",
  experience: 12,
  phone: "+998 90 111 22 33",
  email: "a.karimov@clinic.uz",
};

export const chatDoctorsBySpecialty: Record<string, ChatDoctor[]> = {
  Kardiologiya: [
    {
      id: "d-card-2",
      name: "Dr. Rustam Tursunov",
      specialty: "Kardiologiya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "RT",
      status: "online",
      lastSeen: "Hozir",
      experience: 15,
      phone: "+998 91 234 56 78",
      email: "r.tursunov@samarkand.med.uz",
    },
    {
      id: "d-card-3",
      name: "Dr. Dilshod Xalilov",
      specialty: "Kardiologiya",
      hospitalId: "3",
      hospitalName: "Farg'ona Viloyat Shifoxonasi",
      avatar: "DX",
      status: "offline",
      lastSeen: "15 daqiqa oldin",
      experience: 8,
      phone: "+998 93 345 67 89",
      email: "d.xalilov@fergana.med.uz",
    },
    {
      id: "d-card-4",
      name: "Dr. Nodira Rahimova",
      specialty: "Kardiologiya",
      hospitalId: "4",
      hospitalName: "Andijon Respublika Shifoxonasi",
      avatar: "NR",
      status: "busy",
      lastSeen: "Operatsiyada",
      experience: 20,
      phone: "+998 94 456 78 90",
      email: "n.rahimova@andijan.med.uz",
    },
    {
      id: "d-card-5",
      name: "Dr. Bekzod Saidov",
      specialty: "Kardiologiya",
      hospitalId: "5",
      hospitalName: "Buxoro Kardiologiya Markazi",
      avatar: "BS",
      status: "online",
      lastSeen: "Hozir",
      experience: 10,
      phone: "+998 95 567 89 01",
      email: "b.saidov@bukhara.med.uz",
    },
  ],
  Nevrologiya: [
    {
      id: "d-nev-2",
      name: "Dr. Jamshid Vohidov",
      specialty: "Nevrologiya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "JV",
      status: "online",
      lastSeen: "Hozir",
      experience: 11,
      phone: "+998 91 876 54 32",
      email: "j.vohidov@samarkand.med.uz",
    },
    {
      id: "d-nev-3",
      name: "Dr. Zarnigor Eshonova",
      specialty: "Nevrologiya",
      hospitalId: "3",
      hospitalName: "Farg'ona Viloyat Shifoxonasi",
      avatar: "ZE",
      status: "offline",
      lastSeen: "1 soat oldin",
      experience: 14,
      phone: "+998 93 987 65 43",
      email: "z.eshonova@fergana.med.uz",
    },
    {
      id: "d-nev-4",
      name: "Dr. Oybek Norboyev",
      specialty: "Nevrologiya",
      hospitalId: "6",
      hospitalName: "Namangan Nefteyogar Shifoxonasi",
      avatar: "ON",
      status: "online",
      lastSeen: "Hozir",
      experience: 7,
      phone: "+998 94 123 45 67",
      email: "o.norboyev@namangan.med.uz",
    },
  ],
  Ortopediya: [
    {
      id: "d-ort-2",
      name: "Dr. Firdavs Umarov",
      specialty: "Ortopediya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "FU",
      status: "offline",
      lastSeen: "2 soat oldin",
      experience: 13,
      phone: "+998 91 111 22 33",
      email: "f.umarov@samarkand.med.uz",
    },
    {
      id: "d-ort-3",
      name: "Dr. Gulnoza Toxirova",
      specialty: "Ortopediya",
      hospitalId: "7",
      hospitalName: "Qarshi Shifoxonasi",
      avatar: "GT",
      status: "online",
      lastSeen: "Hozir",
      experience: 9,
      phone: "+998 93 222 33 44",
      email: "g.toxirova@qarshi.med.uz",
    },
  ],
  Pediatriya: [
    {
      id: "d-ped-2",
      name: "Dr. Lola Karimova",
      specialty: "Pediatriya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "LK",
      status: "online",
      lastSeen: "Hozir",
      experience: 16,
      phone: "+998 91 333 44 55",
      email: "l.karimova@samarkand.med.uz",
    },
    {
      id: "d-ped-3",
      name: "Dr. Anvar Ismoilov",
      specialty: "Pediatriya",
      hospitalId: "8",
      hospitalName: "Nukus Bolalar Shifoxonasi",
      avatar: "AI",
      status: "busy",
      lastSeen: "Qabulda",
      experience: 12,
      phone: "+998 93 444 55 66",
      email: "a.ismoilov@nukus.med.uz",
    },
  ],
  Xirurgiya: [
    {
      id: "d-xir-2",
      name: "Dr. Shavkat Bobojonov",
      specialty: "Xirurgiya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "SB",
      status: "offline",
      lastSeen: "30 daqiqa oldin",
      experience: 18,
      phone: "+998 91 555 66 77",
      email: "s.bobojonov@samarkand.med.uz",
    },
    {
      id: "d-xir-3",
      name: "Dr. Nigora Azimova",
      specialty: "Xirurgiya",
      hospitalId: "9",
      hospitalName: "Kokand Jarrohiylik Markazi",
      avatar: "NA",
      status: "online",
      lastSeen: "Hozir",
      experience: 11,
      phone: "+998 93 666 77 88",
      email: "n.azimova@kokand.med.uz",
    },
  ],
  Ginekologiya: [
    {
      id: "d-gin-2",
      name: "Dr. Madina Toshpulatova",
      specialty: "Ginekologiya",
      hospitalId: "2",
      hospitalName: "Samarkand Tibbiyot Markazi",
      avatar: "MT",
      status: "online",
      lastSeen: "Hozir",
      experience: 14,
      phone: "+998 91 777 88 99",
      email: "m.toshpulatova@samarkand.med.uz",
    },
    {
      id: "d-gin-3",
      name: "Dr. Jahongir Qosimov",
      specialty: "Ginekologiya",
      hospitalId: "10",
      hospitalName: "Termiz Ayollar Shifoxonasi",
      avatar: "JQ",
      status: "offline",
      lastSeen: "3 soat oldin",
      experience: 6,
      phone: "+998 93 888 99 00",
      email: "j.qosimov@termiz.med.uz",
    },
  ],
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  Kardiologiya:
    "O'zbekiston bo'ylab barcha kardiologlar uchun professional muloqot — bitta guruhda xabarlar barcha a'zolarga ko'rinadi.",
  Nevrologiya: "Viloyatlar bo'ylab nevrologlar uchun rasmiy guruh muhokamasi.",
  Ortopediya: "Ortopedlar va travmatologlar uchun umumiy kanal.",
  Pediatriya: "Bolalar shifokorlari uchun maslahat guruhi.",
  Xirurgiya: "Jarrohlar uchun tezkor konsilium kanali.",
  Ginekologiya: "Ginekologlar uchun professional guruh.",
};

const CARDIO_GROUP_MESSAGES: GroupMessage[] = [
  {
    id: "gm-1",
    senderId: "d-card-2",
    senderName: "Dr. Rustam Tursunov",
    senderAvatar: "RT",
    senderHospital: "Samarkand Tibbiyot Markazi",
    content:
      "Assalomu alaykum hamkasblar! Kecha qabulga kelgan 65 yoshli bemor haqida maslahat soray edim. EKG'da yangi ST segment ko'tarilishi bor, biroq troponin normal. Nima deb o'ylaysiz?",
    time: "09:30",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-2",
    senderId: "d-current",
    senderName: "Dr. Alisher Karimov",
    senderAvatar: "AK",
    senderHospital: "Toshkent Klinikasi",
    content:
      "Salom Rustam aka! Troponin qachon olingan? Agar 6 soat ichida olingan bo'lsa, qayta tekshirish kerak. ST elevation bilan birga o'tkir koronor sindrom bo'lishi mumkin.",
    time: "09:35",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-3",
    senderId: "d-card-5",
    senderName: "Dr. Bekzod Saidov",
    senderAvatar: "BS",
    senderHospital: "Buxoro Kardiologiya Markazi",
    content:
      "Men ham shunga o'xshash holat ko'rganman. Echocardiografiya qilishingizni maslahat beraman. Agar RWMA bo'lsa, darhol kateter laboratoriyaga.",
    time: "09:37",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-4",
    senderId: "d-card-2",
    senderName: "Dr. Rustam Tursunov",
    senderAvatar: "RT",
    senderHospital: "Samarkand Tibbiyot Markazi",
    content: "Rahmat Alisher aka va Bekzod! Echocardiografiya qilaman. Sizning markazda qanday protokol?",
    time: "09:38",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-5",
    senderId: "d-current",
    senderName: "Dr. Alisher Karimov",
    senderAvatar: "AK",
    senderHospital: "Toshkent Klinikasi",
    content:
      "Echocardiografiya + qon biokimyosi (CK-MB, myoglobin). Agar shubha bo'lsa, koronaroangiografiya tavsiya etamiz.",
    time: "09:40",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-6",
    senderId: "d-card-4",
    senderName: "Dr. Nodira Rahimova",
    senderAvatar: "NR",
    senderHospital: "Andijon Respublika Shifoxonasi",
    content:
      "Hamkasblar, Andijonda yurak yetishmovchiligi bilan og'rigan bemorlarda SGLT2 ingibitori natijalarini ulashishni istardim. 40+ bemorlarda NT-proBNP 35% ga kamaydi, EF 8-10% oshdi. Juda samarali!",
    time: "10:15",
    date: "2026-05-12",
    read: true,
  },
  {
    id: "gm-7",
    senderId: "d-card-3",
    senderName: "Dr. Dilshod Xalilov",
    senderAvatar: "DX",
    senderHospital: "Farg'ona Viloyat Shifoxonasi",
    content:
      "Nodira opa, ajoyib natija! Farg'onada ham shu yo'nalishda ish boshlayman. Yana bir narsa — DAPA-HF tadqiqotining uzun muddatli natijalari bo'yicha maqola yozmoqdaman. Hamkorlik qilasizmi?",
    time: "10:22",
    date: "2026-05-12",
    read: false,
  },
  {
    id: "gm-8",
    senderId: "d-card-5",
    senderName: "Dr. Bekzod Saidov",
    senderAvatar: "BS",
    senderHospital: "Buxoro Kardiologiya Markazi",
    content:
      "Buxoroda TAVI operatsiyalar yaxshi ketmoqda. 15 ta operatsiya qildik. Omon qolish 100% 👍 Kimdir TAVI bo'yicha tajriba ulashmoqchi?",
    time: "10:30",
    date: "2026-05-12",
    read: false,
  },
  {
    id: "gm-9",
    senderId: "d-card-2",
    senderName: "Dr. Rustam Tursunov",
    senderAvatar: "RT",
    senderHospital: "Samarkand Tibbiyot Markazi",
    content:
      "Bekzod, ajoyib! Samarkandda ham TAVI boshladik. Ammo biroz qiyinchiliklar bor — antikoagulyant protokolda. Siz qanday boshqarasiz?",
    time: "10:35",
    date: "2026-05-12",
    read: false,
  },
];

function doctorToGroupMember(d: ChatDoctor): GroupMember {
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    hospitalId: d.hospitalId,
    hospitalName: d.hospitalName,
    avatar: d.avatar,
    status: d.status,
    experience: d.experience,
  };
}

function defaultMessagesForSpecialty(specialty: string, members: GroupMember[]): GroupMessage[] {
  if (specialty === "Kardiologiya") return [...CARDIO_GROUP_MESSAGES];
  const firstOther = members.find((m) => m.id !== currentChatDoctor.id);
  if (!firstOther) return [];
  return [
    {
      id: `welcome-${specialty}`,
      senderId: firstOther.id,
      senderName: firstOther.name,
      senderAvatar: firstOther.avatar,
      senderHospital: firstOther.hospitalName,
      content: `Assalomu alaykum! ${specialtyLabels[specialty] ?? specialty} guruhi faollashdi — maslahatlar shu yerda bo'lsin.`,
      time: "08:00",
      date: "2026-05-12",
      read: true,
    },
  ];
}

export function getDoctorsForSpecialty(specialty: string): ChatDoctor[] {
  return chatDoctorsBySpecialty[specialty] ?? [];
}

export function getGroupMembersForSpecialty(specialty: string): GroupMember[] {
  const self = doctorToGroupMember(currentChatDoctor);
  const others = (chatDoctorsBySpecialty[specialty] ?? []).map(doctorToGroupMember);
  return [self, ...others];
}

export const CURRENT_SPECIALTY = currentChatDoctor.specialty;

export function getDoctorGroupChannel(): DoctorGroup {
  const specialty = currentChatDoctor.specialty;
  const members = getGroupMembersForSpecialty(specialty);
  const messages = defaultMessagesForSpecialty(specialty, members);
  const unreadCount = messages.filter((m) => !m.read && m.senderId !== "d-current").length;

  return {
    id: `group-${specialty}`,
    name: `${specialtyLabels[specialty] ?? specialty} guruhi`,
    specialty,
    description: GROUP_DESCRIPTIONS[specialty] ?? "Shu mutaxassislik bo'yicha yagona guruh muhokamasi.",
    members,
    messages,
    unreadCount,
    createdAt: "2025-01-15",
  };
}

export const doctorGroup: DoctorGroup = getDoctorGroupChannel();
