/** Savol-javob qatori (bemor yo‘nalishi / skrining) */
export interface HAVisitQA {
  id: string;
  question: string;
  answer: string;
}

/** Chiqarilgan bemorda: AI tahlili, shifokor yozuvi, savol-javoblar */
export interface HADischargeRecord {
  aiDiagnosis: string;
  doctorNotes: string;
  qa: HAVisitQA[];
}

export interface HAPatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  doctorId: string;
  doctorName: string;
  lastVisit: string;
  nextVisit: string | null;
  diagnosis: string;
  status: 'active' | 'discharged' | 'scheduled';
  hospitalId: string;
  visitCount: number;
  /** Faqat status === 'discharged' bo‘lganda — arxiv va tahlil */
  dischargeRecord?: HADischargeRecord;
}

export const haPatients: HAPatient[] = [
  { id: 'pat-001', name: 'Sardor Umarov', phone: '+998 90 111 22 33', age: 45, gender: 'male', doctorId: 'doc-001', doctorName: 'Dr. Alisher Karimov', lastVisit: '2026-04-17', nextVisit: '2026-04-25', diagnosis: 'Gipertenziya', status: 'active', hospitalId: 'hosp-001', visitCount: 8 },
  {
    id: 'pat-002',
    name: 'Mohira Xasanova',
    phone: '+998 91 222 33 44',
    age: 32,
    gender: 'female',
    doctorId: 'doc-002',
    doctorName: 'Dr. Malika Yusupova',
    lastVisit: '2026-04-16',
    nextVisit: null,
    diagnosis: 'Migren',
    status: 'discharged',
    hospitalId: 'hosp-001',
    visitCount: 3,
    dischargeRecord: {
      aiDiagnosis:
        'Simptomlar migren profiliga mos: pulsatsiyali bosh og‘rig‘i, fotofobiya, avvalgi epizodlar. Ikkilamchi sabablar ehtimoli past. Tavsiya: profilaktika rejasini davom ettirish, og‘riq kundalikini kuzatish.',
      doctorNotes:
        'Bemor 3 haftalik terapiya bilan yaxshilandi. Sumatriptan PRN qoldirildi. Qayta qabul 3 oyda — faqat qayta paydo bo‘lsa. Ishga chiqishga ruxsat.',
      qa: [
        { id: 'pat-002-q1', question: 'Bosh og‘rig‘i qanday xarakterda?', answer: 'Pulsatsiyali, ko‘p hollarda chap tomonda' },
        { id: 'pat-002-q2', question: 'Yorug‘lik yoki ovozga sezgirlik bormi?', answer: 'Ha, yorug‘likdan xunuklashadi' },
        { id: 'pat-002-q3', question: 'Oxirgi 24 soatda og‘riq shiddati (0–10)?', answer: '2–3' },
        { id: 'pat-002-q4', question: 'Dori-darmonlarga allergiya?', answer: 'Yo‘q' },
      ],
    },
  },
  { id: 'pat-003', name: 'Ulugbek Qodirov', phone: '+998 93 333 44 55', age: 58, gender: 'male', doctorId: 'doc-003', doctorName: 'Dr. Bobur Toshmatov', lastVisit: '2026-04-18', nextVisit: '2026-04-30', diagnosis: 'Artrit', status: 'active', hospitalId: 'hosp-001', visitCount: 12 },
  { id: 'pat-004', name: 'Dilnoza Ergasheva', phone: '+998 94 444 55 66', age: 28, gender: 'female', doctorId: 'doc-004', doctorName: 'Dr. Nilufar Rashidova', lastVisit: '2026-04-15', nextVisit: '2026-04-22', diagnosis: 'Bronxit', status: 'scheduled', hospitalId: 'hosp-001', visitCount: 2 },
  { id: 'pat-005', name: 'Firdavs Normatov', phone: '+998 95 555 66 77', age: 67, gender: 'male', doctorId: 'doc-001', doctorName: 'Dr. Alisher Karimov', lastVisit: '2026-04-18', nextVisit: null, diagnosis: 'Yurak yetishmovchiligi', status: 'active', hospitalId: 'hosp-001', visitCount: 24 },
  { id: 'pat-006', name: 'Gulnora Tursunova', phone: '+998 97 666 77 88', age: 41, gender: 'female', doctorId: 'doc-006', doctorName: 'Dr. Zulfiya Nazarova', lastVisit: '2026-04-17', nextVisit: '2026-05-01', diagnosis: 'Ekzema', status: 'active', hospitalId: 'hosp-001', visitCount: 5 },
  { id: 'pat-007', name: 'Sherzod Alimov', phone: '+998 98 777 88 99', age: 35, gender: 'male', doctorId: 'doc-002', doctorName: 'Dr. Malika Yusupova', lastVisit: '2026-04-14', nextVisit: '2026-04-28', diagnosis: 'Epilepsiya', status: 'scheduled', hospitalId: 'hosp-001', visitCount: 7 },
  {
    id: 'pat-008',
    name: 'Barno Xolmatova',
    phone: '+998 99 888 99 00',
    age: 52,
    gender: 'female',
    doctorId: 'doc-003',
    doctorName: 'Dr. Bobur Toshmatov',
    lastVisit: '2026-04-18',
    nextVisit: null,
    diagnosis: 'Osteoporoz',
    status: 'discharged',
    hospitalId: 'hosp-001',
    visitCount: 9,
    dischargeRecord: {
      aiDiagnosis:
        'DXA bo‘yicha T-score -2.6 (kamaytirilgan mineral zichlik). Perimenopauza yoshi bilan mos. Sind murtak ehtimoli oshgan — yiqilishdan saqlanish muhim.',
      doctorNotes:
        'Kalsiy + D3 kursi 6 oy. Yurish chanasini tavsiya qilindi. Yiliga bir marta DXA nazorati. Og‘ir yuk ko‘tarmaslik.',
      qa: [
        { id: 'pat-008-q1', question: 'So‘nggi yilda sind yoki yiqilish bo‘ldimi?', answer: 'Yo‘q, lekin bel og‘rig‘i bor' },
        { id: 'pat-008-q2', question: 'Kunlik kalsiy iste’moli (taxminan)?', answer: 'Sut mahsulotlari kam' },
        { id: 'pat-008-q3', question: 'Harakatchanlik darajasi?', answer: 'Ofis ishi, kam harakat' },
        { id: 'pat-008-q4', question: 'Oila tarixida osteoporoz?', answer: 'Ona tomonda' },
      ],
    },
  },
  { id: 'pat-009', name: 'Nodir Yuldashev', phone: '+998 90 999 00 11', age: 23, gender: 'male', doctorId: 'doc-004', doctorName: 'Dr. Nilufar Rashidova', lastVisit: '2026-04-16', nextVisit: '2026-04-23', diagnosis: 'Astma', status: 'active', hospitalId: 'hosp-001', visitCount: 4 },
  {
    id: 'pat-010',
    name: 'Kamola Ismoilova',
    phone: '+998 91 000 11 22',
    age: 39,
    gender: 'female',
    doctorId: 'doc-006',
    doctorName: 'Dr. Zulfiya Nazarova',
    lastVisit: '2026-04-13',
    nextVisit: null,
    diagnosis: 'Psoriaz',
    status: 'discharged',
    hospitalId: 'hosp-001',
    visitCount: 6,
    dischargeRecord: {
      aiDiagnosis:
        'Tipik plakalar, PAS bilan tasdiqlangan psoriaz. Yengil-orta shakl. Biologik terapiya hozircha ko‘rsatmasiz; lokal GKS va vit D analoglari bilan nazorat yetarli.',
      doctorNotes:
        'Egzema bilan adashtirish istisno qilindi. 8 haftalik kurs yakunlandi. Dermatologga 6 oyda bir marta. Stress va alkogolni cheklash tavsiyasi.',
      qa: [
        { id: 'pat-010-q1', question: 'Tanalov qayerda lokalizatsiya?', answer: 'Tirsak va tizzada plakalar' },
        { id: 'pat-010-q2', question: 'Qo‘shimcha bo‘g‘im og‘rig‘i bormi (psoriatik artrit)?', answer: 'Yo‘q' },
        { id: 'pat-010-q3', question: 'Ichki organ tekshiruvlari (LFT) oxirgi natija?', answer: 'Normada' },
        { id: 'pat-010-q4', question: 'Uy sharoitida qanday dorilar ishlatildi?', answer: 'Krem GKS + namlovchi' },
      ],
    },
  },
  { id: 'pat-011', name: 'Ravshan Sobirov', phone: '+998 93 111 22 33', age: 48, gender: 'male', doctorId: 'doc-001', doctorName: 'Dr. Alisher Karimov', lastVisit: '2026-04-18', nextVisit: '2026-05-05', diagnosis: 'Stenokardiya', status: 'active', hospitalId: 'hosp-001', visitCount: 15 },
  { id: 'pat-012', name: 'Maftuna Qosimova', phone: '+998 94 222 33 44', age: 29, gender: 'female', doctorId: 'doc-002', doctorName: 'Dr. Malika Yusupova', lastVisit: '2026-04-17', nextVisit: '2026-04-24', diagnosis: 'Depressiya', status: 'scheduled', hospitalId: 'hosp-001', visitCount: 3 },
];
