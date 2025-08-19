import { FC } from "react";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import ThemePreview from "../../../components/ui/ThemePreview";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../../../components/ui/Card";
import { useTheme } from "../../../context/ThemeContext";
import { useUserContext } from "../../../hooks/useUser";

export const AppearanceTab: FC = () => {

  const { user, updateUserPreferences } = useUserContext();

  const { theme, setTheme, colorPalette, setColorPalette } = useTheme();

  const colorPalettes = [
    { id: "default", name: "Défaut", primary: "#6366F1", secondary: "#10B981" },
    { id: "blue", name: "Bleu", primary: "#3B82F6", secondary: "#06B6D4" },
    { id: "green", name: "Vert", primary: "#10B981", secondary: "#84CC16" },
    { id: "purple", name: "Violet", primary: "#8B5CF6", secondary: "#EC4899" },
    { id: "orange", name: "Orange", primary: "#F97316", secondary: "#EAB308" },
    { id: "red", name: "Rouge", primary: "#EF4444", secondary: "#F97316" },
  ];

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <Card title="Thème" className="bg-card text-card-foreground border-border">
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4 text-foreground">Mode d'affichage</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
                }`}
            >
              <Sun size={24} />
              <span className="text-sm font-medium">Clair</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
                }`}
            >
              <Moon size={24} />
              <span className="text-sm font-medium">Sombre</span>
            </button>
            <button
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all border-border hover:border-primary/50 opacity-50 cursor-not-allowed`}
            >
              <Monitor size={24} />
              <span className="text-sm font-medium">Auto</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4 text-foreground">Palette de couleurs</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorPalettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => setColorPalette(palette.id)}
                data-testid={`palette-option-${palette.id}`}
                className={`p-4 rounded-lg border transition-all ${colorPalette === palette.id
                  ? "ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: palette.secondary }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {palette.name}
                </span>
              </button>
            ))}
          </div>
          <ThemePreview />
        </div>

        {/* Display Settings */}
        <div className="border-t border-border pt-6">
          <h4 className="font-medium mb-4 text-foreground">Affichage</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Animations</p>
                <p className="text-sm text-muted-foreground">Activer les animations de l'interface</p>
              </div>
              <ToggleSwitch
                checked={true}
                // @ts-ignore
                onChange={(value) => updateUserPreferences(user!.preferences)}
                />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Mode compact</p>
                <p className="text-sm text-muted-foreground">Réduire l'espacement pour plus de contenu</p>
              </div>
              <ToggleSwitch
                checked={false}
                // @ts-ignore
                onChange={(value) => updateUserPreferences(user!.preferences)}
                />
            </div>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
};