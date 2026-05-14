import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Shield, 
  User as UserIcon, 
  Rocket,
  Play
} from 'lucide-react';
import { UserProfile } from '../../lib/storage';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, user }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tutorial', icon: Play, label: 'Tutor' },
    { id: 'whatsapp', icon: Rocket, label: 'Badak' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  if (user.role === 'OWNER' || user.role === 'ADMIN') {
    items.splice(3, 0, { id: 'admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050510]/90 backdrop-blur-lg border-t border-white/5 px-6 py-4 pb-8 flex justify-between items-center shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? 'text-[#9333ea]' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#9333ea]/10' : ''}`}>
               <Icon size={20} className={`${isActive ? 'scale-110' : ''} transition-transform`} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="nav-pill"
                className="absolute -top-4 w-1 h-1 bg-[#9333ea] rounded-full shadow-[0_0_10px_#9333ea]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
