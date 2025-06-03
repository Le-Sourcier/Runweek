import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import { 
  BarChart as BarChartIcon, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Clock,
  MapPin,
  Heart,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  BarChart2, // Using a more generic chart icon for stats
  TrendingDown // For negative changes
} from 'lucide-react';
import { useState, useEffect } from 'react'; // Added useEffect
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Mock data for charts
const weeklyData = [
  { day: 'Mon', distance: 5.2, time: 28, pace: 5.4 },
  { day: 'Tue', distance: 0, time: 0, pace: 0 },
  { day: 'Wed', distance: 7.5, time: 42, pace: 5.6 },
  { day: 'Thu', distance: 3.2, time: 18, pace: 5.6 },
  { day: 'Fri', distance: 0, time: 0, pace: 0 },
  { day: 'Sat', distance: 8.4, time: 48, pace: 5.7 },
  { day: 'Sun', distance: 0, time: 0, pace: 0 },
];

const monthlyData = [
  { name: 'Week 1', distance: 22.5 },
  { name: 'Week 2', distance: 18.7 },
  { name: 'Week 3', distance: 25.9 },
  { name: 'Week 4', distance: 23.4 },
];

const paceData = [
  { name: 'Week 1', value: 5.8 },
  { name: 'Week 2', value: 5.5 },
  { name: 'Week 3', value: 5.4 },
  { name: 'Week 4', value: 5.2 },
];

const runTypeData = [
  { name: 'Long Run', value: 42 },
  { name: 'Recovery', value: 25 },
  { name: 'Tempo', value: 18 },
  { name: 'Intervals', value: 15 },
];

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6'];

// Define Activity Type
interface Activity {
  id: number;
  type: string;
  distance: number;
  time: string; // HH:MM:SS or MM:SS
  date: string; // YYYY-MM-DD
  location: string;
  heartRate?: number; // Optional
  elevation?: number; // Optional
}

const initialActivities: Activity[] = [
  { id: 1, type: 'Long Run', distance: 12.5, time: '1:10:22', date: '2025-05-22', location: 'City Park', heartRate: 162, elevation: 125 },
  { id: 2, type: 'Recovery', distance: 5.2, time: '28:42', date: '2025-05-20', location: 'Neighborhood Loop', heartRate: 145, elevation: 45 },
  { id: 3, type: 'Tempo', distance: 8.4, time: '42:15', date: '2025-05-18', location: 'Riverside Trail', heartRate: 172, elevation: 86 },
  { id: 4, type: 'Intervals', distance: 6.8, time: '35:30', date: '2025-05-16', location: 'Track', heartRate: 176, elevation: 12 },
  { id: 5, type: 'Long Run', distance: 15.3, time: '1:24:18', date: '2025-05-14', location: 'Mountain Route', heartRate: 158, elevation: 320 },
];

export default function Statistics() {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState('weekly');
  const [sortedActivities, setSortedActivities] = useState<Activity[]>(initialActivities);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Activity; direction: 'ascending' | 'descending' } | null>(null);
  
  if (!user) return null;

  const requestSort = (key: keyof Activity) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let activitiesToSort = [...initialActivities]; // Use a copy of the original unsorted data
    if (sortConfig !== null) {
      activitiesToSort.sort((a, b) => {
        // Helper to convert time string "HH:MM:SS" or "MM:SS" to seconds
        const timeToSeconds = (timeStr: string) => {
          const parts = timeStr.split(':').map(Number);
          if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
          if (parts.length === 2) return parts[0] * 60 + parts[1]; // MM:SS
          return 0;
        };

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Special handling for specific keys
        if (sortConfig.key === 'time') {
          valA = timeToSeconds(valA as string);
          valB = timeToSeconds(valB as string);
        } else if (sortConfig.key === 'date') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          // Case-insensitive sort for strings
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        // Note: heartRate and elevation are numbers, distance is a number. Type is string.

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    setSortedActivities(activitiesToSort);
  }, [sortConfig]); // Removed initialActivities from deps as it's a constant for now

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistics & Analysis</h1>
          <p className="text-muted-foreground">Track your performance and progress over time</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative"> {/* This would be for a dropdown component later */}
            <button className="btn btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20 flex items-center gap-2">
              {timeframe === 'weekly' ? 'This Week' : timeframe === 'monthly' ? 'This Month' : 'All Time'}
              <ChevronDown size={16} />
            </button>
          </div>
          
          <button className="btn btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20 flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>
      
      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card text-card-foreground border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Distance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-foreground">{user.stats.weeklyDistance} km</p>
                <span className="text-xs text-success flex items-center"> {/* Use text-success */}
                  <ArrowUp size={12} />
                  12%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card text-card-foreground border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center"> {/* Example different color */}
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Pace</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-foreground">{user.stats.averagePace}</p>
                <span className="text-xs text-success flex items-center"> {/* Use text-success */}
                  <TrendingDown size={12} /> {/* Changed to TrendingDown for variety */}
                  5%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card text-card-foreground border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-foreground">{user.stats.totalRuns}</p>
                <span className="text-xs text-success flex items-center">
                  <ArrowUp size={12} />
                  8%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card text-card-foreground border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Heart Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-foreground">156 bpm</p>
                <span className="text-xs text-destructive flex items-center"> {/* Use text-destructive */}
                  <ArrowUp size={12} />
                  3%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Distance" className="bg-card text-card-foreground border-border">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="distance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Monthly Progress" className="bg-card text-card-foreground border-border">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="distance" fill="hsl(var(--secondary))" stroke="hsl(var(--secondary))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Pace Improvement" className="bg-card text-card-foreground border-border">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} activeDot={{ r: 6, fill: 'hsl(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Run Types" className="bg-card text-card-foreground border-border">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={runTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="hsl(var(--primary-500))" // Base fill for pie
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {runTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> /* Keep predefined distinct colors for pie chart */
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Activities */}
      <Card title="Recent Activities" className="bg-card text-card-foreground border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="pb-3 pr-2 font-medium">
                  <button onClick={() => requestSort('type')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Activity {sortConfig?.key === 'type' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 px-2 font-medium">
                  <button onClick={() => requestSort('distance')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Distance {sortConfig?.key === 'distance' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 px-2 font-medium">
                  <button onClick={() => requestSort('time')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Time {sortConfig?.key === 'time' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 px-2 font-medium">
                  <button onClick={() => requestSort('date')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Date {sortConfig?.key === 'date' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 px-2 font-medium">
                  <button onClick={() => requestSort('heartRate')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Heart Rate {sortConfig?.key === 'heartRate' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 px-2 font-medium">
                  <button onClick={() => requestSort('elevation')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Elevation {sortConfig?.key === 'elevation' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-50" />}
                  </button>
                </th>
                <th className="pb-3 pl-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedActivities.map((activity) => ( // Use sortedActivities here
                <tr key={activity.id} className="hover:bg-muted transition-colors">
                  <td className="py-3 pr-2 font-medium text-foreground">{activity.type}</td>
                  <td className="py-3 px-2 text-foreground">{activity.distance} km</td>
                  <td className="py-3 px-2 text-foreground">{activity.time}</td>
                  <td className="py-3 px-2 text-foreground">{new Date(activity.date).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-foreground">{activity.heartRate ? `${activity.heartRate} bpm` : 'N/A'}</td>
                  <td className="py-3 px-2 text-foreground">{activity.elevation ? `${activity.elevation} m` : 'N/A'}</td>
                  <td className="py-3 pl-2 text-muted-foreground flex items-center gap-1">
                    <MapPin size={14} />
                    {activity.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}