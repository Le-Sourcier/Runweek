import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../hooks/useAppNavigation";
import { Calendar } from "lucide-react";
import FormattedDate from "../../ui/FormattedDate";
import { useLanguage } from "../../../providers/LanguageProvider";
import { useCalendarStore } from "../../../stores/CalendarStore";

export const UpcomingWorkouts: FC = () => {
  const { events, getEvents } = useCalendarStore();
  const { currentLanguage } = useLanguage();

  const filteredEvents = events
    .filter((event) => new Date(`${event.date}T${event.time || "00:00"}`) >= new Date())
    .slice(0, 2);

  useEffect(() => { getEvents(); }, []);

  return (
    <div className="chart-container mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-card-foreground">
          Entraînements à venir
        </h3>
        <Link
          to={ROUTES.CALENDAR}
          className="text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
        >
          Voir calendrier
          <Calendar size={14} />
        </Link>
      </div>
      {
        filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents
              .map((workout, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-card-foreground">
                        {workout.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <FormattedDate
                          date={new Date(workout.time ? `${workout.date}T${workout.time}` : workout.date).toISOString()}
                          mode="full"
                          locale={currentLanguage}
                        />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-card-foreground">
                        {workout.distance ? `${Number(workout.distance)} km` : "Non définie"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Durée: {workout.duration ? `${workout.duration.replace(":", "h")}` : "Non définie"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>) : <div className="text-center py-4">
          <Calendar size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-3">
            Aucun entraînement à venir pour le moment.
          </p>
          <Link
            to={ROUTES.CALENDAR}
            className="btn btn-outline dark:hover:bg-gray-700 dark:border-gray-600 btn-sm"
          >
            Voir le calendrier
          </Link>
        </div>
      }
    </div>
  );
};