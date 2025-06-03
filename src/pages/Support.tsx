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
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<string | null>(null);

  // Placeholder FAQs for selected categories
  const categorySpecificFaqs: Record<string, { id: string; question: string; answer: string; categoryId?: string }[]> = {
    'c1': [{ id: 'gs1', question: 'How do I sign up for Runweek?', answer: 'Visit our website and click the "Sign Up" button. Follow the on-screen instructions.' }, { id: 'gs2', question: 'What are the main features?', answer: 'Run tracking, AI coaching, goal setting, achievements, and more!' }],
    'c2': [{ id: 'as1', question: 'How can I change my registered email address?', answer: 'Go to Profile > Edit Profile to update your email.' }, { id: 'as2', question: 'Where can I manage my subscription?', answer: 'Subscription details can be found in Settings > Billing.' }],
    'c3': [{ id: 'td1', question: 'My GPS data seems inaccurate, what can I do?', answer: 'Ensure your device has a clear view of the sky and that location services are enabled with high accuracy.' }],
    'c4': [{ id: 'ga1', question: 'How are goal completion percentages calculated?', answer: 'It is based on the progress you make towards the target you set for each goal.' }],
    'c5': [{ id: 'ai1', question: 'How often does the AI coach provide new recommendations?', answer: 'The AI coach typically updates recommendations weekly, or after significant changes in your training.' }],
    'c6': [{ id: 'ts1', question: 'The app is crashing, what should I do?', answer: 'Try restarting the app. If the problem persists, check for updates or contact our support team.' }],
  };
  
  let displayedFaqs = faqs; // Default to all FAQs
  let faqTitle = "Frequently Asked Questions";

  if (selectedHelpCategory) {
    const category = helpCategories.find(c => c.id === selectedHelpCategory);
    if (category) {
      faqTitle = `FAQs for ${category.title}`;
      displayedFaqs = categorySpecificFaqs[selectedHelpCategory] ||
                      [{id: 'cat_ph', question: `No specific FAQs for ${category.title} yet.`, answer: 'Placeholder content for this category will appear here. Broader FAQs are shown below.'}, ...faqs];
      if (!categorySpecificFaqs[selectedHelpCategory]) {
         // If no specific FAQs, we can also choose to show *only* the placeholder message
         // displayedFaqs = [{id: 'cat_ph', question: `Content for ${category.title}`, answer: 'Placeholder content for this category will appear here.'}];
      }
    }
  }


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
              onClick={() => setSelectedHelpCategory(category.id === selectedHelpCategory ? null : category.id)}
              className={`p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer ${
                selectedHelpCategory === category.id ? 'border-primary bg-primary-50 dark:bg-primary-900/30 shadow-md' : 'dark:border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedHelpCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-primary bg-opacity-10 dark:bg-muted text-primary dark:text-primary-300'
                }`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className={`font-medium ${selectedHelpCategory === category.id ? 'text-primary dark:text-primary-300' : 'text-foreground'}`}>{category.title}</h3>
                  <p className={`text-sm ${selectedHelpCategory === category.id ? 'text-primary/80 dark:text-primary-300/80' : 'text-muted-foreground'}`}>{category.count} articles</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
      
      {/* Quick Help Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* FAQs */}
        <Card className="md:col-span-7" title={faqTitle}>
          <div className="space-y-3">
            {displayedFaqs.map((faq) => (
              <div 
                key={faq.id}
                className="border dark:border-border rounded-lg overflow-hidden"
              >
                <button 
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 dark:hover:bg-muted/20 focus:outline-none"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <h3 className="font-medium text-left text-foreground">{faq.question}</h3>
                  {expandedFaqs.includes(faq.id) ? (
                    <ChevronUp size={18} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-muted-foreground shrink-0" />
                  )}
                </button>
                
                {expandedFaqs.includes(faq.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setSelectedHelpCategory(null)}
            className="mt-4 text-primary font-medium flex items-center gap-1 hover:underline"
          >
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