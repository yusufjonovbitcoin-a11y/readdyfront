export type HospitalStatus = "active" | "inactive";

export interface Hospital {
  id: string;
  name: string;
  viloyat: string;
  address: string;
  phone: string;
  doctorsCount: number;
  dailyPatients: number;
  status: HospitalStatus;
  adminName: string;
  adminPhone: string;
  createdAt: string;
}

export type CreateHospitalInput = Pick<
  Hospital,
  "name" | "viloyat" | "address" | "phone" | "adminName" | "adminPhone"
> & {
  status?: HospitalStatus;
};

export type UpdateHospitalInput = Partial<
  Pick<
    Hospital,
    | "name"
    | "viloyat"
    | "address"
    | "phone"
    | "doctorsCount"
    | "dailyPatients"
    | "status"
    | "adminName"
    | "adminPhone"
  >
>;
