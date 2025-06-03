import { useState, useEffect } from "react"; // Added useEffect
import { useUser } from "../context/UserContext";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal"; // Import Modal
import Badge from "../components/ui/Badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  TrendingUp,
  MapPin,
  Activity as ActivityIcon, // For workout type
  Tag as TagIcon, // For workout type as well
  PlusCircle, // For Add Workout Button
} from "lucide-react";
import { motion } from "framer-motion";

// Event type (can be moved to types.ts if shared)
interface CalendarEventType {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: "Run" | "Bike" | "Swim" | "Gym" | "Other";
  distance?: number; // in km
  duration?: string; // e.g., "1:30:00" or "45 min"
  location?: string;
  notes?: string;
}

// Initial mock events
const initialMockEvents: CalendarEventType[] = [
  {
    id: "e1",
    title: "Long Run",
    date: "2025-05-25",
    time: "07:00",
    type: "Run",
    distance: 12,
    duration: "1:15:00",
    location: "City Park",
    notes: "Feeling great, steady pace.",
  },
  {
    id: "e2",
    title: "Tempo Run",
    date: "2025-05-27",
    time: "18:30",
    type: "Run",
    distance: 6,
    duration: "0:35:00",
    location: "Riverside Trail",
  },
  {
    id: "e3",
    title: "Easy Recovery",
    date: "2025-05-29",
    time: "08:00",
    type: "Run",
    distance: 5,
    duration: "0:30:00",
    location: "Neighborhood Loop",
  },
  {
    id: "e4",
    title: "Interval Training",
    date: "2025-06-01",
    time: "17:30",
    type: "Run",
    distance: 8,
    duration: "0:50:00",
    location: "Track",
    notes: "8x400m repeats",
  },
];

// Helper functions for date handling
const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();
const getMonthName = (month: number) =>
  new Date(0, month).toLocaleString("default", { month: "long" });

export default function Calendar() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState<CalendarEventType[]>(initialMockEvents);

  // Modal and Form States
  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("");
  const [newWorkoutDate, setNewWorkoutDate] = useState(selectedDate);
  const [newWorkoutTime, setNewWorkoutTime] = useState("");
  const [newWorkoutType, setNewWorkoutType] =
    useState<CalendarEventType["type"]>("Run");
  const [newWorkoutDistance, setNewWorkoutDistance] = useState<number | "">("");
  const [newWorkoutDuration, setNewWorkoutDuration] = useState("");
  const [newWorkoutLocation, setNewWorkoutLocation] = useState("");
  const [newWorkoutNotes, setNewWorkoutNotes] = useState("");

  // Update newWorkoutDate when selectedDate changes and modal is not open
  useEffect(() => {
    if (!isAddWorkoutModalOpen) {
      setNewWorkoutDate(selectedDate);
    }
  }, [selectedDate, isAddWorkoutModalOpen]);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const daysCount = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const formattedDate = date.toISOString().split("T")[0];
      const hasEvent = events.some((event) => event.date === formattedDate);

      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === date.toDateString(),
        date: formattedDate,
        hasEvent,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation for previous and next month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get events for selected date
  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handleOpenAddWorkoutModal = () => {
    setNewWorkoutTitle("");
    setNewWorkoutDate(selectedDate || new Date().toISOString().split("T")[0]);
    setNewWorkoutTime(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    ); // Default to current time
    setNewWorkoutType("Run");
    setNewWorkoutDistance("");
    setNewWorkoutDuration("");
    setNewWorkoutLocation("");
    setNewWorkoutNotes("");
    setIsAddWorkoutModalOpen(true);
  };

  const handleSaveNewWorkout = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newWorkoutTitle || !newWorkoutDate || !newWorkoutType) {
      alert("Please fill in Title, Date, and Type."); // Basic validation
      return;
    }
    const newWorkout: CalendarEventType = {
      id: `e${Date.now()}`,
      title: newWorkoutTitle,
      date: newWorkoutDate,
      time: newWorkoutTime || undefined,
      type: newWorkoutType,
      distance:
        newWorkoutDistance === "" ? undefined : Number(newWorkoutDistance),
      duration: newWorkoutDuration || undefined,
      location: newWorkoutLocation || undefined,
      notes: newWorkoutNotes || undefined,
    };
    setEvents((prevEvents) => [newWorkout, ...prevEvents]);
    setIsAddWorkoutModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Training Calendar</h1>
          <p className="text-gray-600">Schedule and track your workouts</p>
        </div>

        <button className="btn btn-primary flex items-center gap-2" onClick={handleOpenAddWorkoutModal}>
          <Plus size={16} />
          Add Workout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {getMonthName(currentMonth)} {currentYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date().toISOString().split("T")[0]);
                }}
                className="btn btn-outline text-sm dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="btn btn-ghost p-2 hover:bg-muted"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-medium text-muted-foreground text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`aspect-square p-1 ${
                  !day.isCurrentMonth ? "opacity-30" : ""
                }`}
                onClick={() => day.date && setSelectedDate(day.date)}
              >
                {day.day && (
                  <div
                    className={`h-full w-full rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all text-sm
                      ${
                        day.isToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : ""
                      }
                      ${
                        selectedDate === day.date && !day.isToday
                          ? "bg-primary/20 dark:bg-primary/30 text-primary font-semibold"
                          : "text-foreground"
                      }
                      ${
                        !day.isToday && selectedDate !== day.date
                          ? "hover:bg-muted dark:hover:bg-muted/50"
                          : ""
                      }
                    `}
                  >
                    <span>{day.day}</span>
                    {day.hasEvent && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          day.isToday ? "bg-primary-foreground" : "bg-primary"
                        }`}
                      ></div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Events for selected date */}
        <Card
          className="lg:col-span-4 bg-card text-card-foreground border-border"
          title={`Schedule for ${new Date(
            selectedDate + "T00:00:00"
          ).toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}`}
          titleClassName="text-lg"
        >
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-border rounded-lg hover:shadow-md transition-all bg-background"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-foreground">
                      {event.title}
                    </h4>
                    {event.distance && (
                      <Badge variant="primary" className="text-xs">
                        {event.distance} km
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {event.time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.type && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TagIcon size={12} />
                        <span>{event.type}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ActivityIcon size={12} />
                        <span>{event.duration}</span>
                      </div>
                    )}
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">
                No workouts scheduled for this day
              </p>
              <button className="mt-3 text-primary font-medium text-sm hover:underline" onClick={handleOpenAddWorkoutModal}>
                Add a workout
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming events - uses events state now */}
      <Card
        title="Upcoming Workouts"
        className="bg-card text-card-foreground border-border"
      >
        {events
          .filter(
            (e) =>
              new Date(e.date + "T00:00:00") >=
              new Date(new Date().toISOString().split("T")[0])
          )
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 4).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events
              .filter(
                (e) =>
                  new Date(e.date + "T00:00:00") >=
                  new Date(new Date().toISOString().split("T")[0])
              ) // Filter for upcoming
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              ) // Sort by date
              .slice(0, 4) // Take first 4
              .map((event) => (
                <div key={event.id}>
                  <h4>{event.title}</h4>
                  <p>
                    {new Date(event.date + "T00:00:00").toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              No upcoming workouts scheduled.
            </p>
          </div>
        )}
      </Card>

      {/* Add Workout Modal */}
      <Modal
        isOpen={isAddWorkoutModalOpen}
        onClose={() => setIsAddWorkoutModalOpen(false)}
        title="Add New Workout"
        size="lg"
      >
        <form onSubmit={handleSaveNewWorkout} className="space-y-4">
          <div>
            <label
              htmlFor="workout-title"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="workout-title"
              value={newWorkoutTitle}
              onChange={(e) => setNewWorkoutTitle(e.target.value)}
              className="input w-full bg-background text-foreground border-border"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="workout-date"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="workout-date"
                value={newWorkoutDate}
                onChange={(e) => setNewWorkoutDate(e.target.value)}
                className="input w-full bg-background text-foreground border-border"
                required
              />
            </div>
            <div>
              <label
                htmlFor="workout-time"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Time (Optional)
              </label>
              <input
                type="time"
                id="workout-time"
                value={newWorkoutTime}
                onChange={(e) => setNewWorkoutTime(e.target.value)}
                className="input w-full bg-background text-foreground border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="workout-type"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Type
              </label>
              <select
                id="workout-type"
                value={newWorkoutType}
                onChange={(e) =>
                  setNewWorkoutType(e.target.value as CalendarEventType["type"])
                }
                className="input w-full appearance-none bg-background text-foreground border-border pr-8"
              >
                <option value="Run">Run</option>
                <option value="Bike">Bike</option>
                <option value="Swim">Swim</option>
                <option value="Gym">Gym</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="workout-distance"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Distance (km, optional)
              </label>
              <input
                type="number"
                id="workout-distance"
                value={newWorkoutDistance}
                onChange={(e) =>
                  setNewWorkoutDistance(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                className="input w-full bg-background text-foreground border-border"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="workout-duration"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Duration (e.g., 45 min, 1:30:00, optional)
            </label>
            <input
              type="text"
              id="workout-duration"
              value={newWorkoutDuration}
              onChange={(e) => setNewWorkoutDuration(e.target.value)}
              className="input w-full bg-background text-foreground border-border"
            />
          </div>
          <div>
            <label
              htmlFor="workout-location"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Location (Optional)
            </label>
            <input
              type="text"
              id="workout-location"
              value={newWorkoutLocation}
              onChange={(e) => setNewWorkoutLocation(e.target.value)}
              className="input w-full bg-background text-foreground border-border"
            />
          </div>
          <div>
            <label
              htmlFor="workout-notes"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="workout-notes"
              value={newWorkoutNotes}
              onChange={(e) => setNewWorkoutNotes(e.target.value)}
              className="input w-full bg-background text-foreground border-border"
              rows={3}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddWorkoutModalOpen(false)}
              className="btn btn-outline dark:border-muted dark:text-muted-foreground"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Workout
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
