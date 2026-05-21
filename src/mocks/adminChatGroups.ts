export interface AdminGroupMember {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  experience: number;
}

export interface AdminGroupMessage {
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

export interface AdminChatGroup {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  description: string;
  members: AdminGroupMember[];
  messages: AdminGroupMessage[];
  unreadCount: number;
  createdAt: string;
  /** API: when full `members` list is not loaded yet */
  rosterCount?: number;
  /** API: online count from server (optional) */
  onlineCountOverride?: number;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
}

export const superAdminMember: AdminGroupMember = {
  id: "super-admin",
  name: "Super Admin",
  specialty: "Administrator",
  hospitalId: "0",
  hospitalName: "meduza.ai",
  avatar: "SA",
  status: "online",
  experience: 0,
};

export const departments = [
  "Kardiologiya",
  "Nevrologiya",
  "Ortopediya",
  "Pediatriya",
  "Xirurgiya",
  "Ginekologiya",
];

export const statusColors: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-amber-500",
};

export const statusLabels: Record<string, string> = {
  online: "Onlayn",
  offline: "Offlayn",
  busy: "Band",
};

export const specialtyColors: Record<string, string> = {
  Kardiologiya: "bg-rose-600",
  Nevrologiya: "bg-sky-600",
  Ortopediya: "bg-emerald-600",
  Pediatriya: "bg-amber-600",
  Xirurgiya: "bg-violet-600",
  Ginekologiya: "bg-pink-600",
};

export const specialtyBadgeColors: Record<string, string> = {
  Kardiologiya: "bg-rose-500/10 text-rose-500",
  Nevrologiya: "bg-sky-500/10 text-sky-500",
  Ortopediya: "bg-emerald-500/10 text-emerald-500",
  Pediatriya: "bg-amber-500/10 text-amber-500",
  Xirurgiya: "bg-violet-500/10 text-violet-500",
  Ginekologiya: "bg-pink-500/10 text-pink-500",
};

function generateMessages(groupId: string, members: AdminGroupMember[], count: number): AdminGroupMessage[] {
  const sampleTexts: Record<string, string[]> = {
    Kardiologiya: [
      "Assalomu alaykum! Bugungi kardiologiya bo'yicha konferensiya vaqti 15:00 ga o'tkazildi.",
      "Yangi EKG apparati yetib keldi, qachon o'rnatishni rejalashtiramiz?",
      "Dr. Karimov, kecha qabul qilgan bemor holati qanday? Tavsiyalar kerak.",
      "Statinlar narxi oshdi, yangi yetkazib beruvchi bilan shartnoma imzolash kerak.",
      "TAVI operatsiyalar soni bu oy 15 taga yetdi, tabriklaymiz jamoa!",
      "Yangi kardiologiya protokolini o'rganish uchun ta'lim seminarini rejalashtiraylik.",
      "Qon tomirlari angiografiyasi natijalarini tahlil qilish kerak bugun.",
      "CCU bo'limida 3 ta kritik bemor monitoring ostida, hamma tayyor bo'lsin.",
      "Eko-kardiografiya jadvali to'ldi, yangi bemorlarni ertaga o'tkazamiz.",
      "Dorilar inventarizatsiyasi boshlandi, o'tgan hafta hisobotini yuboring.",
    ],
    Nevrologiya: [
      "Yangi MRI apparati sinovdan o'tmoqda, ishga tushirish sanasi biladimi?",
      "Insult markazi sertifikatini yangilash vaqti keldi, hujjatlarni tayyorlang.",
      "Dori-rezistent epilepsiya bemorlarida DBS natijalari ajoyib chiqdi.",
      "Neyrologiya bo'yicha xalqaro konferensiya uchun ro'yxatdan o'tish boshlandi.",
      "Yangi Altsgeymer dori sinovlariga qabul boshlandi, kim ishtirok etadi?",
      "Bemorxonada 45 yoshli erkakda GBS tashxisi qo'yildi, konsilium chaqiramiz.",
      "Elektroensefalografiya xonasi ta'mirdan chiqdi, jadval yangilandi.",
      "Neyrohirurgiya bo'limi yangi mikroskop olmoqda, fikrlaringizni ayting.",
    ],
    Ortopediya: [
      "3D chop etish laboratoriyasi yangi printer oldi, sinovdan o'tkazamiz!",
      "Tizza protezi operatsiyalar soni oshdi, qo'shimcha shifokor kerakmi?",
      "Sport travmalari bo'limi uchun yangi jihozlar yetib keldi, qabul qiling.",
      "PRP terapiya natijalarini xulosalash kerak, hisobotni tayyorlang.",
      "Robotik jarrohlik uskunalari ta'mirlanmoqda, qachon tayyor bo'ladi?",
      "Yangi artroskopik uskunalar o'rnatildi, qo'llanma bilan tanishib chiqing.",
      "Og'ir atletika markazidan 2 ta sportchi yetib keldi, kross-konsultatsiya kerak.",
      "Ortopedik implantlar zaxirasi kamaydi, yangi buyurtma berish vaqti keldi.",
    ],
    Pediatriya: [
      "Bolalar vaksinatsiya jadvali yangilandi, yangi RSV vaksinasi qo'shildi.",
      "Neonatal intensiv terapiya bo'limi kapital ta'mirdan chiqdi, shukur!",
      "Pediatrik onkologiya bo'limi yangi xodim qabul qilmoqda, rezyume yuboring.",
      "Bolalar otiizm markazi uchun qo'shimcha byudjet so'raldi, loyihani ko'rib chiqing.",
      "5 yoshli bemor allergik reaktsiya ko'rsatdi, tez tibbiy yordam chaqirildi.",
      "Bolalar pulmonologi bo'limida yangi nafas apparati o'rnatildi.",
      "Pediatriya bo'limida yangi o'yin xonasi ochildi, bolalar juda xursand.",
    ],
    Xirurgiya: [
      "Yangi laparoskopik uskunalar o'rnatildi, ta'lim jarayonini rejalashtiring.",
      "Jarrohlik xonalari sterilizatsiya protokoli yangilandi, hamma o'qib chiqsin.",
      "Tez tibbiy yordam bo'limi yangi transport vositalari oldi, joylashtirish kerak.",
      "Minimal invaziv jarrohlik markazi sertifikati yangilandi, tabriklaymiz!",
      "Bugun 3 ta og'ir jarrohlik operatsiyasi rejalashtirilgan, brigada tayyorlansin.",
      "Yangi anesteziologiya uskunalari sinovdan o'tdi, ishlatishga ruxsat berildi.",
      "Jarrohlik xonalari kunduzgi rejimga o'tdi, jadvalni yangilang.",
    ],
    Ginekologiya: [
      "Endometrioz markazi yangi uskunalar bilan jihozlanmoqda, ochilishiga 2 hafta.",
      "IVF laboratoriyasi natijalari oshdi, 65% muvaffaqiyat ko'rsatkichi!",
      "HPV skrinning dasturi kengaytirildi, bemorlarga xabar bering.",
      "Ginekologik onkologiya bo'limi uchun yangi shifokor kerak, vakansiya ochiq.",
      "Homiladorlik monitoringi dasturi yangilandi, yangi protokol joriy etildi.",
      "Yangi ultratovush apparati xarid qilindi, o'rnatishni rejalashtiring.",
      "Mammografiya markazi sertifikati yangilandi, davom eting.",
    ],
  };

  const spec = members[0]?.specialty ?? "Kardiologiya";
  const texts = sampleTexts[spec] ?? sampleTexts.Kardiologiya;
  const messages: AdminGroupMessage[] = [];

  for (let i = 0; i < count; i++) {
    const member = members[Math.floor(Math.random() * members.length)]!;
    const text = texts[Math.floor(Math.random() * texts.length)]!;
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 60);
    messages.push({
      id: `${groupId}-msg-${i}`,
      senderId: member.id,
      senderName: member.name,
      senderAvatar: member.avatar,
      senderHospital: member.hospitalName,
      content: text,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      date: "2026-05-12",
      read: Math.random() > 0.4,
    });
  }

  return messages;
}

function generateMembers(
  hospitalId: string,
  hospitalName: string,
  specialty: string,
  count: number,
): AdminGroupMember[] {
  const firstNames = [
    "Alisher",
    "Rustam",
    "Dilshod",
    "Nodira",
    "Bekzod",
    "Gulnora",
    "Sherzod",
    "Madina",
    "Jasur",
    "Zulfiya",
    "Kamol",
    "Nilufar",
    "Timur",
    "Dilorom",
    "Oybek",
    "Feruza",
    "Aziz",
    "Sabina",
    "Davron",
    "Nigora",
    "Ilyos",
    "Shaxnoza",
  ];
  const lastNames = [
    "Karimov",
    "Tursunov",
    "Xalilov",
    "Rahimova",
    "Saidov",
    "Nazarova",
    "Mirzayev",
    "Yusupova",
    "Toshmatov",
    "Raxmonov",
    "Azizova",
    "Ismoilov",
    "Xasanov",
    "Zokirova",
    "Usmonov",
    "G'aniyeva",
    "Sharipov",
    "Mahmudova",
  ];

  const members: AdminGroupMember[] = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)]!;
    const last = lastNames[Math.floor(Math.random() * lastNames.length)]!;
    const name = `Dr. ${first} ${last}`;
    const avatar = `${first[0]!}${last[0]!}`;
    const status = (["online", "offline", "busy"] as const)[Math.floor(Math.random() * 3)]!;
    members.push({
      id: `${hospitalId}-${specialty}-m${i}`,
      name,
      specialty,
      hospitalId,
      hospitalName,
      avatar,
      status,
      experience: 3 + Math.floor(Math.random() * 20),
    });
  }

  return members;
}

export const adminChatGroups: AdminChatGroup[] = [
  {
    id: "grp-tsh-cardio",
    name: "Kardiologiya Guruhi",
    specialty: "Kardiologiya",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    description: "Toshkent shahar klinikasi kardiologlari professional muloqot maydoni",
    members: generateMembers("1", "Toshkent Shahar Klinik Kasalxonasi", "Kardiologiya", 6),
    messages: [],
    unreadCount: 3,
    createdAt: "2025-01-15",
  },
  {
    id: "grp-tsh-neuro",
    name: "Nevrologiya Guruhi",
    specialty: "Nevrologiya",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    description: "Toshkent shahar klinikasi nevrologlari umumiy chat",
    members: generateMembers("1", "Toshkent Shahar Klinik Kasalxonasi", "Nevrologiya", 5),
    messages: [],
    unreadCount: 0,
    createdAt: "2025-02-10",
  },
  {
    id: "grp-tsh-surg",
    name: "Xirurgiya Guruhi",
    specialty: "Xirurgiya",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    description: "Toshkent shahar klinikasi jarrohlari muloqot guruh",
    members: generateMembers("1", "Toshkent Shahar Klinik Kasalxonasi", "Xirurgiya", 7),
    messages: [],
    unreadCount: 7,
    createdAt: "2025-01-20",
  },
  {
    id: "grp-tsh-ped",
    name: "Pediatriya Guruhi",
    specialty: "Pediatriya",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    description: "Toshkent shahar klinikasi bolalar shifokorlari chat",
    members: generateMembers("1", "Toshkent Shahar Klinik Kasalxonasi", "Pediatriya", 5),
    messages: [],
    unreadCount: 2,
    createdAt: "2025-03-05",
  },
  {
    id: "grp-sam-cardio",
    name: "Kardiologiya Guruhi",
    specialty: "Kardiologiya",
    hospitalId: "2",
    hospitalName: "Samarqand Viloyat Kasalxonasi",
    description: "Samarqand viloyati kardiologlarining umumiy chat guruh",
    members: generateMembers("2", "Samarqand Viloyat Kasalxonasi", "Kardiologiya", 5),
    messages: [],
    unreadCount: 2,
    createdAt: "2025-03-01",
  },
  {
    id: "grp-sam-ped",
    name: "Pediatriya Guruhi",
    specialty: "Pediatriya",
    hospitalId: "2",
    hospitalName: "Samarqand Viloyat Kasalxonasi",
    description: "Samarqand viloyati bolalar shifokorlari muloqoti",
    members: generateMembers("2", "Samarqand Viloyat Kasalxonasi", "Pediatriya", 6),
    messages: [],
    unreadCount: 1,
    createdAt: "2025-03-15",
  },
  {
    id: "grp-sam-gyn",
    name: "Ginekologiya Guruhi",
    specialty: "Ginekologiya",
    hospitalId: "2",
    hospitalName: "Samarqand Viloyat Kasalxonasi",
    description: "Samarqand viloyati ginekologlari umumiy chat",
    members: generateMembers("2", "Samarqand Viloyat Kasalxonasi", "Ginekologiya", 4),
    messages: [],
    unreadCount: 4,
    createdAt: "2025-04-01",
  },
  {
    id: "grp-nam-ortho",
    name: "Ortopediya Guruhi",
    specialty: "Ortopediya",
    hospitalId: "3",
    hospitalName: "Namangan Tibbiyot Markazi",
    description: "Namangan ortopedlari professional muloqot guruh",
    members: generateMembers("3", "Namangan Tibbiyot Markazi", "Ortopediya", 4),
    messages: [],
    unreadCount: 0,
    createdAt: "2025-04-01",
  },
  {
    id: "grp-nam-gyn",
    name: "Ginekologiya Guruhi",
    specialty: "Ginekologiya",
    hospitalId: "3",
    hospitalName: "Namangan Tibbiyot Markazi",
    description: "Namangan ginekologlari umumiy chat",
    members: generateMembers("3", "Namangan Tibbiyot Markazi", "Ginekologiya", 5),
    messages: [],
    unreadCount: 5,
    createdAt: "2025-04-10",
  },
  {
    id: "grp-nam-neuro",
    name: "Nevrologiya Guruhi",
    specialty: "Nevrologiya",
    hospitalId: "3",
    hospitalName: "Namangan Tibbiyot Markazi",
    description: "Namangan nevrologlari muloqot guruh",
    members: generateMembers("3", "Namangan Tibbiyot Markazi", "Nevrologiya", 4),
    messages: [],
    unreadCount: 1,
    createdAt: "2025-05-01",
  },
  {
    id: "grp-and-cardio",
    name: "Kardiologiya Guruhi",
    specialty: "Kardiologiya",
    hospitalId: "4",
    hospitalName: "Andijon Xalqaro Klinikasi",
    description: "Andijon xalqaro klinikasi kardiologlar guruh",
    members: generateMembers("4", "Andijon Xalqaro Klinikasi", "Kardiologiya", 6),
    messages: [],
    unreadCount: 4,
    createdAt: "2025-02-20",
  },
  {
    id: "grp-and-surg",
    name: "Xirurgiya Guruhi",
    specialty: "Xirurgiya",
    hospitalId: "4",
    hospitalName: "Andijon Xalqaro Klinikasi",
    description: "Andijon jarrohlari umumiy muloqoti",
    members: generateMembers("4", "Andijon Xalqaro Klinikasi", "Xirurgiya", 6),
    messages: [],
    unreadCount: 2,
    createdAt: "2025-02-25",
  },
  {
    id: "grp-and-ortho",
    name: "Ortopediya Guruhi",
    specialty: "Ortopediya",
    hospitalId: "4",
    hospitalName: "Andijon Xalqaro Klinikasi",
    description: "Andijon ortopedlari professional guruh",
    members: generateMembers("4", "Andijon Xalqaro Klinikasi", "Ortopediya", 4),
    messages: [],
    unreadCount: 0,
    createdAt: "2025-03-20",
  },
  {
    id: "grp-fer-neuro",
    name: "Nevrologiya Guruhi",
    specialty: "Nevrologiya",
    hospitalId: "6",
    hospitalName: "Farg'ona Viloyat Klinikasi",
    description: "Farg'ona viloyati nevrologlarining umumiy guruh",
    members: generateMembers("6", "Farg'ona Viloyat Klinikasi", "Nevrologiya", 5),
    messages: [],
    unreadCount: 0,
    createdAt: "2025-05-01",
  },
  {
    id: "grp-fer-ped",
    name: "Pediatriya Guruhi",
    specialty: "Pediatriya",
    hospitalId: "6",
    hospitalName: "Farg'ona Viloyat Klinikasi",
    description: "Farg'ona bolalar shifokorlari chat guruh",
    members: generateMembers("6", "Farg'ona Viloyat Klinikasi", "Pediatriya", 5),
    messages: [],
    unreadCount: 1,
    createdAt: "2025-05-10",
  },
  {
    id: "grp-fer-gyn",
    name: "Ginekologiya Guruhi",
    specialty: "Ginekologiya",
    hospitalId: "6",
    hospitalName: "Farg'ona Viloyat Klinikasi",
    description: "Farg'ona viloyati ginekologlari muloqoti",
    members: generateMembers("6", "Farg'ona Viloyat Klinikasi", "Ginekologiya", 4),
    messages: [],
    unreadCount: 3,
    createdAt: "2025-05-15",
  },
];

adminChatGroups.forEach((group) => {
  group.messages = generateMessages(group.id, group.members, 6 + Math.floor(Math.random() * 8));
});
