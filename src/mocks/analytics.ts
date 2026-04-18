export const mockDailyData = [
  { date: "Apr 12", patients: 245, appointments: 198, completed: 180 },
  { date: "Apr 13", patients: 312, appointments: 267, completed: 241 },
  { date: "Apr 14", patients: 289, appointments: 234, completed: 210 },
  { date: "Apr 15", patients: 356, appointments: 301, completed: 278 },
  { date: "Apr 16", patients: 298, appointments: 245, completed: 220 },
  { date: "Apr 17", patients: 334, appointments: 289, completed: 265 },
  { date: "Apr 18", patients: 312, appointments: 267, completed: 241 },
];

export const mockWeeklyData = [
  { date: "Hafta 1", patients: 1820, appointments: 1540, completed: 1390 },
  { date: "Hafta 2", patients: 2100, appointments: 1780, completed: 1620 },
  { date: "Hafta 3", patients: 1950, appointments: 1650, completed: 1480 },
  { date: "Hafta 4", patients: 2340, appointments: 1980, completed: 1810 },
  { date: "Hafta 5", patients: 2180, appointments: 1840, completed: 1670 },
  { date: "Hafta 6", patients: 2450, appointments: 2100, completed: 1920 },
];

export const mockMonthlyData = [
  { date: "Yan", patients: 7800, appointments: 6500, completed: 5900 },
  { date: "Fev", patients: 8200, appointments: 6900, completed: 6300 },
  { date: "Mar", patients: 9100, appointments: 7600, completed: 6900 },
  { date: "Apr", patients: 8700, appointments: 7200, completed: 6600 },
  { date: "May", patients: 9500, appointments: 7900, completed: 7200 },
  { date: "Iyn", patients: 8900, appointments: 7400, completed: 6800 },
  { date: "Iyl", patients: 9800, appointments: 8200, completed: 7500 },
  { date: "Avg", patients: 10200, appointments: 8600, completed: 7900 },
  { date: "Sen", patients: 9600, appointments: 8000, completed: 7300 },
  { date: "Okt", patients: 10500, appointments: 8800, completed: 8100 },
  { date: "Noy", patients: 9900, appointments: 8300, completed: 7600 },
  { date: "Dek", patients: 11200, appointments: 9400, completed: 8700 },
];

export const mockDoctorPerformance = [
  { name: "Dr. Nazarov", patients: 18, rating: 4.9, specialty: "Kardiologiya" },
  { name: "Dr. Xasanova", patients: 14, rating: 4.8, specialty: "Nevrologiya" },
  { name: "Dr. Tosheva", patients: 22, rating: 4.7, specialty: "Pediatriya" },
  { name: "Dr. Qodirov", patients: 11, rating: 4.6, specialty: "Ortopediya" },
  { name: "Dr. Yusupova", patients: 16, rating: 4.9, specialty: "Ginekologiya" },
];

export const mockTopHospitals = [
  { name: "Toshkent Klinik", patients: 312, max: 400 },
  { name: "Andijon Xalqaro", patients: 267, max: 400 },
  { name: "Samarqand Viloyat", patients: 198, max: 400 },
  { name: "Farg'ona Viloyat", patients: 176, max: 400 },
  { name: "Namangan Tibbiyot", patients: 145, max: 400 },
];

export const mockAuditLogs = [
  {
    id: "log1",
    user: "Sardor Yusupov",
    role: "HOSPITAL_ADMIN",
    action: "Bemor qo'shildi",
    target: "Aziz Karimov",
    timestamp: "2026-04-18 09:23:14",
    ip: "192.168.1.45",
  },
  {
    id: "log2",
    user: "Super Admin",
    role: "SUPER_ADMIN",
    action: "Kasalxona tahrirlandi",
    target: "Buxoro Shahar Shifoxonasi",
    timestamp: "2026-04-18 08:45:32",
    ip: "10.0.0.1",
  },
  {
    id: "log3",
    user: "Dr. Alisher Nazarov",
    role: "DOKTOR",
    action: "Tibbiy yozuv yangilandi",
    target: "Bobur Xolmatov",
    timestamp: "2026-04-17 16:12:08",
    ip: "192.168.1.78",
  },
  {
    id: "log4",
    user: "Dilnoza Karimova",
    role: "HOSPITAL_ADMIN",
    action: "Shifokor qo'shildi",
    target: "Dr. Kamola Yusupova",
    timestamp: "2026-04-17 14:30:55",
    ip: "192.168.2.12",
  },
  {
    id: "log5",
    user: "Super Admin",
    role: "SUPER_ADMIN",
    action: "Yangi kasalxona yaratildi",
    target: "Farg'ona Viloyat Klinikasi",
    timestamp: "2026-04-16 11:05:22",
    ip: "10.0.0.1",
  },
];
