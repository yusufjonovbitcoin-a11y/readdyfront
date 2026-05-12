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

export interface GroupChatMessage {
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
    { id: "d-card-2", name: "Dr. Rustam Tursunov", specialty: "Kardiologiya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "RT", status: "online", lastSeen: "Hozir", experience: 15, phone: "+998 91 234 56 78", email: "r.tursunov@samarkand.med.uz" },
    { id: "d-card-3", name: "Dr. Dilshod Xalilov", specialty: "Kardiologiya", hospitalId: "3", hospitalName: "Farg'ona Viloyat Shifoxonasi", avatar: "DX", status: "offline", lastSeen: "15 daqiqa oldin", experience: 8, phone: "+998 93 345 67 89", email: "d.xalilov@fergana.med.uz" },
    { id: "d-card-4", name: "Dr. Nodira Rahimova", specialty: "Kardiologiya", hospitalId: "4", hospitalName: "Andijon Respublika Shifoxonasi", avatar: "NR", status: "busy", lastSeen: "Operatsiyada", experience: 20, phone: "+998 94 456 78 90", email: "n.rahimova@andijan.med.uz" },
    { id: "d-card-5", name: "Dr. Bekzod Saidov", specialty: "Kardiologiya", hospitalId: "5", hospitalName: "Buxoro Kardiologiya Markazi", avatar: "BS", status: "online", lastSeen: "Hozir", experience: 10, phone: "+998 95 567 89 01", email: "b.saidov@bukhara.med.uz" },
  ],
  Nevrologiya: [
    { id: "d-nev-2", name: "Dr. Jamshid Vohidov", specialty: "Nevrologiya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "JV", status: "online", lastSeen: "Hozir", experience: 11, phone: "+998 91 876 54 32", email: "j.vohidov@samarkand.med.uz" },
    { id: "d-nev-3", name: "Dr. Zarnigor Eshonova", specialty: "Nevrologiya", hospitalId: "3", hospitalName: "Farg'ona Viloyat Shifoxonasi", avatar: "ZE", status: "offline", lastSeen: "1 soat oldin", experience: 14, phone: "+998 93 987 65 43", email: "z.eshonova@fergana.med.uz" },
    { id: "d-nev-4", name: "Dr. Oybek Norboyev", specialty: "Nevrologiya", hospitalId: "6", hospitalName: "Namangan Nefteyogar Shifoxonasi", avatar: "ON", status: "online", lastSeen: "Hozir", experience: 7, phone: "+998 94 123 45 67", email: "o.norboyev@namangan.med.uz" },
  ],
  Ortopediya: [
    { id: "d-ort-2", name: "Dr. Firdavs Umarov", specialty: "Ortopediya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "FU", status: "offline", lastSeen: "2 soat oldin", experience: 13, phone: "+998 91 111 22 33", email: "f.umarov@samarkand.med.uz" },
    { id: "d-ort-3", name: "Dr. Gulnoza Toxirova", specialty: "Ortopediya", hospitalId: "7", hospitalName: "Qarshi Shifoxonasi", avatar: "GT", status: "online", lastSeen: "Hozir", experience: 9, phone: "+998 93 222 33 44", email: "g.toxirova@qarshi.med.uz" },
  ],
  Pediatriya: [
    { id: "d-ped-2", name: "Dr. Lola Karimova", specialty: "Pediatriya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "LK", status: "online", lastSeen: "Hozir", experience: 16, phone: "+998 91 333 44 55", email: "l.karimova@samarkand.med.uz" },
    { id: "d-ped-3", name: "Dr. Anvar Ismoilov", specialty: "Pediatriya", hospitalId: "8", hospitalName: "Nukus Bolalar Shifoxonasi", avatar: "AI", status: "busy", lastSeen: "Qabulda", experience: 12, phone: "+998 93 444 55 66", email: "a.ismoilov@nukus.med.uz" },
  ],
  Xirurgiya: [
    { id: "d-xir-2", name: "Dr. Shavkat Bobojonov", specialty: "Xirurgiya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "SB", status: "offline", lastSeen: "30 daqiqa oldin", experience: 18, phone: "+998 91 555 66 77", email: "s.bobojonov@samarkand.med.uz" },
    { id: "d-xir-3", name: "Dr. Nigora Azimova", specialty: "Xirurgiya", hospitalId: "9", hospitalName: "Kokand Jarrohiylik Markazi", avatar: "NA", status: "online", lastSeen: "Hozir", experience: 11, phone: "+998 93 666 77 88", email: "n.azimova@kokand.med.uz" },
  ],
  Ginekologiya: [
    { id: "d-gin-2", name: "Dr. Madina Toshpulatova", specialty: "Ginekologiya", hospitalId: "2", hospitalName: "Samarkand Tibbiyot Markazi", avatar: "MT", status: "online", lastSeen: "Hozir", experience: 14, phone: "+998 91 777 88 99", email: "m.toshpulatova@samarkand.med.uz" },
    { id: "d-gin-3", name: "Dr. Jahongir Qosimov", specialty: "Ginekologiya", hospitalId: "10", hospitalName: "Termiz Ayollar Shifoxonasi", avatar: "JQ", status: "offline", lastSeen: "3 soat oldin", experience: 6, phone: "+998 93 888 99 00", email: "j.qosimov@termiz.med.uz" },
  ],
};

export const groupChatMessages: GroupChatMessage[] = [
  { id: "gm1", senderId: "d-current", senderName: "Dr. Alisher Karimov", senderAvatar: "AK", senderHospital: "Toshkent Klinikasi", content: "Assalomu alaykum, hamkasblar! Bugun yangi ACC/AHA 2026 yurak yetishmovchiligi bo'yicha guideline chiqdi. Kim o'qidi?", time: "08:30", date: "2026-05-12", read: true },
  { id: "gm2", senderId: "d-card-2", senderName: "Dr. Rustam Tursunov", senderAvatar: "RT", senderHospital: "Samarkand Tibbiyot Markazi", content: "Va alaykum assalom! Ha, ko'rdim. SGLT2 ingibitorlarini birinchi qator terapiyaga kiritishdi. Biz Samarkandda allaqachon dapagliflozin bilan yaxshi natijalar olyapmiz.", time: "08:35", date: "2026-05-12", read: true },
  { id: "gm3", senderId: "d-card-4", senderName: "Dr. Nodira Rahimova", senderAvatar: "NR", senderHospital: "Andijon Respublika Shifoxonasi", content: "Qiziq! Biz Andijonda empagliflozin ishlatapmiz. NT-proBNP 35% gacha kamaydi 40+ bemorlarda. Lekin narxi muammo — ko'p bemorlar sotib ololmaydi.", time: "08:42", date: "2026-05-12", read: true },
  { id: "gm4", senderId: "d-card-5", senderName: "Dr. Bekzod Saidov", senderAvatar: "BS", senderHospital: "Buxoro Kardiologiya Markazi", content: "Buxoroda ham shu holat. Biz vaqtincha genericlar bilan ishlaymiz. Sifat unchalik farq qilmaydimi?", time: "08:50", date: "2026-05-12", read: true },
  { id: "gm5", senderId: "d-current", senderName: "Dr. Alisher Karimov", senderAvatar: "AK", senderHospital: "Toshkent Klinikasi", content: "Generic vs original — DAPA-HF tadqiqotida faqat original dapagliflozin sinovdan o'tgan. Lekin FDA-approved genericlar bo'lsa, bioekvivalentlik tasdiqlangan. Ishonsa bo'ladi.", time: "08:55", date: "2026-05-12", read: true },
  { id: "gm6", senderId: "d-card-3", senderName: "Dr. Dilshod Xalilov", senderAvatar: "DX", senderHospital: "Farg'ona Viloyat Shifoxonasi", content: "Hamkasblar, boshqa mavzu — kecha 28 yoshli bemor aorta disseksiyasi bilan keldi. CT angiografiya Stanford B tipi ko'rsatdi. Konservativ yoki endovaskulyar?", time: "09:10", date: "2026-05-12", read: true },
  { id: "gm7", senderId: "d-current", senderName: "Dr. Alisher Karimov", senderAvatar: "AK", senderHospital: "Toshkent Klinikasi", content: "Stanford B uncomplicated bo'lsa — konservativ, qon bosimni qattiq nazorat (SBP <120). Lekin 28 yosh juda yosh. Marfan sindromini tekshirdingizmi?", time: "09:15", date: "2026-05-12", read: true },
  { id: "gm8", senderId: "d-card-2", senderName: "Dr. Rustam Tursunov", senderAvatar: "RT", senderHospital: "Samarkand Tibbiyot Markazi", content: "Yosh bemorlar uchun genetik konsultatsiya ham tavsiya etiladi. Biz 2 yil oldin shunga o'xshash bemor ko'rdik — FBN1 gen mutatsiyasi chiqdi.", time: "09:20", date: "2026-05-12", read: true },
  { id: "gm9", senderId: "d-card-3", senderName: "Dr. Dilshod Xalilov", senderAvatar: "DX", senderHospital: "Farg'ona Viloyat Shifoxonasi", content: "Rahmat, Alisher aka va Rustam aka! Marfan uchun tekshiruv yuboraman. Genetik laboratoriya Farg'onada yo'q — Toshkentga yuborishga to'g'ri keladi.", time: "09:25", date: "2026-05-12", read: true },
  { id: "gm10", senderId: "d-card-4", senderName: "Dr. Nodira Rahimova", senderAvatar: "NR", senderHospital: "Andijon Respublika Shifoxonasi", content: "Dilshod aka, Andijonda ham shunaqa holat bor edi. Biz TEVAR (endovaskulyar aorta ta'mirlash) qildik. Agar kerak bo'lsa, bizning jamoamiz yordam bera oladi.", time: "09:30", date: "2026-05-12", read: true },
  { id: "gm11", senderId: "d-card-5", senderName: "Dr. Bekzod Saidov", senderAvatar: "BS", senderHospital: "Buxoro Kardiologiya Markazi", content: "TAVI mavzusiga qaytib — Buxoroda 15 ta operatsiya qildik. Bittasi transfemoral, qolganlari transapikal. Omon qolish 100%. Keyingi hafta yana 3 ta rejalashtirilgan.", time: "09:40", date: "2026-05-12", read: true },
  { id: "gm12", senderId: "d-current", senderName: "Dr. Alisher Karimov", senderAvatar: "AK", senderHospital: "Toshkent Klinikasi", content: "Ajoyib, Bekzod! Transfemoral yondashuvga o'tayotganingiz yaxshi. Bizda ham 80% transfemoral. Bemorlar tezroq tiklanadi.", time: "09:45", date: "2026-05-12", read: true },
  { id: "gm13", senderId: "d-card-2", senderName: "Dr. Rustam Tursunov", senderAvatar: "RT", senderHospital: "Samarkand Tibbiyot Markazi", content: "Yana bir savol — 65 yoshli bemor EKG'sida yangi ST segment ko'tarilishi bor, biroq troponin normal (3 soat oldin olingan). Echocardiografiya + qayta troponin 6 soatda to'g'rimi?", time: "09:50", date: "2026-05-12", read: false },
  { id: "gm14", senderId: "d-card-4", senderName: "Dr. Nodira Rahimova", senderAvatar: "NR", senderHospital: "Andijon Respublika Shifoxonasi", content: "Ha, to'g'ri. High-sensitivity troponin ishlatayapsizmi? hsTnI bo'lsa 1-soatlik algoritm ham bor — ESC 0/1h protokoli.", time: "09:55", date: "2026-05-12", read: false },
  { id: "gm15", senderId: "d-card-2", senderName: "Dr. Rustam Tursunov", senderAvatar: "RT", senderHospital: "Samarkand Tibbiyot Markazi", content: "Oddiy troponin. hsTnI reaktivlarimiz tugagan, buyurtma berganmiz. Hozircha standart protokol bilan davom etamiz. Rahmat!", time: "10:00", date: "2026-05-12", read: false },
];

export function getDoctorsForSpecialty(specialty: string): ChatDoctor[] {
  return chatDoctorsBySpecialty[specialty] || [];
}

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
