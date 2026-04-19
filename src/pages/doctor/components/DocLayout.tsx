import { useState, type ReactNode } from "react";
import DocSidebar from "./DocSidebar";
import DocHeader from "./DocHeader";
import { usePersistedDoctorTheme } from "@/hooks/usePersistedDoctorTheme";
import { usePersistedPatientDetailLayout } from "@/hooks/usePersistedPatientDetailLayout";
import { DoctorThemeProvider } from "@/context/DoctorThemeContext";

interface DocLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DocLayout({ children, title }: DocLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, toggleDarkMode, setDarkMode] = usePersistedDoctorTheme();
  const [patientDetailLayout, setPatientDetailLayout] = usePersistedPatientDetailLayout();

  return (
    <DoctorThemeProvider
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      setDarkMode={setDarkMode}
      patientDetailLayout={patientDetailLayout}
      setPatientDetailLayout={setPatientDetailLayout}
    >
      <div
        className={`min-h-screen overflow-x-hidden ${darkMode ? "bg-[#0D1117]" : "bg-[#F4F6FB]"}`}
      >
        <DocSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <DocHeader
          title={title}
          sidebarCollapsed={collapsed}
        />
        <main
          className={`min-w-0 transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="min-w-0 p-6">{children}</div>
        </main>
      </div>
    </DoctorThemeProvider>
  );
}
