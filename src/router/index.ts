import { useRoutes } from "react-router-dom";
import * as Sentry from "@sentry/react";
import routes from "./config";

const useSentryRoutes = Sentry.withSentryReactRouterV6Routing(useRoutes);

export function AppRoutes() {
  const element = useSentryRoutes(routes);
  return element;
}
