import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import HASidebar from "./HASidebar";
import HAHeader from "./HAHeader";
import { usePersistedHospitalAdminTheme } from "@/hooks/usePersistedHospitalAdminTheme";
import { useMobileDrawerA11y } from "@/hooks/useMobileDrawerA11y";
import { HospitalAdminThemeProvider } from "@/context/HospitalAdminThemeContext";
import { layoutSystem } from "@/styles/layoutSystem";

interface HALayoutProps {
  children: ReactNode;
  title: string;
}

export default function HALayout({ children, title }: HALayoutProps) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, toggleDarkMode] = usePersistedHospitalAdminTheme();
  const { drawerRef, captureTrigger } = useMobileDrawerA11y(mobileSidebarOpen, () => setMobileSidebarOpen(false));
  const isFullBleedRoute = pathname.includes("/notifications");

  return (
    <HospitalAdminThemeProvider darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? "bg-[#0F1117]" : "bg-[#F5F7FA]"}`}>
        <HASidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          darkMode={darkMode}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          drawerRef={drawerRef}
        />
        <HAHeader
          title={title}
          darkMode={darkMode}
          onToggleDark={toggleDarkMode}
          sidebarCollapsed={collapsed}
          onToggleMobile={() =>
            setMobileSidebarOpen((v) => {
              const next = !v;
              if (next) captureTrigger();
              return next;
            })
          }
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
          id="main-content"
          tabIndex={-1}
          className={`transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "md:ml-16" : "md:ml-64"
          } ${isFullBleedRoute ? "h-screen overflow-hidden" : ""}`}
        >
          <div className={isFullBleedRoute ? "" : layoutSystem.pagePadding}>{children}</div>
        </main>
      </div>
    </HospitalAdminThemeProvider>
  );
}
