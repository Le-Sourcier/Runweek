import React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Calendar, CheckCircle, Play } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { toast } from 'react-toastify';

const trainingPlansData = {
  'p1': {
    id: 'p1',
    title: '5K Improvement Plan',
    duration: '8 weeks',
    level: 'Intermediate',
    description: 'Structured plan to help you improve your 5K time with a mix of speed work and endurance training.',
    weeks: [
      {
        week: 1,
        focus: 'Base Building',
        workouts: [
          { day: 'Monday', type: 'Easy Run', distance: '3-4 km', notes: 'Conversational pace' },
          { day: 'Wednesday', type: 'Tempo Run', distance: '2 km', notes: '5K race pace' },
          { day: 'Friday', type: 'Easy Run', distance: '4-5 km', notes: 'Recovery pace' },
          { day: 'Sunday', type: 'Long Run', distance: '6-7 km', notes: 'Easy effort' }
        ]
      },
      {
        week: 2,
        focus: 'Speed Introduction',
        workouts: [
          { day: 'Monday', type: 'Easy Run', distance: '4 km', notes: 'Conversational pace' },
          { day: 'Wednesday', type: 'Intervals', distance: '4x400m', notes: '5K pace with 90s rest' },
          { day: 'Friday', type: 'Easy Run', distance: '4-5 km', notes: 'Recovery pace' },
          { day: 'Sunday', type: 'Long Run', distance: '7-8 km', notes: 'Easy effort' }
        ]
      }
    ]
  },
  'p2': {
    id: 'p2',
    title: 'Half Marathon Build-Up',
    duration: '12 weeks',
    level: 'Intermediate to Advanced',
    description: 'Progressive plan to prepare you for a half marathon with long runs, tempo sessions, and recovery days.',
    weeks: [
      {
        week: 1,
        focus: 'Base Building',
        workouts: [
          { day: 'Monday', type: 'Easy Run', distance: '5-6 km', notes: 'Conversational pace' },
          { day: 'Wednesday', type: 'Tempo Run', distance: '5 km', notes: 'Comfortably hard' },
          { day: 'Friday', type: 'Easy Run', distance: '4-5 km', notes: 'Recovery pace' },
          { day: 'Sunday', type: 'Long Run', distance: '10-12 km', notes: 'Easy effort' }
        ]
      }
    ]
  },
  'p3': {
    id: 'p3',
    title: 'Recovery & Injury Prevention',
    duration: '4 weeks',
    level: 'All Levels',
    description: 'Focus on proper recovery techniques, strength training, and mobility work to prevent injuries.',
    weeks: [
      {
        week: 1,
        focus: 'Foundation',
        workouts: [
          { day: 'Monday', type: 'Easy Run', distance: '3-4 km', notes: 'Very easy pace' },
          { day: 'Tuesday', type: 'Strength', distance: '30 min', notes: 'Core and glutes focus' },
          { day: 'Thursday', type: 'Easy Run', distance: '4-5 km', notes: 'Focus on form' },
          { day: 'Saturday', type: 'Cross Training', distance: '30-45 min', notes: 'Swimming or cycling' }
        ]
      }
    ]
  }
};

const TrainingPlan: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [isStarted, setIsStarted] = useState(false);
  const plan = planId ? trainingPlansData[planId as keyof typeof trainingPlansData] : null;

  const handleStartPlan = () => {
    setIsStarted(true);
    toast.success(`Plan "${plan?.title}" démarré avec succès !`);
  };

  if (!plan) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Plan non trouvé</h1>
          <Link to="/coach" className="btn btn-primary">
            Retour au Coach
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/coach" className="btn btn-ghost">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{plan.title}</h1>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Durée</p>
              <p className="font-semibold text-foreground">{plan.duration}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target size={20} className="text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Niveau</p>
              <p className="font-semibold text-foreground">{plan.level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Semaines</p>
              <p className="font-semibold text-foreground">{plan.weeks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {plan.weeks.map((week) => (
          <Card key={week.week} title={`Semaine ${week.week} - ${week.focus}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {week.workouts.map((workout, index) => (
                <div key={index} className="p-4 bg-background border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{workout.day}</h4>
                    <Badge variant="outline" className="text-xs">
                      {workout.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{workout.distance}</p>
                  <p className="text-xs text-muted-foreground">{workout.notes}</p>
                  <div className="mt-3 flex justify-end">
                    <button className="btn btn-ghost btn-sm text-green-500 hover:bg-green-500/10">
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={handleStartPlan}
          disabled={isStarted}
          className={`btn ${isStarted ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
        >
          {isStarted ? (
            <>
              <CheckCircle size={16} />
              Plan démarré
            </>
          ) : (
            <>
              <Play size={16} />
              Commencer ce plan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TrainingPlan;
