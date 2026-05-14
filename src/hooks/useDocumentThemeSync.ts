import { useEffect } from "react";

/**
 * `html` ga `dark` klassi va `color-scheme` — brauzer scrollbarlari va native kontrollar
 * ilovadagi yorug‘/qorong‘u temaga moslashadi (Tailwind `dark:` dan mustaqil).
 */
export function useDocumentThemeSync(darkMode: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);
}
