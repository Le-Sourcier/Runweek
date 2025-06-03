import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Award, Trophy, Medal, Zap, Flag, Timer, MapPin, Flame, Target, Lock, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { motion } from 'framer-motion';
import { useState } from 'react'; // Added useState

// Helper function to get icon component
const getIconComponent = (iconName: string, className: string = "") => { // Added className for theming
  const icons: Record<string, JSX.Element> = {
    'Award': <Award size={24} className={className} />,
    'Trophy': <Trophy size={24} className={className} />,
    'Medal': <Medal size={24} className={className} />,
    'Zap': <Zap size={24} className={className} />,
    'Flag': <Flag size={24} className={className} />,
    'Timer': <Timer size={24} className={className} />,
    'MapPin': <MapPin size={24} className={className} />,
    'Flame': <Flame size={24} className={className} />,
  };
  
  return icons[iconName] || <Award size={24} className={className} />;
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
  const [activeCategory, setActiveCategory] = useState('all');
  
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
  
  const earnedCount = allAchievements.filter(a => a.earnedDate).length;
  const lockedCount = allAchievements.filter(a => !a.earnedDate).length;
  const totalCount = allAchievements.length;

  let filteredAchievements = allAchievements;
  if (activeCategory === 'earned') {
    filteredAchievements = allAchievements.filter(a => a.earnedDate);
  } else if (activeCategory === 'locked') {
    filteredAchievements = allAchievements.filter(a => !a.earnedDate);
  } else if (activeCategory !== 'all') {
    filteredAchievements = allAchievements.filter(a => a.category === activeCategory);
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Celebrate your running milestones and unlock new badges</p>
      </div>
      
      {/* Stats overview */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{earnedCount}</h3>
              <p className="text-muted-foreground text-sm">Badges Earned</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{lockedCount}</h3>
              <p className="text-muted-foreground text-sm">Badges to Unlock</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {totalCount > 0 ? (earnedCount / totalCount * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-muted-foreground text-sm">Completion Rate</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Categories filter */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`btn text-sm px-3 py-1.5 h-auto ${
                activeCategory === category.id
                  ? 'btn-primary'
                  : 'btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </Card>
      
      {/* Unified Achievements Grid */}
      <Card className="bg-card text-card-foreground border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {categories.find(c => c.id === activeCategory)?.name || 'All Achievements'}
        </h2>
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`rounded-lg p-4 flex flex-col items-center text-center transition-opacity h-full ${
                  achievement.earnedDate ? 'bg-background border border-border shadow-sm' : 'bg-muted/50 border border-dashed border-border opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 relative ${
                  achievement.earnedDate ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {getIconComponent(achievement.icon, achievement.earnedDate ? 'text-primary' : 'text-muted-foreground')}
                  {achievement.earnedDate ? (
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-background">
                      <Lock size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    achievement.earnedDate ?
                      (achievement.category === 'distance' ? 'primary' :
                      achievement.category === 'speed' ? 'secondary' :
                      achievement.category === 'habit' ? 'warning' :
                      'default')
                    : 'default'
                  }
                  className="mb-2 text-xs"
                >
                  {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                </Badge>
                <h3 className="font-semibold text-foreground text-md mb-1">{achievement.title}</h3>
                <p className="text-muted-foreground text-xs flex-grow">{achievement.description}</p>
                {achievement.earnedDate && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Earned on {new Date(achievement.earnedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No achievements match this filter. Keep pushing to unlock more!
          </p>
        )}
      </Card>
    </div>
  );
}