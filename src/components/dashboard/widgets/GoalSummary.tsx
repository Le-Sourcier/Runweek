import { Target } from "lucide-react";
import { FC } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../../ui/ProgressBar";
import { format, parseISO } from "date-fns";
import Card from "../../ui/Card";
import { fr } from "date-fns/locale";
import { useUserContext } from "../../../hooks/useUser";

export const GoalSummary: FC = () => {

  const { user } = useUserContext();

  const activeGoals = (user?.goals || [])
    .filter((goal) => !goal.completed)
    .sort((a, b) => {
      try {
        return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
      } catch {
        return 0; // Handle invalid dates if necessary
      }
    })
    .slice(0, 3);

  return (
    <Card // Card component itself will have mb-8 if specified in its usage, or rely on grid gap.
      // In this dynamic setup, the wrapper div for each widget in the map handles mb-8.
      // So, the Card component itself does not need mb-8 here.
      title="Vos Objectifs Actifs"
      action={
        <Link
          to="/goals"
          className="text-primary hover:text-primary-600 duration-300 transition-colors dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
        >
          Voir tout
        </Link>
      }
    // className="mb-8" // This was in the direct JSX before, now handled by the loop's wrapper.
    >
      {activeGoals.length > 0 ? (
        <div className="space-y-4">
          {activeGoals.map((goal) => (
            <div key={goal.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-medium text-card-foreground">
                  {goal.title}
                </h4>
                {goal.deadline && (
                  <p className="text-xs text-muted-foreground">
                    Échéance:{" "}
                    {format(parseISO(goal.deadline), "MMM d", { locale: fr })}
                  </p>
                )}
              </div>
              <ProgressBar value={goal.current} max={goal.target} height="sm" />
              <p className="text-sm text-muted-foreground mt-1">
                {goal.current} / {goal.target} {goal.unit}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Target size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-3">
            Vous n'avez aucun objectif actif pour le moment.
          </p>
          <Link to="/goals" className="btn btn-outline btn-sm">
            Définir un Nouvel Objectif
          </Link>
        </div>
      )}
    </Card>
  );
};