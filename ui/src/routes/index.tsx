import { createRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { routeTree } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="font-bold text-4xl tracking-tight">
          {t("common.appName")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("canvas.title")}</p>
      </div>
    </div>
  );
}
