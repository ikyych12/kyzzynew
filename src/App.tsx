import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Shield, 
  User as UserIcon, 
  Database, 
  LogOut, 
  Info,
  Zap,
  Play,
  Users,
  Link as LinkIcon,
  Calendar,
  Key as KeyIcon,
  Search,
  MessageSquare
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import WhatsApp from './pages/WhatsApp';
import Tutorial from './pages/Tutorial';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { UserProfile } from './lib/storage';
import BottomNav from './components/layout/BottomNav';
import { Ban as BanIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kyzzy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kyzzy_user', JSON.stringify(user));
      
      // Real-time ban monitoring
      const unsubscribe = onSnapshot(doc(db, 'users', user.username), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserProfile;
          if (data.isBanned) {
            setUser({ ...data, id: doc.id });
          }
        }
      });
      return () => unsubscribe();
    } else {
      localStorage.removeItem('kyzzy_user');
    }
  }, [user?.username]);

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    localStorage.removeItem('kyzzy_user');
    setIsSidebarOpen(false);
  };

  if (user && user.isBanned) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 text-center">
        <div className="glass border-2 border-red-500/20 rounded-[2.5rem] p-10 space-y-8 max-w-sm w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl mx-auto flex items-center justify-center text-red-500 border border-red-500/20">
            <BanIcon size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white uppercase italic">ACCESS TERMINATED</h1>
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">Protocol Violation Detected</p>
          </div>
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-2">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Reason for Ban</p>
            <p className="text-sm font-bold text-white leading-relaxed">{user.bannedReason || 'Violating System Protocols'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            Acknowledge & Exit
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home user={user} onNavigate={setActiveTab} />;
      case 'profile': return <Profile user={user} onUpdate={setUser} onLogout={handleLogout} />;
      case 'admin': return <AdminPanel user={user} />;
      case 'whatsapp': return <WhatsApp user={user} />;
      case 'tutorial': return <Tutorial user={user} />;
      default: return <Home user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-[#9333ea]/30 relative overflow-x-hidden">
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#050510] z-[70] border-r border-white/5 shadow-2xl flex flex-col"
            >
              <div className="px-8 py-10 bg-gradient-to-br from-[#9333ea] to-[#581c87] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Tuan Muda<br/>Kyzzy</h2>
                <div className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                   #{user.role} {user.username}
                </div>
              </div>

              <div className="flex-1 py-8 overflow-y-auto space-y-2">
                <SidebarItem icon={<HomeIcon size={20} />} label="Protocol Matrix" onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Info size={20} />} label="Tentang Apps" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem icon={<UserIcon size={20} />} label="My Account" onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
                {(user.role === 'OWNER' || user.role === 'ADMIN') && (
                  <SidebarItem icon={<Shield size={20} />} label="Admin Console" onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} />
                )}
                <SidebarItem icon={<LogOut size={20} />} label="Logout System" onClick={handleLogout} />
                
                <div className="mt-8 pt-6 border-t border-white/5 mx-4">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-5 bg-[#9333ea] rounded-full" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Credits Developer
                      </h3>
                   </div>
                   <div className="space-y-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-white font-bold uppercase tracking-widest">Tuan Muda Kyzzy</span>
                         <span className="text-[8px] text-[#9333ea] font-bold uppercase tracking-widest">[ Developer ]</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-lg border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 active:scale-95 transition-transform">
             <div className="space-y-1">
                <div className="w-6 h-0.5 bg-white rounded-full" />
                <div className="w-4 h-0.5 bg-[#9333ea] rounded-full" />
                <div className="w-6 h-0.5 bg-white rounded-full" />
             </div>
          </button>
        </div>
        
        <h1 className="text-xl font-black tracking-[0.2em] uppercase text-white">Tuan Muda Kyzzy</h1>
        
        <div className="flex items-center gap-3">
           {(user.role === 'OWNER' || user.role === 'ADMIN') && (
             <button onClick={() => setActiveTab('admin')} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5">
                <Database size={18} />
             </button>
           )}
           <button 
             onClick={() => setActiveTab('profile')} 
             className="relative p-0.5 bg-white/5 rounded-full border border-white/10 hover:border-[#9333ea]/60 transition-all active:scale-95"
           >
              <img 
                src="https://images.alphacoders.com/132/1322308.png" 
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
           </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
         {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-6 px-10 py-5 text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
    <div className="group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-[0.3em]">{label}</span>
  </button>
);

export default App;
