import React from 'react';
import { motion } from 'motion/react';
import { Home, MessageSquare, Wrench, PlayCircle, User, Shield, Key } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type NavItem = 'home' | 'whatsapp' | 'tools' | 'tutor' | 'profile' | 'admin' | 'reseller';

interface BottomNavProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  user?: any;
}

export const BottomNav = ({ activeTab, setActiveTab, user }: BottomNavProps) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
    { id: 'profile', icon: User, label: 'User' },
  ];

  // Add Admin for privileged users
  if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
    items.splice(3, 0, { id: 'admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050a14]/95 backdrop-blur-3xl border-t-2 border-white/5 px-6 py-4 pb-8 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as NavItem)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all duration-300 relative group",
              isActive ? "text-[#00ffff] scale-110" : "text-slate-600 hover:text-slate-400"
            )}
            id={`nav-${item.id}`}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -top-4 w-12 h-1 bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff]"
              />
            )}
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-500",
              isActive && "bg-[#00ffff]/10 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
            )}>
              <Icon size={isActive ? 26 : 22} className={cn("transition-all", isActive && "drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]")} />
            </div>
            <span className={cn(
               "text-[9px] font-black uppercase tracking-[0.2em] transition-all",
               isActive ? "text-[#00ffff]" : "text-slate-700"
            )}>
               {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
