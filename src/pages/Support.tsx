import { useState } from 'react';
import Card from '../components/ui/Card';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Video, 
  Search, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

// FAQ data
const faqs = [
  {
    id: 'f1',
    question: 'How do I track my runs?',
    answer: 'Runweek allows you to manually log your runs or connect with compatible fitness devices and apps to automatically sync your runs. Go to the Dashboard and click on "Log Activity" to get started.'
  },
  {
    id: 'f2',
    question: 'How does the AI coach work?',
    answer: 'Our AI coach analyzes your running data to provide personalized training recommendations. It considers your goals, fitness level, and running history to suggest workouts, recovery times, and training plans.'
  },
  {
    id: 'f3',
    question: 'Can I connect Runweek to my smartwatch?',
    answer: 'Yes! Runweek integrates with most popular fitness devices and platforms including Garmin, Fitbit, Apple Watch, and more. Go to Profile > Connected Devices to set up the connection.'
  },
  {
    id: 'f4',
    question: 'How do I set up a training plan?',
    answer: 'You can access training plans from the Coach section. Browse available plans or let our AI coach suggest one based on your goals. Once selected, the plan will be added to your calendar automatically.'
  },
  {
    id: 'f5',
    question: 'Is there a mobile app for Runweek?',
    answer: 'Yes, Runweek is available as a mobile app for both iOS and Android. You can download it from the App Store or Google Play Store and sync your data across all your devices.'
  },
];

// Help categories
const helpCategories = [
  { id: 'c1', title: 'Getting Started', icon: <Book size={24} />, count: 12 },
  { id: 'c2', title: 'Account & Settings', icon: <HelpCircle size={24} />, count: 15 },
  { id: 'c3', title: 'Tracking & Data', icon: <Search size={24} />, count: 8 },
  { id: 'c4', title: 'Goals & Achievements', icon: <HelpCircle size={24} />, count: 10 },
  { id: 'c5', title: 'AI Coach', icon: <HelpCircle size={24} />, count: 6 },
  { id: 'c6', title: 'Troubleshooting', icon: <HelpCircle size={24} />, count: 9 },
];

// Video tutorials
const tutorials = [
  { 
    id: 't1', 
    title: 'Getting Started with Runweek', 
    duration: '3:45',
    thumbnail: 'https://images.pexels.com/photos/3912953/pexels-photo-3912953.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    id: 't2', 
    title: 'Setting Effective Running Goals', 
    duration: '5:12',
    thumbnail: 'https://images.pexels.com/photos/6456052/pexels-photo-6456052.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    id: 't3', 
    title: 'Using the AI Coach Feature', 
    duration: '4:30',
    thumbnail: 'https://images.pexels.com/photos/6111616/pexels-photo-6111616.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);
  
  // Toggle FAQ expansion
  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-gray-600">Find answers and resources to help you use Runweek</p>
      </div>
      
      {/* Search */}
      <Card>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help topics..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {helpCategories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium">{category.title}</h3>
                  <p className="text-sm text-gray-500">{category.count} articles</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
      
      {/* Quick Help Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* FAQs */}
        <Card className="md:col-span-7" title="Frequently Asked Questions">
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div 
                key={faq.id}
                className="border rounded-lg overflow-hidden"
              >
                <button 
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <h3 className="font-medium text-left">{faq.question}</h3>
                  {expandedFaqs.includes(faq.id) ? (
                    <ChevronUp size={18} className="text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500 shrink-0" />
                  )}
                </button>
                
                {expandedFaqs.includes(faq.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          
          <button className="mt-4 text-primary font-medium flex items-center gap-1 hover:underline">
            View all FAQs <ArrowRight size={14} />
          </button>
        </Card>
        
        {/* Contact */}
        <Card className="md:col-span-5" title="Contact Support">
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-primary">support@runweek.com</p>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-sm text-gray-500">Available 9am - 5pm ET</p>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-full mt-4">
            Contact Support
          </button>
        </Card>
      </div>
      
      {/* Video Tutorials */}
      <Card title="Video Tutorials">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div 
              key={tutorial.id}
              className="overflow-hidden rounded-lg border hover:shadow-md transition-all"
            >
              <div className="relative">
                <img 
                  src={tutorial.thumbnail} 
                  alt={tutorial.title}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {tutorial.duration}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium">{tutorial.title}</h3>
                <button className="text-primary text-sm flex items-center gap-1 mt-2 hover:underline">
                  Watch tutorial <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="mt-4 text-primary font-medium flex items-center gap-1 hover:underline">
          Browse all tutorials <ArrowRight size={14} />
        </button>
      </Card>
    </div>
  );
}