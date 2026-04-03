import {
  CheckIcon,
  GlobeIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { usePresetStore } from "@/stores/preset-store";

const languages = [
  { code: "en", label: "language.en" },
  { code: "it", label: "language.it" },
] as const;

export function SettingsButton() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const themes = usePresetStore((s) => s.themes);
  const activeThemeId = usePresetStore((s) => s.activeThemeId);
  const setActiveTheme = usePresetStore((s) => s.setActiveTheme);

  return (
    <div className="orray-settings-anchor">
      <DropdownMenu>
        <DropdownMenuTrigger className="orray-settings-trigger">
          <UserIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunIcon />
              {t("settings.appearance")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setTheme("light")}>
                  <SunIcon />
                  {t("theme.light")}
                  {theme === "light" && <CheckMark />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTheme("dark")}>
                  <MoonIcon />
                  {t("theme.dark")}
                  {theme === "dark" && <CheckMark />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTheme("system")}>
                  <MonitorIcon />
                  {t("theme.system")}
                  {theme === "system" && <CheckMark />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaletteIcon />
              {t("settings.theme")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {themes.map((canvasTheme) => (
                  <DropdownMenuItem
                    key={canvasTheme.id}
                    onSelect={() => setActiveTheme(canvasTheme.id)}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full border"
                      style={{
                        backgroundColor: canvasTheme.dark.canvas.background,
                        borderColor: canvasTheme.dark.node.border,
                      }}
                    />
                    {canvasTheme.name}
                    {canvasTheme.id === activeThemeId && <CheckMark />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <GlobeIcon />
              {t("language.select")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onSelect={() => {
                      i18n.changeLanguage(lang.code);
                      localStorage.setItem("orray-locale", lang.code);
                    }}
                  >
                    {t(lang.label)}
                    {i18n.language === lang.code && <CheckMark />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CheckMark() {
  return <CheckIcon className="ml-auto h-4 w-4 opacity-60" />;
}
