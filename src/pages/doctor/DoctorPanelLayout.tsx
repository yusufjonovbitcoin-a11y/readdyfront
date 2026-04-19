import { Outlet } from "react-router-dom";
import { DocPatientsProvider } from "@/context/DocPatientsContext";

export default function DoctorPanelLayout() {
  return (
    <DocPatientsProvider>
      <Outlet />
    </DocPatientsProvider>
  );
}
