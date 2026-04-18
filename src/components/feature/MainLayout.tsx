import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { LayoutThemeProvider } from "@/context/LayoutThemeContext";
import { usePersistedSuperAdminTheme } from "@/hooks/usePersistedSuperAdminTheme";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, toggleDarkMode, setDarkMode] = usePersistedSuperAdminTheme();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0F1117]" : "bg-[#F5F6FA]"}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        darkMode={darkMode}
      />
      <Header
        title={title}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        sidebarCollapsed={collapsed}
      />
      <LayoutThemeProvider darkMode={darkMode} setDarkMode={setDarkMode}>
        <main
          className={`transition-[margin-left] duration-300 ease-out pt-16 min-h-screen ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </LayoutThemeProvider>
    </div>
  );
}
