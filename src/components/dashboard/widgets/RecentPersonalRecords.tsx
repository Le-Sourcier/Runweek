import { FC } from "react";
import { ROUTES } from "../../../hooks/useAppNavigation";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { usePRs } from "../../../context/PRContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale"; // Import French locale for date formatting


export const RecentPersonalRecords: FC = () => {

  const { processedPRs: prs } = usePRs();

  const recentPRs = (prs || [])
    .slice() // Create a shallow copy before sorting to avoid mutating the original context state
    .sort((a, b) => {
      try {
        return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      } catch {
        // Handle invalid date strings if necessary, e.g., by pushing them to the end or logging an error
        return 0;
      }
    })
    .slice(0, 3); // Take top 3 recent PRs

  return (
    <div className="chart-container mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-card-foreground">
          Records Récents
        </h3>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.PERSONAL_RECORDS}
            className="text-primary hover:text-primary-600 duration-300 transition-colors dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
          >
            Voir tout
            <Trophy size={14} />
          </Link>
        </div>
      </div>
      {recentPRs.length === 0 ? (
        <div className="text-center py-4">
          <Trophy size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-3">
            Aucun record personnel pour le moment.
          </p>
          <Link
            to={ROUTES.PERSONAL_RECORDS}
            className="btn btn-outline dark:hover:bg-gray-700 dark:border-gray-600 btn-sm"
          >
            Ajouter un Record
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentPRs.map((pr) => (
            <div
              key={pr.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-primary-500/10 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-primary dark:text-primary-400">
                    {pr.distance} km Record
                  </h4>
                  <p className="text-sm text-card-foreground">
                    Temps: <span className="font-medium">{pr.time}</span>
                  </p>
                </div>
                <div className="text-right">
                  {pr.date && (
                    <p className="text-xs text-muted-foreground/80">
                      {format(parseISO(pr.date), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  )}
                  {pr.notes && (
                    <p
                      className="text-xs text-muted-foreground/70 mt-1 truncate"
                      title={pr.notes}
                    >
                      {pr.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};