import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { LayoutThemeProvider } from "@/context/LayoutThemeContext";
import { usePersistedSuperAdminTheme } from "@/hooks/usePersistedSuperAdminTheme";
import { useMobileDrawerA11y } from "@/hooks/useMobileDrawerA11y";
import { layoutSystem } from "@/styles/layoutSystem";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, toggleDarkMode, setDarkMode] = usePersistedSuperAdminTheme();
  const { drawerRef, captureTrigger } = useMobileDrawerA11y(mobileSidebarOpen, () => setMobileSidebarOpen(false));

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0F1117]" : "bg-[#F5F6FA]"}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        darkMode={darkMode}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        drawerRef={drawerRef}
      />
      <Header
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
      <LayoutThemeProvider darkMode={darkMode} setDarkMode={setDarkMode}>
        <main
          id="main-content"
          tabIndex={-1}
          className={`transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "md:ml-16" : "md:ml-64"
          }`}
        >
          <div className={layoutSystem.pagePadding}>{children}</div>
        </main>
      </LayoutThemeProvider>
    </div>
  );
}
