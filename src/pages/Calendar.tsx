import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  TrendingUp, 
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for events
const mockEvents = [
  { 
    id: 'e1', 
    title: 'Long Run', 
    date: '2025-05-25', 
    time: '07:00', 
    distance: 12,
    location: 'City Park'
  },
  { 
    id: 'e2', 
    title: 'Tempo Run', 
    date: '2025-05-27', 
    time: '18:30', 
    distance: 6,
    location: 'Riverside Trail'
  },
  { 
    id: 'e3', 
    title: 'Easy Recovery', 
    date: '2025-05-29', 
    time: '08:00', 
    distance: 5,
    location: 'Neighborhood Loop'
  },
  { 
    id: 'e4', 
    title: 'Interval Training', 
    date: '2025-06-01', 
    time: '17:30', 
    distance: 8,
    location: 'Track'
  },
];

// Helper functions for date handling
const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const getMonthName = (month: number) => new Date(0, month).toLocaleString('default', { month: 'long' });

export default function Calendar() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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
      const formattedDate = date.toISOString().split('T')[0];
      const hasEvent = mockEvents.some(event => event.date === formattedDate);
      
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        isToday: new Date().toDateString() === date.toDateString(),
        date: formattedDate,
        hasEvent
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
    return mockEvents.filter(event => event.date === date);
  };
  
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Training Calendar</h1>
          <p className="text-gray-600">Schedule and track your workouts</p>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
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
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Today
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-gray-500 text-sm py-2">
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
                className={`aspect-square p-1 ${!day.isCurrentMonth ? 'opacity-30' : ''}`}
                onClick={() => day.date && setSelectedDate(day.date)}
              >
                {day.day && (
                  <div 
                    className={`h-full w-full rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all
                      ${day.isToday ? 'bg-primary text-white font-bold' : ''}
                      ${selectedDate === day.date && !day.isToday ? 'bg-primary-light bg-opacity-20' : ''}
                      ${!day.isToday && !selectedDate ? 'hover:bg-gray-100' : ''}
                    `}
                  >
                    <span>{day.day}</span>
                    {day.hasEvent && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${day.isToday ? 'bg-white' : 'bg-primary'}`}></div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
        
        {/* Events for selected date */}
        <Card className="lg:col-span-4" title={`Schedule for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}>
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-3 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant="primary">{event.distance} km</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">No workouts scheduled for this day</p>
              <button className="mt-3 text-primary font-medium text-sm hover:underline">
                Add a workout
              </button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Upcoming events */}
      <Card title="Upcoming Workouts">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockEvents.map((event) => (
            <div 
              key={event.id}
              className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary">
                  <TrendingUp size={18} />
                </div>
                <Badge variant="primary">{event.distance} km</Badge>
              </div>
              <h4 className="font-medium mb-1">{event.title}</h4>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <CalendarIcon size={14} />
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}