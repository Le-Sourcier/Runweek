import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { Target, Plus, Calendar, Trophy, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Types for goals
type GoalCategory = 'distance' | 'speed' | 'consistency' | 'event';

type GoalType = {
  id: string;
  title: string;
  category: GoalCategory;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  description?: string;
  completed: boolean;
};

// Mock data for goal suggestions
const goalSuggestions = [
  {
    id: 'gs1',
    title: 'Run 5 days in a week',
    category: 'consistency',
    target: 5,
    unit: 'days',
    description: 'Build consistency with five running days each week'
  },
  {
    id: 'gs2',
    title: 'Improve 5K time',
    category: 'speed',
    target: 25,
    unit: 'minutes',
    description: 'Train to run 5K under 25 minutes'
  },
  {
    id: 'gs3',
    title: 'Complete a half marathon',
    category: 'event',
    target: 21.1,
    unit: 'km',
    description: 'Train for and run a half marathon distance'
  },
];

export default function Goals() {
  const { user } = useUser();
  
  // Extended goals with categories for UI display
  const [goals, setGoals] = useState<GoalType[]>([
    {
      id: 'g1',
      title: 'Weekly Distance',
      category: 'distance',
      target: 40,
      current: 23.4,
      unit: 'km',
      deadline: '2025-06-01',
      description: 'Run 40km each week to build endurance',
      completed: false,
    },
    {
      id: 'g2',
      title: 'Run a Half Marathon',
      category: 'event',
      target: 21.1,
      current: 15,
      unit: 'km',
      deadline: '2025-07-15',
      description: 'Complete a half marathon race or training run',
      completed: false,
    },
    {
      id: 'g3',
      title: 'Morning Runs',
      category: 'consistency',
      target: 15,
      current: 12,
      unit: 'runs',
      deadline: '2025-06-30',
      description: 'Complete 15 morning runs to build the habit',
      completed: false,
    },
    {
      id: 'g4',
      title: 'Improve 5K Time',
      category: 'speed',
      target: 25,
      current: 26.5,
      unit: 'minutes',
      deadline: '2025-06-15',
      description: 'Train to run 5K under 25 minutes',
      completed: false,
    },
    {
      id: 'g5',
      title: '10 Hill Workouts',
      category: 'consistency',
      target: 10,
      current: 4,
      unit: 'workouts',
      deadline: '2025-07-30',
      description: 'Complete 10 hill workout sessions to build strength',
      completed: false,
    },
  ]);
  
  // Active and completed goals
  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);
  
  // Goal cards color mapping
  const categoryColors = {
    distance: 'blue',
    speed: 'green',
    consistency: 'orange',
    event: 'purple',
  };
  
  const categoryIcons = {
    distance: <TrendingUp size={16} />,
    speed: <Clock size={16} />,
    consistency: <Calendar size={16} />,
    event: <Trophy size={16} />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Running Goals</h1>
          <p className="text-gray-600">Track your progress and set new targets</p>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add New Goal
        </button>
      </div>
      
      {/* Progress overview */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="flex flex-col justify-center items-center text-center p-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Target size={28} />
            </div>
            <h3 className="text-2xl font-bold">{goals.length}</h3>
            <p className="text-gray-500">Total Goals</p>
          </div>
          
          <div className="col-span-3 flex flex-col justify-center">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">
                {completedGoals.length} of {goals.length} completed
              </span>
            </div>
            <ProgressBar 
              value={completedGoals.length} 
              max={goals.length} 
              height="lg" 
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge variant="primary" className="flex items-center gap-1">
                <TrendingUp size={12} /> Distance
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock size={12} /> Speed
              </Badge>
              <Badge variant="warning" className="flex items-center gap-1">
                <Calendar size={12} /> Consistency
              </Badge>
              <Badge variant="error" className="flex items-center gap-1">
                <Trophy size={12} /> Events
              </Badge>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Active goals */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Active Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex justify-between items-start">
                  <Badge 
                    variant={
                      goal.category === 'distance' ? 'primary' : 
                      goal.category === 'speed' ? 'secondary' : 
                      goal.category === 'consistency' ? 'warning' : 'error'
                    }
                    className="flex items-center gap-1"
                  >
                    {categoryIcons[goal.category]} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mt-2">{goal.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                
                <div className="mt-4">
                  <ProgressBar 
                    value={goal.current} 
                    max={goal.target} 
                    showPercentage 
                  />
                  <div className="flex justify-between mt-1 text-sm">
                    <span>{goal.current} {goal.unit}</span>
                    <span className="text-gray-500">Target: {goal.target} {goal.unit}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Suggestions */}
      <Card title="Suggested Goals">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goalSuggestions.map((goal) => (
            <div 
              key={goal.id}
              className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
            >
              <Badge 
                variant={
                  goal.category === 'distance' ? 'primary' : 
                  goal.category === 'speed' ? 'secondary' : 
                  goal.category === 'consistency' ? 'warning' : 'error'
                }
                className="mb-2 flex items-center gap-1 inline-flex"
              >
                {categoryIcons[goal.category as GoalCategory]} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </Badge>
              <h4 className="font-medium">{goal.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium">
                  Target: {goal.target} {goal.unit}
                </span>
                <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                  Add <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Completed goals */}
      <div className="pt-2">
        <h2 className="text-xl font-semibold mb-3">Completed Goals</h2>
        <Card>
          {completedGoals.length > 0 ? (
            <div className="divide-y">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">
                    {goal.target} {goal.unit}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-1">No completed goals yet</h3>
              <p className="text-gray-500 mb-4">Keep working toward your targets!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}