import { useState, type ReactNode } from "react";
import HASidebar from "./HASidebar";
import HAHeader from "./HAHeader";
import { usePersistedHospitalAdminTheme } from "@/hooks/usePersistedHospitalAdminTheme";
import { HospitalAdminThemeProvider } from "@/context/HospitalAdminThemeContext";

interface HALayoutProps {
  children: ReactNode;
  title: string;
}

export default function HALayout({ children, title }: HALayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, toggleDarkMode] = usePersistedHospitalAdminTheme();

  return (
    <HospitalAdminThemeProvider darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? "bg-[#0F1117]" : "bg-[#F5F7FA]"}`}>
        <HASidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          darkMode={darkMode}
        />
        <HAHeader
          title={title}
          darkMode={darkMode}
          onToggleDark={toggleDarkMode}
          sidebarCollapsed={collapsed}
        />
        <main
          className={`transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </HospitalAdminThemeProvider>
  );
}
