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

export type DailyBookingPointDto = {
  date: string;
  successful: number;
  failed: number;
};

export type CityStatPointDto = {
  city: string;
  successful: number;
};

export type WeeklyBookingPointDto = {
  week: string;
  bookings: number;
};

export type AnalyticsDashboardDto = {
  daily: AnalyticsPeriodPointDto[];
  weekly: AnalyticsPeriodPointDto[];
  monthly: AnalyticsPeriodPointDto[];
  doctorPerformance: DoctorPerformancePointDto[];
  topHospitals: TopHospitalPointDto[];
  dailyBookings: DailyBookingPointDto[];
  weeklyBookings: WeeklyBookingPointDto[];
  cityStats: CityStatPointDto[];
};
