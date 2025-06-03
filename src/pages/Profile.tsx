import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Settings, 
  LogOut, 
  Bell, 
  Lock, 
  Activity, 
  Link as LinkIcon,
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('account');
  
  if (!user) return null;
  
  const accountSettings = [
    { id: 's1', name: 'Personal Information', description: 'Update your name, email, and profile picture', icon: <User size={18} /> },
    { id: 's2', name: 'Notifications', description: 'Configure email and push notification preferences', icon: <Bell size={18} /> },
    { id: 's3', name: 'Password & Security', description: 'Update your password and security settings', icon: <Lock size={18} /> },
    { id: 's4', name: 'Connected Devices', description: 'Manage devices that sync with your account', icon: <Activity size={18} /> },
    { id: 's5', name: 'Connected Accounts', description: 'Connect to other fitness services and social media', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
              />
              <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                <Edit size={14} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold mt-4">{user.name}</h2>
            <p className="text-gray-500">Runner - Level {user.stats.level}</p>
            
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm">
                <span>Level Progress</span>
                <span>{user.stats.points % 1000} / 1000 XP</span>
              </div>
              <ProgressBar 
                value={(user.stats.points % 1000)} 
                max={1000} 
                className="mt-1"
              />
            </div>
            
            <div className="w-full mt-6 pt-6 border-t">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <button className="btn btn-primary w-full mt-6">Edit Profile</button>
          </div>
        </Card>
        
        {/* Settings Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'account' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Account Settings
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'preferences' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Running Preferences
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'privacy' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Privacy
            </button>
          </div>
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Account Settings">
                <div className="space-y-4">
                  {accountSettings.map((setting, index) => (
                    <motion.div
                      key={setting.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all flex justify-between items-center cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                          {setting.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{setting.name}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button className="flex items-center gap-2 text-red-500 hover:text-red-600">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Running Preferences */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Running Preferences">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Distance Unit</h3>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg bg-primary text-white">Kilometers</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Miles</button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Preferred Run Days</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button 
                          key={day}
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            ['Mon', 'Wed', 'Fri', 'Sun'].includes(day)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Preferred Run Time</h3>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg bg-primary text-white">Morning</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Afternoon</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Evening</button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Training Focus</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 rounded-lg bg-primary text-white">Endurance</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Speed</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Race Training</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Weight Loss</button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button className="btn btn-primary">Save Preferences</button>
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Privacy Settings">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Activity Visibility</h3>
                      <p className="text-sm text-gray-500">Control who can see your running activities</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-100 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Only Me</option>
                        <option>Friends</option>
                        <option>Public</option>
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-500" size={16} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Profile Visibility</h3>
                      <p className="text-sm text-gray-500">Control who can see your profile information</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-gray-100 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Only Me</option>
                        <option>Friends</option>
                        <option>Public</option>
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-500" size={16} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Sharing</h3>
                      <p className="text-sm text-gray-500">Allow sharing run data with third-party services</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="data-sharing" className="sr-only" />
                      <label 
                        htmlFor="data-sharing"
                        className="block h-6 overflow-hidden rounded-full bg-gray-200 cursor-pointer"
                      >
                        <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Location Sharing</h3>
                      <p className="text-sm text-gray-500">Show precise locations in your activities</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="location-sharing" className="sr-only" defaultChecked />
                      <label 
                        htmlFor="location-sharing"
                        className="block h-6 overflow-hidden rounded-full bg-primary cursor-pointer"
                      >
                        <span className="block h-6 w-6 rounded-full bg-white shadow transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button className="btn btn-primary">Save Privacy Settings</button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}