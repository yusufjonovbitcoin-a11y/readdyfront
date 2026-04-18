export interface HADoctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  avatar: string;
  todayPatients: number;
  totalPatients: number;
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  hospitalId: string;
  qrCode: string;
}

export const haDoctors: HADoctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Alisher Karimov',
    specialty: 'Kardiologiya',
    phone: '+998 90 123 45 67',
    email: 'a.karimov@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20doctor%20portrait%20white%20coat%20stethoscope%20clean%20background%20confident%20smile%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc001&orientation=squarish',
    todayPatients: 12,
    totalPatients: 1240,
    rating: 4.9,
    status: 'active',
    joinDate: '2021-03-15',
    hospitalId: 'hosp-001',
    qrCode: 'doc-001',
  },
  {
    id: 'doc-002',
    name: 'Dr. Malika Yusupova',
    specialty: 'Nevrologiya',
    phone: '+998 91 234 56 78',
    email: 'm.yusupova@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20doctor%20portrait%20white%20coat%20stethoscope%20clean%20background%20friendly%20smile%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc002&orientation=squarish',
    todayPatients: 8,
    totalPatients: 980,
    rating: 4.8,
    status: 'active',
    joinDate: '2020-07-22',
    hospitalId: 'hosp-001',
    qrCode: 'doc-002',
  },
  {
    id: 'doc-003',
    name: 'Dr. Bobur Toshmatov',
    specialty: 'Ortopediya',
    phone: '+998 93 345 67 89',
    email: 'b.toshmatov@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20doctor%20portrait%20white%20coat%20clean%20background%20serious%20expression%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc003&orientation=squarish',
    todayPatients: 15,
    totalPatients: 1560,
    rating: 4.7,
    status: 'active',
    joinDate: '2019-11-10',
    hospitalId: 'hosp-001',
    qrCode: 'doc-003',
  },
  {
    id: 'doc-004',
    name: 'Dr. Nilufar Rashidova',
    specialty: 'Pediatriya',
    phone: '+998 94 456 78 90',
    email: 'n.rashidova@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20doctor%20portrait%20white%20coat%20clean%20background%20warm%20smile%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc004&orientation=squarish',
    todayPatients: 20,
    totalPatients: 2100,
    rating: 4.9,
    status: 'active',
    joinDate: '2018-05-30',
    hospitalId: 'hosp-001',
    qrCode: 'doc-004',
  },
  {
    id: 'doc-005',
    name: 'Dr. Jasur Mirzayev',
    specialty: 'Xirurgiya',
    phone: '+998 95 567 89 01',
    email: 'j.mirzayev@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20surgeon%20portrait%20white%20coat%20clean%20background%20confident%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc005&orientation=squarish',
    todayPatients: 6,
    totalPatients: 870,
    rating: 4.6,
    status: 'inactive',
    joinDate: '2022-01-18',
    hospitalId: 'hosp-001',
    qrCode: 'doc-005',
  },
  {
    id: 'doc-006',
    name: 'Dr. Zulfiya Nazarova',
    specialty: 'Dermatologiya',
    phone: '+998 97 678 90 12',
    email: 'z.nazarova@medcore.uz',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20dermatologist%20portrait%20white%20coat%20clean%20background%20professional%20uzbek%20asian%20appearance%20high%20quality%20photo&width=200&height=200&seq=doc006&orientation=squarish',
    todayPatients: 11,
    totalPatients: 1320,
    rating: 4.8,
    status: 'active',
    joinDate: '2020-09-05',
    hospitalId: 'hosp-001',
    qrCode: 'doc-006',
  },
];
