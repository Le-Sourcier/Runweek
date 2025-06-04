import { useState, useEffect } from 'react'; // Added useEffect
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal'; // Import Modal
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { Target, Plus, Calendar, Trophy, TrendingUp, Clock, ArrowRight, PlusCircle } from 'lucide-react'; // Added PlusCircle
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

  // Modal and Form States
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('distance');
  const [newGoalTarget, setNewGoalTarget] = useState<number | ''>('');
  const [newGoalUnit, setNewGoalUnit] = useState(''); // e.g., km, minutes, sessions
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  // Extended goals with categories for UI display
  const [goals, setGoals] = useState<GoalType[]>([
    // ... existing mock goals ...
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

  const handleOpenAddGoalModal = (suggestion?: typeof goalSuggestions[0]) => {
    if (suggestion) {
      setNewGoalTitle(suggestion.title);
      setNewGoalDescription(suggestion.description || '');
      setNewGoalCategory(suggestion.category as GoalCategory);
      setNewGoalTarget(suggestion.target);
      setNewGoalUnit(suggestion.unit);
      setNewGoalDeadline(''); // Or suggest a deadline
    } else {
      // Reset form states for a new blank goal
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalCategory('distance');
      setNewGoalTarget('');
      setNewGoalUnit('');
      setNewGoalDeadline('');
    }
    setIsAddGoalModalOpen(true);
  };

  const handleSaveNewGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newGoalTitle || newGoalTarget === '' || !newGoalUnit || !newGoalDeadline || !newGoalCategory) {
      alert('Please fill in all required fields: Title, Category, Target, Unit, and Deadline.');
      return;
    }
    const newGoal: GoalType = {
      id: `g${Date.now()}`, // Simple unique ID
      title: newGoalTitle,
      description: newGoalDescription,
      category: newGoalCategory,
      target: Number(newGoalTarget),
      current: 0, // New goals start at 0 progress
      unit: newGoalUnit,
      deadline: newGoalDeadline,
      completed: false,
    };
    setGoals(prevGoals => [newGoal, ...prevGoals]);
    setIsAddGoalModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Running Goals</h1>
          <p className="text-muted-foreground">Track your progress and set new targets</p>
        </div>

        <button
          onClick={() => handleOpenAddGoalModal()}
          className="btn btn-primary"
        >
          <PlusCircle size={18} className="mr-2" />
          Add New Goal
        </button>
      </div>

      {/* Progress overview */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="flex flex-col justify-center items-center text-center p-4 bg-background rounded-lg">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{goals.length}</h3>
            <p className="text-muted-foreground text-sm">Total Goals</p>
          </div>

          <div className="col-span-1 md:col-span-3 flex flex-col justify-center p-4 bg-background rounded-lg">
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-medium text-muted-foreground">
                {completedGoals.length} of {goals.length} completed
              </span>
            </div>
            <ProgressBar
              value={completedGoals.length}
              max={goals.length}
              height="lg"
              className="bg-muted"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="primary" className="text-xs flex items-center gap-1"><TrendingUp size={12} /> Distance</Badge>
              <Badge variant="secondary" className="text-xs flex items-center gap-1"><Clock size={12} /> Speed</Badge>
              <Badge variant="warning" className="text-xs flex items-center gap-1"><Calendar size={12} /> Consistency</Badge>
              <Badge variant="destructive" className="text-xs flex items-center gap-1"><Trophy size={12} /> Events</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Active goals */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-foreground">Active Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Card className="h-full bg-card text-card-foreground border-border">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={
                        goal.category === 'distance' ? 'primary' :
                        goal.category === 'speed' ? 'secondary' :
                        goal.category === 'consistency' ? 'warning' : 'destructive' // Using destructive for event as an example
                      }
                      className="flex items-center gap-1 text-xs"
                    >
                      {categoryIcons[goal.category]} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mt-2 text-foreground">{goal.title}</h3>
                  {goal.description && <p className="text-muted-foreground text-sm mt-1 flex-grow">{goal.description}</p>}

                  <div className="mt-4">
                    <ProgressBar
                      value={goal.current}
                      max={goal.target}
                      showPercentage
                      className="bg-muted"
                    />
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-muted-foreground">{goal.current} {goal.unit}</span>
                      <span className="text-muted-foreground">Target: {goal.target} {goal.unit}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-card text-card-foreground border-border py-8 text-center">
            <Trophy size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No active goals. Set some new targets!</p>
          </Card>
        )}
      </div>

      {/* Suggestions */}
      <Card title="Suggested Goals" className="bg-card text-card-foreground border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goalSuggestions.map((goal) => (
            <div
              key={goal.id}
              className="p-4 border border-border rounded-lg hover:shadow-lg transition-all bg-background"
            >
              <Badge
                variant={
                  goal.category === 'distance' ? 'primary' :
                  goal.category === 'speed' ? 'secondary' :
                  goal.category === 'consistency' ? 'warning' : 'destructive'
                }
                className="mb-2 flex items-center gap-1 inline-flex text-xs"
              >
                {categoryIcons[goal.category as GoalCategory]} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </Badge>
              <h4 className="font-medium text-foreground">{goal.title}</h4>
              {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-foreground">
                  Target: {goal.target} {goal.unit}
                </span>
                <button
                  onClick={() => handleOpenAddGoalModal(goal)}
                  className="btn btn-ghost btn-sm text-primary p-1 h-auto hover:bg-primary/10"
                >
                  Add <Plus size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Completed goals */}
      <div className="pt-2">
        <h2 className="text-xl font-semibold mb-3 text-foreground">Completed Goals</h2>
        <Card className="bg-card text-card-foreground border-border">
          {completedGoals.length > 0 ? (
            <div className="divide-y divide-border">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {/* Assuming deadline is completion date for now */}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {goal.target} {goal.unit}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No completed goals yet</h3>
              <p className="text-muted-foreground mb-4">Keep working toward your targets!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}