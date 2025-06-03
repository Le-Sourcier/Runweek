import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Award, Trophy, Medal, Zap, Flag, Timer, MapPin, Flame, Target, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    'Award': <Award size={24} />,
    'Trophy': <Trophy size={24} />,
    'Medal': <Medal size={24} />,
    'Zap': <Zap size={24} />,
    'Flag': <Flag size={24} />,
    'Timer': <Timer size={24} />,
    'MapPin': <MapPin size={24} />,
    'Flame': <Flame size={24} />,
  };
  
  return icons[iconName] || <Award size={24} />;
};

// Additional achievements data
const allAchievements = [
  {
    id: 'a1',
    title: 'First Run',
    description: 'Completed your first run',
    icon: 'Award',
    earnedDate: '2023-05-18',
    category: 'beginner'
  },
  {
    id: 'a2',
    title: '10K Club',
    description: 'Completed a 10K run',
    icon: 'Medal',
    earnedDate: '2023-06-02',
    category: 'distance'
  },
  {
    id: 'a3',
    title: 'Early Bird',
    description: 'Completed 5 runs before 7 AM',
    icon: 'Zap',
    earnedDate: '2023-07-10',
    category: 'habit'
  },
  {
    id: 'a4',
    title: 'Half Marathon',
    description: 'Completed a half marathon distance',
    icon: 'Trophy',
    earnedDate: null,
    category: 'distance'
  },
  {
    id: 'a5',
    title: 'Week Streak',
    description: 'Ran for 7 consecutive days',
    icon: 'Flame',
    earnedDate: '2023-08-22',
    category: 'consistency'
  },
  {
    id: 'a6',
    title: 'Speed Demon',
    description: 'Ran 1 km in under 4 minutes',
    icon: 'Timer',
    earnedDate: null,
    category: 'speed'
  },
  {
    id: 'a7',
    title: 'Elevation Master',
    description: 'Accumulated 1000m of elevation gain',
    icon: 'MapPin',
    earnedDate: null,
    category: 'challenge'
  },
  {
    id: 'a8',
    title: 'Marathon Finisher',
    description: 'Completed a full marathon',
    icon: 'Flag',
    earnedDate: null,
    category: 'distance'
  },
  {
    id: 'a9',
    title: 'Night Runner',
    description: 'Completed 5 runs after 8 PM',
    icon: 'Zap',
    earnedDate: '2023-09-15',
    category: 'habit'
  },
  {
    id: 'a10',
    title: '100 km Club',
    description: 'Ran a total of 100 kilometers',
    icon: 'Medal',
    earnedDate: '2024-01-10',
    category: 'milestone'
  },
  {
    id: 'a11',
    title: 'All-Weather Runner',
    description: 'Ran in rain, snow, and heat',
    icon: 'Award',
    earnedDate: null,
    category: 'challenge'
  },
  {
    id: 'a12',
    title: '500 km Club',
    description: 'Ran a total of 500 kilometers',
    icon: 'Trophy',
    earnedDate: null,
    category: 'milestone'
  },
];

export default function Achievements() {
  const { user } = useUser();
  
  if (!user) return null;
  
  // Categories for achievements
  const categories = [
    { id: 'all', name: 'All Achievements' },
    { id: 'earned', name: 'Earned' },
    { id: 'locked', name: 'Locked' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'distance', name: 'Distance' },
    { id: 'speed', name: 'Speed' },
    { id: 'habit', name: 'Habits' },
    { id: 'consistency', name: 'Consistency' },
    { id: 'challenge', name: 'Challenges' },
    { id: 'milestone', name: 'Milestones' },
  ];
  
  // Filter achievements (if we had filtering functionality)
  const earnedAchievements = allAchievements.filter(a => a.earnedDate);
  const lockedAchievements = allAchievements.filter(a => !a.earnedDate);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-gray-600">Celebrate your running milestones and unlock new badges</p>
      </div>
      
      {/* Stats overview */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{earnedAchievements.length}</h3>
              <p className="text-gray-500">Badges Earned</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              <Lock size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{lockedAchievements.length}</h3>
              <p className="text-gray-500">Badges to Unlock</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center">
              <Target size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                {(earnedAchievements.length / allAchievements.length * 100).toFixed(0)}%
              </h3>
              <p className="text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Categories filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm font-medium
              ${category.id === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Earned achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Earned Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {earnedAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center p-6 h-full">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary-light bg-opacity-20 text-primary flex items-center justify-center mb-3 relative">
                    {getIconComponent(achievement.icon)}
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      achievement.category === 'distance' ? 'primary' : 
                      achievement.category === 'speed' ? 'secondary' : 
                      achievement.category === 'habit' ? 'warning' : 
                      'default'
                    }
                    className="mb-2"
                  >
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </Badge>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Earned on {new Date(achievement.earnedDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Locked achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Badges to Unlock</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lockedAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center p-6 h-full opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-3 relative">
                    {getIconComponent(achievement.icon)}
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-gray-500 rounded-full flex items-center justify-center">
                      <Lock size={10} className="text-white" />
                    </div>
                  </div>
                  <Badge 
                    variant="default"
                    className="mb-2"
                  >
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </Badge>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{achievement.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}