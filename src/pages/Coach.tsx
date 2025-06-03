import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import { Brain, Send, Calendar, Clock, BarChart2, Target, ChevronDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for coach tips
const coachTips = [
  { 
    id: 't1',
    title: 'Improve Your Cadence',
    description: 'Aim for 170-180 steps per minute to optimize your running efficiency and reduce injury risk.',
    icon: 'Clock'
  },
  { 
    id: 't2',
    title: 'Post-Run Recovery',
    description: 'Try foam rolling within 30 minutes of long runs to help release tension in muscles and fascia.',
    icon: 'Activity'
  },
  { 
    id: 't3',
    title: 'Hill Training',
    description: 'Include hill repeats in your weekly routine to build strength and improve your form on flat terrain.',
    icon: 'TrendingUp'
  },
];

// Mock data for training plans
const trainingPlans = [
  {
    id: 'p1',
    title: '5K Improvement Plan',
    duration: '8 weeks',
    level: 'Intermediate',
    description: 'Structured plan to help you improve your 5K time with a mix of speed work and endurance training.'
  },
  {
    id: 'p2',
    title: 'Half Marathon Build-Up',
    duration: '12 weeks',
    level: 'Intermediate to Advanced',
    description: 'Progressive plan to prepare you for a half marathon with long runs, tempo sessions, and recovery days.'
  },
  {
    id: 'p3',
    title: 'Recovery & Injury Prevention',
    duration: '4 weeks',
    level: 'All Levels',
    description: 'Focus on proper recovery techniques, strength training, and mobility work to prevent injuries.'
  },
];

export default function Coach() {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'coach', message: string}>>([
    {
      role: 'coach',
      message: "Hi there! I'm your running coach AI. How can I help you today with your training?"
    }
  ]);
  
  const handleSendMessage = () => {
    if (!query.trim()) return;
    
    // Add user message
    setConversation(prev => [...prev, { role: 'user', message: query }]);
    
    // Simulate coach response
    setTimeout(() => {
      let response = '';
      if (query.toLowerCase().includes('half marathon')) {
        response = "For half marathon training, I recommend focusing on building your long run each week. Based on your recent activities, you should aim for a 14km long run this weekend, with two shorter runs during the week. Make sure to include a recovery day after your long run.";
      } else if (query.toLowerCase().includes('pace')) {
        response = "Your current average pace is 5:32 min/km. To improve, try incorporating tempo runs once a week, where you run at a comfortably hard pace (about 5:10 min/km) for 20-30 minutes after a warm-up.";
      } else if (query.toLowerCase().includes('injury') || query.toLowerCase().includes('pain')) {
        response = "I notice you're concerned about injury. It's always important to listen to your body. Make sure you're warming up properly before runs, and consider adding strength training 2 days per week to build resilience. If pain persists, please consult a healthcare professional.";
      } else {
        response = "Based on your recent running data, I'd suggest focusing on consistency this week. Try for 3-4 runs with at least one day of rest between harder efforts. Your endurance is improving nicely, and we should capitalize on that momentum.";
      }
      
      setConversation(prev => [...prev, { role: 'coach', message: response }]);
    }, 1000);
    
    // Clear input
    setQuery('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="text-gray-600">Get personalized training advice and running tips</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coach chat */}
        <Card className="lg:col-span-8 p-0 flex flex-col h-[600px]">
          {/* Chat header */}
          <div className="p-4 border-b flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="font-medium">Running Coach AI</h3>
              <p className="text-sm text-gray-500">Personalized training advice</p>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your coach something..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!query.trim()}
                className="btn btn-primary flex items-center gap-2"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </Card>
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coach insights */}
          <Card title="Weekly Focus">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start gap-3">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-secondary shrink-0">
                <Target size={20} />
              </div>
              <div>
                <h4 className="font-medium">Building Base Endurance</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This week, focus on easy runs to build your aerobic base. Keep your heart rate below 75% of your max.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Suggested Workouts</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Easy Run</p>
                    <p className="text-sm text-gray-500">5-6 km at conversational pace</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Long Run</p>
                    <p className="text-sm text-gray-500">10-12 km at easy pace</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Recovery</p>
                    <p className="text-sm text-gray-500">3-4 km very easy + strength</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Training plans */}
          <Card title="Training Plans">
            <div className="space-y-3">
              {trainingPlans.map((plan) => (
                <div key={plan.id} className="p-3 border rounded-lg hover:border-primary hover:shadow-sm transition-all">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{plan.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {plan.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <button className="mt-2 text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    View plan <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Running tips */}
      <Card title="Coach Tips">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coachTips.map((tip) => (
            <div key={tip.id} className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-3">
                <Clock size={20} />
              </div>
              <h4 className="font-medium mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}