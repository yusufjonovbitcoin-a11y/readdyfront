import { useState, type ReactNode } from "react";
import DocSidebar from "./DocSidebar";
import DocHeader from "./DocHeader";
import { usePersistedDoctorTheme } from "@/hooks/usePersistedDoctorTheme";
import { usePersistedPatientDetailLayout } from "@/hooks/usePersistedPatientDetailLayout";
import { DoctorThemeProvider } from "@/context/DoctorThemeContext";
import { layoutSystem } from "@/styles/layoutSystem";

interface DocLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DocLayout({ children, title }: DocLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
        className={`min-h-screen ${darkMode ? "bg-[#0D1117]" : "bg-[#F4F6FB]"}`}
      >
        <DocSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <DocHeader
          title={title}
          sidebarCollapsed={collapsed}
          onToggleMobile={() => setMobileSidebarOpen((v) => !v)}
        />
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}
        <main
          className={`min-w-0 transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "md:ml-16" : "md:ml-64"
          }`}
        >
          <div className={`min-w-0 ${layoutSystem.pagePadding}`}>{children}</div>
        </main>
      </div>
    </DoctorThemeProvider>
  );
}
