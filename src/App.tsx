import React, { useState, useEffect } from 'react';
import { HomeView } from './pages/Home';
import { WhatsAppView } from './pages/WhatsApp';
import { TutorialView } from './pages/Tutorial';
import { LoginView } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { ResellerView } from './pages/Reseller';
import { ProfileView } from './pages/Profile';
import { BottomNav } from './components/layout/BottomNav';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Menu, Grid, Info, User as UserIcon, Database, LogOut, X, Globe, Shield } from 'lucide-react';
import { storage } from '@/src/lib/storage';

type NavTab = 'home' | 'whatsapp' | 'tools' | 'tutor' | 'profile' | 'admin' | 'reseller';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    storage.init();
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center p-6 space-y-8">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-[#0066ff] rounded-2xl shadow-[0_0_20px_rgba(0,102,255,0.4)]"
        />
        <h2 className="text-xl font-bold tracking-[0.5em] text-[#0066ff] animate-pulse uppercase">Kyzzy</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={(userData) => setUser(userData)} />;
  }

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView user={user} onNavigate={setActiveTab} />;
      case 'whatsapp': return <WhatsAppView user={user} />;
      case 'tutor': return <TutorialView />;
      case 'admin': return <AdminPanel currentUser={user} />;
      case 'reseller': return <ResellerView user={user} />;
      case 'profile': return <ProfileView user={user} onLogout={handleLogout} onUpdate={setUser} />;
      case 'tools': return (
        <div className="p-8 flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
           <Grid size={48} className="text-slate-700" />
           <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest">More Tools Coming Soon</h2>
        </div>
      );
      default: return <HomeView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050a14] text-white font-sans selection:bg-[#0066ff]/30 relative overflow-x-hidden cyber-grid scanline">
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-[#050a14] z-[70] border-r-2 border-white/5 shadow-2xl flex flex-col"
            >
              <div className="px-8 py-10 bg-gradient-to-br from-[#0066ff] to-[#1e40af] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-4xl font-black tracking-tighter text-white uppercase text-neon">Kyzzy</h2>
                <div className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                   #{user.role || 'Gold'} {user.username} - Member
                </div>
              </div>

              <div className="flex-1 space-y-1 px-4 py-8 overflow-y-auto">
                <SidebarItem icon={<Info size={22} />} label="Tentang Apps" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem icon={<UserIcon size={22} />} label="My Account" onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Shield size={22} />} label="Admin Console" onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<LogOut size={22} />} label="Logout System" onClick={handleLogout} />
                
                <div className="mt-12 pt-8 border-t border-white/5 mx-4">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-[#0066ff] rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/50">
                        <Monitor size={16} /> Credits Developer
                      </h3>
                   </div>
                   <div className="space-y-4 pl-1">
                      <div>
                         <p className="text-[11px] text-white font-black uppercase tracking-widest">@HasnanEror</p>
                         <span className="text-[9px] text-[#0066ff] font-bold uppercase tracking-widest">[ Developer ]</span>
                      </div>
                      <div>
                         <p className="text-[11px] text-white font-black uppercase tracking-widest">@produk_hasnan</p>
                         <span className="text-[9px] text-[#0066ff] font-bold uppercase tracking-widest">[ My Channels ]</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-[#050a14]/95 backdrop-blur-2xl border-b border-white/5 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:scale-110 transition-transform active:scale-95">
             <div className="space-y-1.5">
                <div className="w-8 h-1 bg-white rounded-full" />
                <div className="w-5 h-1 bg-[#0066ff] rounded-full" />
                <div className="w-8 h-1 bg-white rounded-full" />
             </div>
          </button>
        </div>
        
        <h1 className="text-2xl font-black tracking-[0.3em] uppercase text-white text-neon">Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <button onClick={() => setActiveTab('admin')} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-[#0066ff]/20 transition-all border border-white/5">
                <Database size={20} />
             </button>
             <button onClick={() => setActiveTab('profile')} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-[#0066ff]/20 transition-all border border-white/5">
                <UserIcon size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab as any} user={user} />
    </div>
  );
}

const SidebarItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all group"
  >
    <div className="text-[#0066ff]/80 group-hover:text-[#0066ff] transition-colors">
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
  </button>
);

const Monitor = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);
