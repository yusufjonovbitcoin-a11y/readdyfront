export type AnalyticsPeriodPointDto = {
  date: string;
  patients: number;
  appointments: number;
  completed: number;
};

export type DoctorPerformancePointDto = {
  name: string;
  patients: number;
  rating: number;
  specialty: string;
};

export type TopHospitalPointDto = {
  name: string;
  patients: number;
  max: number;
};

export type AnalyticsDashboardDto = {
  daily: AnalyticsPeriodPointDto[];
  weekly: AnalyticsPeriodPointDto[];
  monthly: AnalyticsPeriodPointDto[];
  doctorPerformance: DoctorPerformancePointDto[];
  topHospitals: TopHospitalPointDto[];
};
