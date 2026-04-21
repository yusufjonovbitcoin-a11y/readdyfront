import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import SectionErrorBoundary from "./components/SectionErrorBoundary";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <SectionErrorBoundary>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:border focus:border-gray-300 focus:text-sm focus:font-medium"
          >
            Asosiy kontentga o'tish
          </a>
          <AppRoutes />
        </SectionErrorBoundary>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
