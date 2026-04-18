# MedCore — Kasalxona Boshqaruv Tizimi

## 1. Loyiha Tavsifi
Ko'p kasalxonali SaaS-ga o'xshash boshqaruv tizimi. Super Admin barcha kasalxonalarni nazorat qiladi, Hospital Admin o'z kasalxonasini boshqaradi, Doktorlar bemorlar bilan ishlaydi. Bemorlar tizimga kirmaydi, lekin yozuvlar sifatida saqlanadi.

## 2. Sahifa Tuzilishi
- `/` — Dashboard (Super Admin bosh sahifasi)
- `/hospitals` — Kasalxonalar ro'yxati
- `/hospitals/:id` — Kasalxona tafsilotlari (tablar: Umumiy, Shifokorlar, Adminlar, Bemorlar, Tahlil, Sozlamalar)
- `/analytics` — Umumiy tahlil
- `/users` — Foydalanuvchilar (adminlar va shifokorlar)
- `/settings` — Sozlamalar (til, tema, profil, parol)
- `/login` — Kirish sahifasi

## 3. Asosiy Funksiyalar
- [x] Sidebar navigatsiya (Super Admin uchun)
- [x] Dashboard statistika kartalar
- [x] Kasalxonalar jadvali (CRUD)
- [x] Kasalxona qo'shish (slide-over panel)
- [x] Kasalxona tafsilotlari (tab navigatsiya)
- [x] Analytics grafiklar (kunlik/haftalik/oylik)
- [x] Foydalanuvchilar boshqaruvi
- [x] Sozlamalar (til, dark/light mode, profil)
- [ ] JWT autentifikatsiya (Supabase bilan)
- [ ] Rolga asoslangan kirishni boshqarish
- [ ] Audit jurnallari
- [ ] Xabarnoma tizimi
- [ ] Uchrashuv/navbat tizimi

## 4. Rollar
| Rol | Huquqlar |
|-----|----------|
| SUPER_ADMIN | Barcha kasalxonalar, foydalanuvchilar, tahlil |
| HOSPITAL_ADMIN | Faqat o'z kasalxonasi |
| DOKTOR | Bemorlar, uchrashuvlar |
| QABULXONA | Bemorlar oqimi |

## 5. Ma'lumotlar Modeli (Mock)
- hospitals: id, name, address, phone, doctorsCount, dailyPatients, status
- doctors: id, hospitalId, name, specialty, phone, status
- patients: id, name, phone, dob, hospitalId, history[]
- users: id, role, name, phone, hospitalId
- appointments: id, patientId, doctorId, date, status
- auditLogs: id, userId, action, target, timestamp

## 6. Backend / Integratsiya Rejasi
- Supabase: Auth (JWT), Database (PostgreSQL), Edge Functions
- Hozircha: Mock data bilan to'liq UI

## 7. Rivojlantirish Bosqichlari

### Bosqich 1: UI Asosi (Hozirgi)
- Maqsad: Barcha sahifalar UI mock data bilan
- Natija: To'liq ko'rinadigan, navigatsiya qilinadigan tizim

### Bosqich 2: Autentifikatsiya
- Maqsad: Login sahifasi, JWT, rolga asoslangan yo'naltirish
- Natija: Xavfsiz kirish tizimi

### Bosqich 3: Backend Integratsiya
- Maqsad: Supabase bilan real ma'lumotlar
- Natija: To'liq ishlaydigan tizim
