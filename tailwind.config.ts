/** @type {import('tailwindcss').Config} */
export default {
    /** `useDocumentThemeSync` — `html` ga `dark` qo‘yadi; `dark:` shu klassga bog‘lansin */
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }