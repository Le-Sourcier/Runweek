import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { AddEditGoalModal, UserGoalFormData } from '../components/goals/AddEditGoalModal';
import { UserGoal, GoalCategory } from '../types'; // Import UserGoal and GoalCategory from types
import { Target, PlusCircle, Calendar, Trophy, TrendingUp, Clock, Edit2, Trash2, CheckCircle, Circle, RotateCcw } from 'lucide-react'; // Added more icons
import { motion } from 'framer-motion';

// Mock data for goal suggestions - category should match GoalCategory type
const goalSuggestions: Array<Omit<UserGoal, 'id' | 'current' | 'completed' | 'deadline'> & { deadline?: string }> = [
  {
    title: 'Run 5 days in a week',
    category: 'consistency',
    target: 5,
    unit: 'days',
    description: 'Build consistency with five running days each week'
  },
  {
    title: 'Improve 5K time',
    category: 'speed',
    target: 25, // Assuming target is in minutes for speed goal
    unit: 'minutes', // Target unit for time
    description: 'Train to run 5K under 25 minutes'
  },
  {
    title: 'Complete a half marathon',
    category: 'event',
    target: 21.1,
    unit: 'km',
    description: 'Train for and run a half marathon distance'
  },
];

export default function Goals() {
  const { user, addGoal, updateGoal, deleteGoal: deleteContextGoal } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | undefined>(undefined);

  const allUserGoals = user?.goals || [];
  const activeGoals = allUserGoals.filter(goal => !goal.completed);
  const completedGoals = allUserGoals.filter(goal => goal.completed);

  const categoryIcons: Record<GoalCategory, JSX.Element> = {
    distance: <TrendingUp size={16} />,
    speed: <Clock size={16} />,
    consistency: <Calendar size={16} />,
    event: <Trophy size={16} />,
    other: <Target size={16} /> // Default icon for 'other'
  };

  const handleOpenAddModal = (suggestion?: Omit<UserGoal, 'id' | 'current' | 'completed' | 'deadline'> & { deadline?: string }) => {
    if (suggestion) {
      setEditingGoal({
        id: '', // Important: ID is empty for new goal from suggestion
        title: suggestion.title,
        category: suggestion.category,
        description: suggestion.description || '',
        target: suggestion.target,
        unit: suggestion.unit,
        deadline: suggestion.deadline || new Date().toISOString().split('T')[0], // Default deadline if not provided
        current: 0,
        completed: false,
      });
    } else {
      setEditingGoal(undefined); // Clear any previous editing state for a truly new goal
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: UserGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteContextGoal(goalId);
    }
  };

  const handleToggleComplete = (goal: UserGoal) => {
    const newCompletedStatus = !goal.completed;
    let newCurrentValue = goal.current;
    // If marking complete and progress isn't full, set progress to target
    if (newCompletedStatus && goal.current < goal.target) {
      newCurrentValue = goal.target;
    }
    // If reopening a completed goal, and it was auto-completed, user might want to reset progress or adjust.
    // For now, just toggle completed status. Progress remains.
    updateGoal(goal.id, { completed: newCompletedStatus, current: newCurrentValue });
  };

  const handleModalSubmit = (data: UserGoalFormData) => {
    const goalDataPayload = {
      title: data.title,
      description: data.description,
      category: data.category,
      target: Number(data.target),
      unit: data.unit,
      deadline: data.deadline,
      // current and completed are handled by addGoal/updateGoal logic
    };

    if (editingGoal && editingGoal.id) { // Editing existing goal
      updateGoal(editingGoal.id, goalDataPayload);
    } else { // Adding new goal (editingGoal might be a template from suggestion without an id, or undefined)
      addGoal(goalDataPayload);
    }
    setIsModalOpen(false);
    setEditingGoal(undefined);
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Running Goals</h1>
          <p className="text-muted-foreground">Track your progress and set new targets</p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
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
            <h3 className="text-2xl font-bold text-foreground">{allUserGoals.length}</h3>
            <p className="text-muted-foreground text-sm">Total Goals</p>
          </div>

          <div className="col-span-1 md:col-span-3 flex flex-col justify-center p-4 bg-background rounded-lg">
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-medium text-muted-foreground">
                {completedGoals.length} of {allUserGoals.length} completed
              </span>
            </div>
            <ProgressBar
              value={completedGoals.length}
              max={allUserGoals.length > 0 ? allUserGoals.length : 1} // Avoid division by zero if no goals
              height="lg"
              className="bg-muted"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.keys(categoryIcons).map(catKey => (
                <Badge
                  key={catKey}
                  variant={
                    catKey === 'distance' ? 'primary' :
                    catKey === 'speed' ? 'secondary' :
                    catKey === 'consistency' ? 'warning' :
                    catKey === 'event' ? 'destructive' : 'default'
                  }
                  className="text-xs flex items-center gap-1"
                >
                  {categoryIcons[catKey as GoalCategory]} {catKey.charAt(0).toUpperCase() + catKey.slice(1)}
                </Badge>
              ))}
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
                <Card className="h-full bg-card text-card-foreground border-border flex flex-col">
                  <div className="flex justify-between items-start">
                    {(() => {
                      const currentCategory = (goal.category && typeof goal.category === 'string' && categoryIcons[goal.category]) ? goal.category : 'other';
                      const categoryText = (currentCategory && typeof currentCategory === 'string' && currentCategory.length > 0)
                                           ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
                                           : 'Other';
                      return (
                        <Badge
                          variant={
                            currentCategory === 'distance' ? 'primary' :
                            currentCategory === 'speed' ? 'secondary' :
                            currentCategory === 'consistency' ? 'warning' :
                            currentCategory === 'event' ? 'destructive' : 'default'
                          }
                          className="flex items-center gap-1 text-xs"
                        >
                          {categoryIcons[currentCategory]} {categoryText}
                        </Badge>
                      );
                    })()}
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mt-2 text-foreground">{goal.title}</h3>
                  {goal.description && <p className="text-muted-foreground text-sm mt-1 flex-grow mb-3">{goal.description}</p>}

                  <div className="mt-auto"> {/* Pushes controls to the bottom */}
                    <ProgressBar
                      value={goal.current}
                      max={goal.target}
                      showPercentage
                      className="bg-muted mb-1"
                    />
                    <div className="flex justify-between mt-1 text-xs mb-3">
                      <span className="text-muted-foreground">{goal.current} {goal.unit}</span>
                      <span className="text-muted-foreground">Target: {goal.target} {goal.unit}</span>
                    </div>
                    <div className="flex justify-end gap-1 border-t border-border pt-2 mt-2">
                       <button onClick={() => handleToggleComplete(goal)} className="btn btn-ghost btn-sm text-green-500 hover:bg-green-500/10 p-1.5">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleOpenEditModal(goal)} className="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-500/10 p-1.5">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="btn btn-ghost btn-sm text-destructive hover:bg-destructive/10 p-1.5">
                        <Trash2 size={16} />
                      </button>
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
          {goalSuggestions.map((suggestion) => (
            <div
              key={suggestion.title} // Use title as key for suggestions as they don't have stable IDs
              className="p-4 border border-border rounded-lg hover:shadow-lg transition-all bg-background flex flex-col"
            >
              {(() => {
                const currentSuggestionCategory = (suggestion.category && typeof suggestion.category === 'string' && categoryIcons[suggestion.category]) ? suggestion.category : 'other';
                const categorySuggestionText = (currentSuggestionCategory && typeof currentSuggestionCategory === 'string' && currentSuggestionCategory.length > 0)
                                                 ? currentSuggestionCategory.charAt(0).toUpperCase() + currentSuggestionCategory.slice(1)
                                                 : 'Other';
                return (
                  <Badge
                    variant={
                      currentSuggestionCategory === 'distance' ? 'primary' :
                      currentSuggestionCategory === 'speed' ? 'secondary' :
                      currentSuggestionCategory === 'consistency' ? 'warning' :
                      currentSuggestionCategory === 'event' ? 'destructive' : 'default'
                    }
                    className="mb-2 flex items-center gap-1 inline-flex text-xs self-start"
                  >
                    {categoryIcons[currentSuggestionCategory]} {categorySuggestionText}
                  </Badge>
                );
              })()}
              <h4 className="font-medium text-foreground">{suggestion.title}</h4>
              {suggestion.description && <p className="text-sm text-muted-foreground mt-1 flex-grow">{suggestion.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-foreground">
                  Target: {suggestion.target} {suggestion.unit}
                </span>
                <button
                  onClick={() => handleOpenAddModal(suggestion)}
                  className="btn btn-ghost btn-sm text-primary p-1 h-auto hover:bg-primary/10"
                >
                  Add <PlusCircle size={14} className="ml-1" />
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
              {completedGoals.map((goal, index) => ( // Added index for animation
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground line-through">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {/* Assuming deadline is completion date for now */}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">
                      {goal.target} {goal.unit}
                    </Badge>
                    <button onClick={() => handleToggleComplete(goal)} className="btn btn-ghost btn-sm text-amber-500 hover:bg-amber-500/10 p-1.5" title="Reopen Goal">
                      <RotateCcw size={16} />
                    </button>
                     <button onClick={() => handleDeleteGoal(goal.id)} className="btn btn-ghost btn-sm text-destructive hover:bg-destructive/10 p-1.5" title="Delete Goal">
                        <Trash2 size={16} />
                      </button>
                  </div>
                </motion.div>
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

      {/* Modal for Adding/Editing Goals */}
      <AddEditGoalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGoal(undefined); }}
        onSubmit={handleModalSubmit}
        goalToEdit={editingGoal}
        // isLoading={isSubmittingGoal} // Assuming you might add a loading state for form submission
      />
    </div>
  );
}