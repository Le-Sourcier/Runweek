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
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
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

export default function Statistics() {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState('weekly');
  
  if (!user) return null;
  
  const activities = [
    { id: 1, type: 'Long Run', distance: 12.5, time: '1:10:22', date: '2025-05-22', location: 'City Park', heartRate: 162, elevation: 125 },
    { id: 2, type: 'Recovery', distance: 5.2, time: '28:42', date: '2025-05-20', location: 'Neighborhood Loop', heartRate: 145, elevation: 45 },
    { id: 3, type: 'Tempo', distance: 8.4, time: '42:15', date: '2025-05-18', location: 'Riverside Trail', heartRate: 172, elevation: 86 },
    { id: 4, type: 'Intervals', distance: 6.8, time: '35:30', date: '2025-05-16', location: 'Track', heartRate: 176, elevation: 12 },
    { id: 5, type: 'Long Run', distance: 15.3, time: '1:24:18', date: '2025-05-14', location: 'Mountain Route', heartRate: 158, elevation: 320 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Statistics & Analysis</h1>
          <p className="text-gray-600">Track your performance and progress over time</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <button className="btn btn-outline flex items-center gap-2">
              {timeframe === 'weekly' ? 'This Week' : timeframe === 'monthly' ? 'This Month' : 'All Time'}
              <ChevronDown size={16} />
            </button>
            {/* Dropdown menu would go here */}
          </div>
          
          <button className="btn btn-outline flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>
      
      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Distance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">{user.stats.weeklyDistance} km</p>
                <span className="text-xs text-green-500 flex items-center">
                  <ArrowUp size={12} />
                  12%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Pace</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">{user.stats.averagePace}</p>
                <span className="text-xs text-green-500 flex items-center">
                  <ArrowDown size={12} />
                  5%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Activities</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">{user.stats.totalRuns}</p>
                <span className="text-xs text-green-500 flex items-center">
                  <ArrowUp size={12} />
                  8%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Heart Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">156 bpm</p>
                <span className="text-xs text-red-500 flex items-center">
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
        <Card title="Weekly Distance">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="distance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Monthly Progress">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="distance" fill="#10B981" stroke="#10B981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Pace Improvement">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Run Types">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={runTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  label
                >
                  {runTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Activities */}
      <Card title="Recent Activities">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Distance</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Heart Rate</th>
                <th className="pb-3 font-medium">Elevation</th>
                <th className="pb-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{activity.type}</td>
                  <td className="py-3">{activity.distance} km</td>
                  <td className="py-3">{activity.time}</td>
                  <td className="py-3">{new Date(activity.date).toLocaleDateString()}</td>
                  <td className="py-3">{activity.heartRate} bpm</td>
                  <td className="py-3">{activity.elevation} m</td>
                  <td className="py-3 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
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