import { useState, type ReactNode } from "react";
import HASidebar from "./HASidebar";
import HAHeader from "./HAHeader";
import { usePersistedHospitalAdminTheme } from "@/hooks/usePersistedHospitalAdminTheme";
import { HospitalAdminThemeProvider } from "@/context/HospitalAdminThemeContext";
import { layoutSystem } from "@/styles/layoutSystem";

interface HALayoutProps {
  children: ReactNode;
  title: string;
}

export default function HALayout({ children, title }: HALayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, toggleDarkMode] = usePersistedHospitalAdminTheme();

  return (
    <HospitalAdminThemeProvider darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? "bg-[#0F1117]" : "bg-[#F5F7FA]"}`}>
        <HASidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          darkMode={darkMode}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <HAHeader
          title={title}
          darkMode={darkMode}
          onToggleDark={toggleDarkMode}
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
          className={`transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "md:ml-16" : "md:ml-64"
          }`}
        >
          <div className={layoutSystem.pagePadding}>{children}</div>
        </main>
      </div>
    </HospitalAdminThemeProvider>
  );
}
