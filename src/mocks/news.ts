export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  specialty: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  readTime: string;
  isNew: boolean;
  tags: string[];
}

export const specialtyNews: Record<string, NewsItem[]> = {
  Kardiologiya: [
    {
      id: "card-1",
      title: "Yangi miya yurak infarktini oldindan aytish texnologiyasi ishlab chiqildi",
      summary:
        "G'arbiy olimlar erta bosqichda yurak infarkti xavfini 94% aniqlik bilan bashorat qiluvchi AI modelini taqdim etdi.",
      content:
        "Boston ilmiy markazi tadqiqotchilari tomonidan ishlab chiqilgan yangi neyron tarmoq modeli, EKG ma'lumotlarini tahlil qilish orqali yurak infarkti xavfini 48 soat oldin aytib berish qobiliyatiga ega. Bu texnologiya klinik sinovlarda 94% aniqlik ko'rsatdi va yaqin yillarda qo'llashga ruxsat olishi kutilmoqda.",
      category: "Yangi tadqiqot",
      specialty: "Kardiologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=modern%20cardiovascular%20medical%20research%20laboratory%20with%20heart%20monitoring%20screens%20displaying%20ECG%20waveforms%20clean%20white%20interior%20with%20soft%20blue%20lighting%20professional%20medical%20environment%20high%20tech%20equipment&width=600&height=400&seq=card-news-1&orientation=landscape",
      source: "Medical Journal of Cardiology",
      publishedAt: "2026-05-10",
      readTime: "4 daqiqa",
      isNew: true,
      tags: ["AI", "Yurak infarkti", "EKG"],
    },
    {
      id: "card-2",
      title: "Yurak yetishmovchiligi davolashda gen terapiya muvaffaqiyati",
      summary:
        "Birinchi marta gen terapiya yurak yetishmovchiligi bilan og'rigan bemorlarda yurak funksiyasini sezilarli yaxshiladi.",
      content:
        "Oxford universiteti va BioHeart kompaniyasi hamkorligida o'tkazilgan III fazali klinik sinovlar natijalari e'lon qilindi. Gen terapiya BNP genini o'tkazish orqali yurak mushaklarining qayta tiklanishini rag'batlantirdi. 240 nafar ishtirokchi bilan o'tkazilgan tadqiqotda, davolangan bemorlarning 68% da yurak chiqarish ulushi (EF) 15% ga oshdi.",
      category: "Gen terapiya",
      specialty: "Kardiologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=gene%20therapy%20concept%20for%20heart%20disease%20treatment%20microscopic%20view%20of%20DNA%20strands%20and%20heart%20cells%20merging%20with%20golden%20particles%20soft%20bokeh%20background%20medical%20innovation%20visualization&width=600&height=400&seq=card-news-2&orientation=landscape",
      source: "Oxford Medical Review",
      publishedAt: "2026-05-08",
      readTime: "5 daqiqa",
      isNew: true,
      tags: ["Gen terapiya", "Yurak yetishmovchiligi", "III faza"],
    },
    {
      id: "card-3",
      title: "Minimal invaziv aortal klapan almashtirish texnikasi takomillashtirildi",
      summary:
        "TAVI operatsiyasida yangi 3D navigatsiya tizimi implanatatsiya aniqligini 23% ga oshirdi.",
      content:
        "Medtronic kompaniyasi tomonidan ishlab chiqilgan EnVeo R navigatsiya tizimi, real vaqt rejimida 3D intrakardial ekoxardiografiya va kompyuter tomografiya ma'lumotlarini birlashtiradi. Bu tizim TAVI operatsiyalarida klapan pozitsiyalashtirish xatolarini kamaytirishga yordam beradi. 15 ta markazda 500 dan ortiq operatsiyada sinab ko'rilgan.",
      category: "Texnologiya",
      specialty: "Kardiologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=minimally%20invasive%20heart%20valve%20replacement%20surgery%203D%20navigation%20system%20in%20operating%20room%20holographic%20heart%20visualization%20on%20medical%20display%20surgeons%20in%20modern%20OR%20with%20advanced%20technology%20soft%20blue%20lighting&width=600&height=400&seq=card-news-3&orientation=landscape",
      source: "Interventional Cardiology Today",
      publishedAt: "2026-05-05",
      readTime: "3 daqiqa",
      isNew: false,
      tags: ["TAVI", "3D navigatsiya", "Aortal klapan"],
    },
    {
      id: "card-4",
      title: "Statinlarning yangi avlodini qabul qilish rejimi optimallashtirildi",
      summary:
        "Kundalik emas, haftalik statin qabul qilish sxemasi samaradorlikni saqlab, yon ta'sirlarni 40% kamaytiradi.",
      content:
        "Yangi meta-tahlil 12 ta tadqiqotdan 45,000 bemor ma'lumotlarini o'z ichiga oladi. Haftada ikki marta yuqori dozali rosuvastatin qabul qilish, kundalik o'rtacha dozali qabul bilan tenglip-tengsiz LDL kolesterolini pasaytirishni ta'minlaydi, biroq mushak og'riqlari va transaminazalar oshishini 40% ga kamaytiradi.",
      category: "Farmakoterapiya",
      specialty: "Kardiologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=modern%20pharmaceutical%20research%20laboratory%20with%20statin%20pills%20and%20heart%20health%20concept%20clean%20white%20surface%20with%20medication%20bottles%20and%20heart%20model%20soft%20natural%20lighting%20medical%20professional%20environment&width=600&height=400&seq=card-news-4&orientation=landscape",
      source: "European Heart Journal",
      publishedAt: "2026-05-01",
      readTime: "6 daqiqa",
      isNew: false,
      tags: ["Statinlar", "Kolesterol", "Meta-tahlil"],
    },
    {
      id: "card-5",
      title: "Arterial gipertenziyada tuz cheklashining haqiqiy foydasi aniqlangan",
      summary:
        "500 ming kishilik kohorta tadqiqoti 5 gr dan kam tuz iste'mol qilinishi zararli ekanligini ko'rsatdi.",
      content:
        "Londondagi Imperial College tomonidan o'tkazilgan katta masshtabli kohorta tadqiqot shuni ko'rsatdiki, kunlik tuz iste'moli 5-7 g oralig'ida bo'lganda yurak-qon tomir tizimi sog'ligi optimal darajada bo'ladi. 5 g dan kam tuz iste'moli qiluvlarda yurak xurujlari va insult xavfi nisbatan oshgan. Bu natijalar WHO tavsiyalarini qayta ko'rib chiqishni talab qiladi.",
      category: "Epidemiologiya",
      specialty: "Kardiologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=salt%20consumption%20and%20heart%20health%20concept%20healthy%20food%20with%20vegetables%20and%20herbs%20on%20wooden%20table%20blood%20pressure%20monitor%20in%20background%20soft%20warm%20lighting%20nutritional%20science%20visualization&width=600&height=400&seq=card-news-5&orientation=landscape",
      source: "The Lancet Cardiology",
      publishedAt: "2026-04-28",
      readTime: "5 daqiqa",
      isNew: false,
      tags: ["Gipertenziya", "Tuz", "Kohorta"],
    },
  ],
  Nevrologiya: [
    {
      id: "nev-1",
      title: "Altsgeymer kasalligida yangi monoclonal antitelo muvaffaqiyatli sinovdan o'tdi",
      summary:
        "Lecanemabning III fazali natijalari 27% kognitiv pasayishni sekinlashtirganligini tasdiqladi.",
      content:
        "Eisai va Biogen kompaniyalari tomonidan o'tkazilgan Clarity AD tadqiqoti yakuniy natijalarini e'lon qildi. 1796 nafar erkin yashovchi yengil o'rtacha darajadagi Altsgeymer bilan og'rigan bemorlarda 18 oylik kuzatuv natijalariga ko'ra, lecanemab kognitiv va funktsional pasayishni 27% ga sekinlashtirdi.",
      category: "Yangi dori",
      specialty: "Nevrologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=Alzheimer%20disease%20research%20concept%20brain%20scan%20with%20neural%20pathways%20highlighted%20in%20blue%20and%20purple%20colors%20laboratory%20setting%20with%20microscope%20slides%20soft%20clinical%20lighting%20modern%20medical%20research&width=600&height=400&seq=nev-news-1&orientation=landscape",
      source: "Neurology Today",
      publishedAt: "2026-05-09",
      readTime: "5 daqiqa",
      isNew: true,
      tags: ["Altsgeymer", "Monoclonal antitelo", "III faza"],
    },
    {
      id: "nev-2",
      title: "Miya insultini 3 daqiqada aniqlaydigan mobil ilova sinab ko'rildi",
      summary:
        "Yuz ifodalarini tahlil qiluvchi AI algoritm 96% aniqlik bilan insultni oldindan aytib beradi.",
      content:
        "Johns Hopkins universiteti tadqiqotchilari tomonidan ishlab chiqilgan Face2Stroke ilovasi, bemorning yuz ifodalarini smartfon kamerasi orqali tahlil qiladi va insult belgilarini 3 daqiqada aniqlaydi. 1200 nafar bemorda sinab ko'rilgan ilova, 96% sezgirlik va 94% spetsifiklik ko'rsatkichiga erishdi.",
      category: "AI texnologiya",
      specialty: "Nevrologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=smartphone%20app%20for%20stroke%20detection%20with%20face%20recognition%20technology%20modern%20medical%20AI%20concept%20person%20holding%20phone%20showing%20facial%20analysis%20interface%20clean%20white%20background%20soft%20lighting&width=600&height=400&seq=nev-news-2&orientation=landscape",
      source: "Stroke Journal",
      publishedAt: "2026-05-06",
      readTime: "3 daqiqa",
      isNew: true,
      tags: ["AI", "Insult", "Mobil ilova"],
    },
    {
      id: "nev-3",
      title: "Parkinson kasalligida chuqur miya stimulyatsiyasi natijalari 10 yillik kuzatuvda",
      summary:
        "DBS terapiyasi 10 yil davomida motor simptomlarni 50% ga kamaytirishni ta'minladi.",
      content:
        "Stockholm Karolinska institutida o'tkazilgan uzun muddatli kuzatuv tadqiqoti shuni ko'rsatdiki, subtalamik yadroga chuqur miya stimulyatsiyasi (DBS) o'rnatilgan Parkinson bemorlarida 10 yillik davr motor simptomlarini 50% ga kamaytirishda davom etmoqda. Biroq kognitiv pasayish va depressiya xavfi oshganligi qayd etildi.",
      category: "Klinik tadqiqot",
      specialty: "Nevrologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=deep%20brain%20stimulation%20DBS%20surgery%20concept%20transparent%20brain%20visualization%20with%20electrodes%20modern%20neurology%20operating%20room%20with%20brain%20mapping%20displays%20soft%20blue%20surgical%20lighting&width=600&height=400&seq=nev-news-3&orientation=landscape",
      source: "Movement Disorders",
      publishedAt: "2026-04-30",
      readTime: "7 daqiqa",
      isNew: false,
      tags: ["Parkinson", "DBS", "Uzun muddatli kuzatuv"],
    },
    {
      id: "nev-4",
      title: "Epilepsiya davolashda yuqori tezlikli tRTMS samaradorligi tasdiqlandi",
      summary:
        "Yuqori tezlikli takroriy transkranial magnit stimulyatsiyasi dori-rezistent epilepsiyada 60% ga samarali.",
      content:
        "Maya Clinic tadqiqotchilari tomonidan o'tkazilgan randomized nazoratlangan sinovda, 10 Hz tezlikdagi tRTMS protokoli dori-rezistent fokal epilepsiyada 60% bemorlarda sezilarli zarralashishni ko'rsatdi. Bu an'anaviy 1 Hz protokolga qaraganda 3 barobar samaraliroq ekanligi aniqlandi.",
      category: "Neyrostimulyatsiya",
      specialty: "Nevrologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=transcranial%20magnetic%20stimulation%20TMS%20therapy%20for%20epilepsy%20patient%20sitting%20in%20medical%20chair%20with%20TMS%20coil%20near%20head%20modern%20neurology%20clinic%20with%20advanced%20equipment%20soft%20neutral%20lighting&width=600&height=400&seq=nev-news-4&orientation=landscape",
      source: "Epilepsia",
      publishedAt: "2026-04-25",
      readTime: "4 daqiqa",
      isNew: false,
      tags: ["Epilepsiya", "tRTMS", "Dori-rezistent"],
    },
  ],
  Ortopediya: [
    {
      id: "ort-1",
      title: "3D chop etilgan biologik implantlar suyak tiklanishini 40% tezlashtirdi",
      summary:
        "Bioplastikdan chop etilgan maxsus strukturali implantlar suyak hujayralarining o'sishini sezilarli oshirdi.",
      content:
        "ETH Zurich tadqiqotchilari tomonidan ishlab chiqilgan yangi bioplastik materialdan chop etilgan implantlar, mikro-porlar tuzilishi orqali suyak hujayralarining o'sishini va qon tomirlari hosil bo'lishini 40% tezlashtirdi. 50 ta hayvon modellarida o'tkazilgan tadqiqotda 12 haftada to'liq suyak tiklanishi kuzatildi.",
      category: "Biomaterial",
      specialty: "Ortopediya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=3D%20printed%20biological%20bone%20implant%20with%20porous%20structure%20medical%20laboratory%20setting%20with%203D%20printer%20and%20bone%20models%20soft%20white%20lighting%20orthopedic%20innovation%20concept&width=600&height=400&seq=ort-news-1&orientation=landscape",
      source: "Acta Biomaterialia",
      publishedAt: "2026-05-07",
      readTime: "5 daqiqa",
      isNew: true,
      tags: ["3D chop etish", "Bioplastik", "Suyak implant"],
    },
    {
      id: "ort-2",
      title: "Tizzi protezini robotik implantatsiya natijalari 5 yillik kuzatuvda",
      summary:
        "ROBOTKA tizimi tizza protezi joylashishini aniqrogini va 15% kamroq reoperatsiyani ta'minladi.",
      content:
        "Zimmer Biomet kompaniyasining ROSA Knee tizimi 5 yillik uzun muddatli kuzatuv natijalarini taqdim etdi. Robotik yordam bilan o'rnatilgan tizza protezlarining 95% i aniq joylashuvda bo'lib, reoperatsiya tezligi an'anaviy usulga qaraganda 15% pastroq edi. Bemorlarning 90% i funktsional natijalardan qoniqishini bildirdi.",
      category: "Robotik jarrohlik",
      specialty: "Ortopediya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=robotic%20knee%20replacement%20surgery%20in%20modern%20operating%20room%20robotic%20arm%20precision%20tool%20near%20patient%20leg%20advanced%20orthopedic%20surgery%20technology%20clean%20OR%20with%20blue%20lighting&width=600&height=400&seq=ort-news-2&orientation=landscape",
      source: "Journal of Bone and Joint Surgery",
      publishedAt: "2026-05-02",
      readTime: "4 daqiqa",
      isNew: true,
      tags: ["Robotik jarrohlik", "Tizza protezi", "ROSA"],
    },
    {
      id: "ort-3",
      title: "Sport travmalari davolashida PRP terapiyaning haqiqiy foydasi",
      summary:
        "Yangi randomizatsiyalangan tadqiqot PRP ning tendinopatiyada aniq foydali ekanligini tasdiqladi.",
      content:
        "Oslo universitet shifoxonasi tomonidan o'tkazilgan katta RCT tadqiqotida, PRP (boyitilgan trombositli plasma) bilan davolangan rotator manjali tendinopatiyali bemorlarda 6 oy davomida og'riq kamayishi va funktsional tiklanish an'anaviy fizioterapiyaga qaraganda 25% yuqori bo'lganligi aniqlandi.",
      category: "Regenerativ tibbiyot",
      specialty: "Ortopediya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=PRP%20platelet%20rich%20plasma%20therapy%20for%20sports%20injury%20shoulder%20tendon%20treatment%20modern%20orthopedic%20clinic%20with%20centrifuge%20and%20injection%20preparation%20soft%20clinical%20lighting&width=600&height=400&seq=ort-news-3&orientation=landscape",
      source: "American Journal of Sports Medicine",
      publishedAt: "2026-04-20",
      readTime: "5 daqiqa",
      isNew: false,
      tags: ["PRP", "Tendinopatiya", "Sport travmalari"],
    },
    {
      id: "ort-4",
      title: "Osteoporoz oldini olishda vitamin D va kalciy kombinatsiyasi optimallashtirildi",
      summary:
        "Haftada ikki marta yuqori dozali vitamin D va kundalik kalciy suyak zichligini 18% oshiradi.",
      content:
        "Melburn universiteti tomonidan o'tkazilgan meta-tahlil 25 ta tadqiqotdan 65,000 postmenopauzal ayol ma'lumotlarini o'z ichiga oladi. Natijalar shuni ko'rsatdiki, haftada 50,000 IU vitamin D3 va 1200 mg kalciy kombinatsiyasi 2 yil davomida suyak zichligini 18% ga oshiradi va qo'l-suyak sinish xavfini 30% kamaytiradi.",
      category: "Preventsion tibbiyot",
      specialty: "Ortopediya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=vitamin%20D%20calcium%20and%20bone%20health%20concept%20healthy%20bones%20visualization%20with%20calcium%20supplements%20and%20sunlight%20natural%20warm%20lighting%20wellness%20and%20prevention%20medical%20concept&width=600&height=400&seq=ort-news-4&orientation=landscape",
      source: "Osteoporosis International",
      publishedAt: "2026-04-15",
      readTime: "4 daqiqa",
      isNew: false,
      tags: ["Osteoporoz", "Vitamin D", "Kalciy"],
    },
  ],
  Pediatriya: [
    {
      id: "ped-1",
      title: "Bolalarda RSV infeksiyasiga qarshi yangi vaksina tasdiqlandi",
      summary:
        "Abrysvo vaksinasi 6 oylik bolalarda RSV bilan bog'liq pnevmoniyani 85% oldini oldi.",
      content:
        "FDA tomonidan 2026-yil may oyida tasdiqlangan Abrysvo vaksinasi, 6 oylik bolalarda respirator sinstisial virus (RSV) bilan bog'liq pnevmoniya va bronxilit xavfini 85% ga kamaytirishni ko'rsatdi. Pfizer kompaniyasi tomonidan ishlab chiqilgan bu vaksina ikki dozali sxemada qo'llaniladi va 6 oygacha himoya ta'minlaydi.",
      category: "Vaksinatsiya",
      specialty: "Pediatriya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=pediatric%20vaccination%20concept%20caring%20doctor%20administering%20vaccine%20to%20baby%20modern%20clean%20pediatric%20clinic%20with%20soft%20pastel%20colors%20warm%20natural%20lighting%20child%20healthcare&width=600&height=400&seq=ped-news-1&orientation=landscape",
      source: "Pediatrics",
      publishedAt: "2026-05-10",
      readTime: "4 daqiqa",
      isNew: true,
      tags: ["RSV", "Vaksina", "Bolalar"],
    },
    {
      id: "ped-2",
      title: "Bolalarda otiizm spektri buzilishlarini 18 oylik davrda aniqlash usuli",
      summary:
        "Yangi skrinning vositasi bolalarning ko'z harakatlari va ijtimoiy javoblarni tahlil qiladi.",
      content:
        "MIT Media Lab va Boston bolalar shifoxonasi hamkorligida ishlab chiqilgan EyeSocial tizimi, 18-24 oylik bolalarning ko'z harakatlari va ijtimoiy stimuluslarga javoblarini kamera orqali tahlil qiladi. 800 ta bolada sinab ko'rilgan usul, otiizm spektri buzilishlarini 88% aniqlik bilan oldindan aytib berdi.",
      category: "Skrinning",
      specialty: "Pediatriya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=autism%20screening%20technology%20for%20toddlers%20eye%20tracking%20system%20in%20modern%20pediatric%20research%20center%20child%20friendly%20environment%20with%20colorful%20soft%20toys%20and%20digital%20displays%20warm%20lighting&width=600&height=400&seq=ped-news-2&orientation=landscape",
      source: "JAMA Pediatrics",
      publishedAt: "2026-05-04",
      readTime: "5 daqiqa",
      isNew: true,
      tags: ["Otiizm", "Skrinning", "Ko'z kuzatuv"],
    },
    {
      id: "ped-3",
      title: "Bolalarda antibiotiklardan keyin probiotik terapiya foydali ekanligi",
      summary:
        "Antibiotik kursidan keyin probiotiklar ishlatish ichak mikrobiotasini tezroq tiklaydi.",
      content:
        "Stanford universiteti tadqiqotchilari tomonidan o'tkazilgan tadqiqotda, antibiotik kursini tugatgan bolalarda 4 hafta davomida probiotik kompleks (Lactobacillus + Bifidobacterium) ishlatilishi ichak mikrobiota diversitetini 60% ga oshirdi va antibiotik bilan bog'liq ishal xavfini 45% kamaytirdi.",
      category: "Mikrobiota",
      specialty: "Pediatriya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=probiotic%20therapy%20for%20children%20after%20antibiotics%20concept%20colorful%20probiotic%20capsules%20and%20healthy%20gut%20microbiome%20visualization%20modern%20pediatric%20nutrition%20soft%20bright%20lighting&width=600&height=400&seq=ped-news-3&orientation=landscape",
      source: "Gut Microbes",
      publishedAt: "2026-04-22",
      readTime: "3 daqiqa",
      isNew: false,
      tags: ["Probiotiklar", "Antibiotiklar", "Ichak mikrobiota"],
    },
    {
      id: "ped-4",
      title: "Bolalarda astma boshqaruvida smart inhalatorlar samaradorligi",
      summary:
        "Bluetooth inhalatorlar 7-12 yoshli bolalarda astma nazoratini 35% yaxshiladi.",
      content:
        "Sydney bolalar shifoxonasi tomonidan o'tkazilgan nazoratli tadqiqotda, Propeller Health smart inhalatorlari ishlatilgan 7-12 yoshli bolalarda 6 oy davomida astma nazoratini 35% yaxshilaganligi aniqlandi. Sensorlar nafas olish texnikasini kuzatib, ota-onalarga real vaqt rejimida ma'lumot yetkazib berdi.",
      category: "Digital tibbiyot",
      specialty: "Pediatriya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=smart%20inhalator%20for%20children%20with%20asthma%20Bluetooth%20connected%20modern%20pediatric%20healthcare%20child%20using%20digital%20inhaler%20with%20smartphone%20app%20soft%20clean%20medical%20environment&width=600&height=400&seq=ped-news-4&orientation=landscape",
      source: "Journal of Asthma",
      publishedAt: "2026-04-18",
      readTime: "4 daqiqa",
      isNew: false,
      tags: ["Astma", "Smart inhalator", "Bolalar"],
    },
  ],
  Xirurgiya: [
    {
      id: "xir-1",
      title: "Yangi monofilament absorable qo'shimcha samarali tikish materiali",
      summary:
        "Yangi biosintetik sutur materiali infeksiya xavfini 30% ga kamaytiradi va tezroq so'nadi.",
      content:
        "Ethicon kompaniyasi tomonidan ishlab chiqilgan Biosyn Plus monofilament sutur, an'anaviy poliglikolik kislota suturlarga qaraganda 30% tezroq absorable bo'lib, jarrohiy joy infeksiyasi xavfini 30% kamaytiradi. 12 ta markazda 800 ta abdominal operatsiyada sinab ko'rilgan.",
      category: "Jarrohiy material",
      specialty: "Xirurgiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=modern%20surgical%20suture%20material%20close%20up%20monofilament%20absorbable%20thread%20on%20sterile%20medical%20tray%20with%20surgical%20instruments%20soft%20clinical%20lighting%20medical%20innovation&width=600&height=400&seq=xir-news-1&orientation=landscape",
      source: "Surgical Infections",
      publishedAt: "2026-05-08",
      readTime: "3 daqiqa",
      isNew: true,
      tags: ["Sutur", "Absorable", "Infeksiya oldini olish"],
    },
    {
      id: "xir-2",
      title: "Virtual reallik jarrohlar tayyorlashda samaradorlikni oshirdi",
      summary:
        "VR simulyatorlarida mashq qilgan jarrohlar real operatsiyada 25% kamroq xato qildi.",
      content:
        "Oxfam Virtual Surgery Lab tomonidan ishlab chiqilgan VR simulyator tizimi, jarrohlar rezidentlari uchun laparoskopik xirurgiya mashqlarini taqdim etdi. Randomizatsiyalangan tadqiqotda VR guruhidagi rezidentlar real cho'chqa modellarida 25% kamroq xato va 20% tezroq operatsiya vaqtini ko'rsatdi.",
      category: "Ta'lim",
      specialty: "Xirurgiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=virtual%20reality%20surgical%20training%20surgeon%20wearing%20VR%20headset%20practicing%20laparoscopic%20surgery%20in%20modern%20simulation%20center%20holographic%20patient%20display%20soft%20blue%20lighting&width=600&height=400&seq=xir-news-2&orientation=landscape",
      source: "Annals of Surgery",
      publishedAt: "2026-05-01",
      readTime: "4 daqiqa",
      isNew: true,
      tags: ["VR", "Jarroh ta'limi", "Simulyator"],
    },
    {
      id: "xir-3",
      title: "Onkologik jarrohlikda intraoperatsion radioyog'ochilash samaradorligi",
      summary:
        "IORT tizimi ko'krak saratonida qayta nashr etilishini 50% ga kamaytiradi.",
      content:
        "Sant'Orsola shifoxonasi (Bolonya) tomonidan o'tkazilgan 10 yillik kuzatuv tadqiqotida, intraoperatsion radiatsion terapiya (IORT) bilan davolangan ko'krak saraton bemorlarida lokal qayta nashr etilish 50% ga kamayganligi va 5 yillik omon qolish 15% oshganligi aniqlandi.",
      category: "Onkoxirurgiya",
      specialty: "Xirurgiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=intraoperative%20radiation%20therapy%20IORT%20for%20breast%20cancer%20modern%20oncology%20operating%20room%20with%20radiation%20equipment%20precision%20medical%20technology%20clean%20sterile%20environment&width=600&height=400&seq=xir-news-3&orientation=landscape",
      source: "Cancer Surgery",
      publishedAt: "2026-04-25",
      readTime: "5 daqiqa",
      isNew: false,
      tags: ["IORT", "Ko'krak saraton", "Radioterapiya"],
    },
    {
      id: "xir-4",
      title: "Anesteziyada EEG monitoringi yengil kognitiv buzilishlarni oldini oladi",
      summary:
        "Processed EEG (pEEG) monitoringi 65 yoshdan kattalarda postoperatsion deliriumni 40% kamaytiradi.",
      content:
        "Vena tibbiyot universiteti tomonidan o'tkazilgan meta-tahlilda, processed EEG (pEEG) asosida anesteziya chuqurligini nazorat qilish, 65 yoshdan katta bemorlarda postoperatsion delirium xavfini 40% ga kamaytirishni ko'rsatdi. BIS indeksi 40-60 oralig'ida saqlash tavsiya etiladi.",
      category: "Anesteziologiya",
      specialty: "Xirurgiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=EEG%20brain%20monitoring%20during%20anesthesia%20surgery%20modern%20operating%20room%20with%20brain%20wave%20displays%20and%20anesthesia%20equipment%20soft%20clinical%20lighting%20patient%20safety%20monitoring&width=600&height=400&seq=xir-news-4&orientation=landscape",
      source: "Anesthesiology",
      publishedAt: "2026-04-12",
      readTime: "4 daqiqa",
      isNew: false,
      tags: ["EEG", "Delirium", "Anesteziya monitoring"],
    },
  ],
  Ginekologiya: [
    {
      id: "gin-1",
      title: "Endometrioz diagnostikasida yuqori aniqlikli MRI protokoli ishlab chiqildi",
      summary:
        "Yangi 3Tesla MRI tizimi endometriozni 92% aniqlik bilan oldindan aytib beradi.",
      content:
        "Leuven universiteti radiologiya bo'limi tomonidan ishlab chiqilgan maxsus 3T MRI protokoli, DEEP (Deep Endometriosis Evaluation Protocol) endometriozni oldindan aniqlash aniqligini 92% ga yetkazdi. Bu laparoskopiya bilan tasdiqlangan 300 ta bemor ma'lumotlarida sinab ko'rilgan.",
      category: "Diagnostika",
      specialty: "Ginekologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=advanced%20pelvic%20MRI%20for%20endometriosis%20diagnosis%20modern%20radiology%20room%20with%203Tesla%20MRI%20machine%20and%20pelvic%20scan%20display%20clean%20medical%20imaging%20center%20soft%20white%20lighting&width=600&height=400&seq=gin-news-1&orientation=landscape",
      source: "European Journal of Radiology",
      publishedAt: "2026-05-09",
      readTime: "5 daqiqa",
      isNew: true,
      tags: ["MRI", "Endometrioz", "Diagnostika"],
    },
    {
      id: "gin-2",
      title: "HPV vaksinasining 20 yillik himoyasi tasdiqlandi",
      summary:
        "Gardasil-9 vaksinasi 20 yil davomida serviks saratoniga qarshi 97% himoya ta'minlaydi.",
      content:
        "Gardasil-9 HPV vaksinasining uzun muddatli kuzatuv natijalari 20 yillik davrda serviks intraepitelial neoplaziya (CIN) va serviks saratoniga qarshi 97% himoya ta'minlaydi. Bu natijalar CDC tomonidan yangi vaksinatsiya tavsiyalarini yangilash asosini tashkil etdi.",
      category: "Vaksinatsiya",
      specialty: "Ginekologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=HPV%20vaccination%20long%20term%20protection%20concept%20modern%20gynecology%20clinic%20with%20vaccination%20supplies%20and%20cervical%20health%20education%20materials%20soft%20clinical%20lighting%20preventive%20healthcare&width=600&height=400&seq=gin-news-2&orientation=landscape",
      source: "Journal of Clinical Oncology",
      publishedAt: "2026-05-03",
      readTime: "4 daqiqa",
      isNew: true,
      tags: ["HPV", "Vaksina", "Serviks saraton"],
    },
    {
      id: "gin-3",
      title: "Menopauza davrida gormonal terapiyaning yangi yondashuvi",
      summary:
        "Transdermal estradiol + progesteron kombinatsiyasi yurak-qon tomir xavfini 25% kamaytiradi.",
      content:
        "Helsinki universiteti tomonidan o'tkazilgan WHI davomiy tadqiqot tahlili shuni ko'rsatdiki, transdermal estradiol (50 mcg/kun) bilan og'iz orqali progesteron (200 mg/12 hafta) kombinatsiyasi, 50-59 yoshli ayollarda yurak-qon tomir hodisalari xavfini 25% kamaytiradi. Bu an'anaviy og'iz orqali kombinatsiyalarga qaraganda xavfsizroq ekanligi aniqlandi.",
      category: "Gormon terapiya",
      specialty: "Ginekologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=menopausal%20hormone%20therapy%20concept%20transdermal%20estrogen%20patch%20and%20natural%20progesterone%20supplements%20modern%20gynecology%20treatment%20soft%20warm%20lighting%20womens%20health&width=600&height=400&seq=gin-news-3&orientation=landscape",
      source: "Menopause",
      publishedAt: "2026-04-28",
      readTime: "6 daqiqa",
      isNew: false,
      tags: ["Menopauza", "MHT", "Transdermal"],
    },
    {
      id: "gin-4",
      title: "Bepushtlik davolashida yengil stimulyatsiya protokolining samaradorligi",
      summary:
        "Yengil ovulyatsiya stimulyatsiyasi yuqori javob beruvchanlikni saqlab qoldi va OHSS xavfini 60% kamaytirdi.",
      content:
        "Zurich universiteti reproduktiv markazi tomonidan o'tkazilgan RCT tadqiqotida, yengil stimulyatsiya protokoli (Letrozole + kam dozali FSH) an'anaviy protokolga qaraganda OHSS (ovarian giperstimulyatsiya sindromi) xavfini 60% ga kamaytirdi va embro sifatini saqlab qoldi. Tirik tug'ish tezligi ikkala guruhda ham 35% atrofida bo'ldi.",
      category: "Reproduktiv tibbiyot",
      specialty: "Ginekologiya",
      imageUrl:
        "https://readdy.ai/api/search-image?query=infertility%20treatment%20with%20mild%20ovarian%20stimulation%20modern%20fertility%20clinic%20with%20laboratory%20equipment%20and%20embryology%20lab%20soft%20clinical%20lighting%20reproductive%20medicine&width=600&height=400&seq=gin-news-4&orientation=landscape",
      source: "Fertility and Sterility",
      publishedAt: "2026-04-20",
      readTime: "5 daqiqa",
      isNew: false,
      tags: ["IVF", "Yengil stimulyatsiya", "OHSS"],
    },
  ],
};

export const newsCategories = [
  "Barchasi",
  "Yangi tadqiqot",
  "Gen terapiya",
  "Texnologiya",
  "Farmakoterapiya",
  "Epidemiologiya",
  "Yangi dori",
  "AI texnologiya",
  "Klinik tadqiqot",
  "Neyrostimulyatsiya",
  "Biomaterial",
  "Robotik jarrohlik",
  "Regenerativ tibbiyot",
  "Preventsion tibbiyot",
  "Vaksinatsiya",
  "Skrinning",
  "Mikrobiota",
  "Digital tibbiyot",
  "Jarrohiy material",
  "Ta'lim",
  "Onkoxirurgiya",
  "Anesteziologiya",
  "Diagnostika",
  "Gormon terapiya",
  "Reproduktiv tibbiyot",
];
