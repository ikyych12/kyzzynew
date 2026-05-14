import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Users, Link as LinkIcon, Volume2, Zap, Play } from 'lucide-react';

export const HomeView = ({ user, onNavigate }: { user: any, onNavigate?: (tab: any) => void }) => {
  const [stats, setStats] = useState({
    online: 0,
    connection: 0
  });

  useEffect(() => {
    // Random stats simulation
    const interval = setInterval(() => {
      setStats({
        online: Math.floor(Math.random() * 5),
        connection: Math.floor(Math.random() * 10)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getExpiryText = () => {
    if (user?.tier === 'Lifetime') return 'Infinity';
    if (!user?.expiry) return '30 Days'; // Match screenshot example
    
    const expiryDate = new Date(user.expiry);
    const now = new Date();
    
    if (expiryDate < now) return '0 Days';
    
    const diff = expiryDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  return (
    <div className="p-5 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      
      {/* Kyzzy Main Dashboard Card */}
      <section className="relative overflow-hidden glass rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[#050a14] to-[#0066ff]/5 group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066ff]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 space-y-8">
            <div className="flex items-start justify-between">
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#0066ff] uppercase tracking-widest">Protocol Matrix</span>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                    KYZZY<br />SYSTEM
                  </h1>
               </div>
               <div className="p-4 bg-black/40 rounded-2xl border border-[#0066ff]/20">
                  <Shield size={28} className="text-[#0066ff]" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div 
                 onClick={() => onNavigate?.('profile')}
                 className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-2 hover:border-[#00ffff]/20 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-2">
                     <Users size={16} className="text-[#00ffff]" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Users</span>
                  </div>
                  <div className="text-3xl font-black text-white flex items-baseline gap-2">
                     {stats.online}
                     <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
               </div>
               <div 
                 onClick={() => onNavigate?.('admin')}
                 className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-2 hover:border-[#0066ff]/20 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-2">
                     <LinkIcon size={16} className="text-[#0066ff]" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nodes</span>
                  </div>
                  <div className="text-3xl font-black text-white">{stats.connection}</div>
               </div>
            </div>
         </div>
      </section>

      {/* Quick Protocol Buttons */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate?.('whatsapp')}
          className="glass rounded-3xl p-8 flex flex-col items-center justify-center gap-4 bg-green-500/5 hover:bg-green-500/10 active:scale-95 transition-all outline outline-white/5 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
            <Zap size={24} />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">GAS BADAK</span>
        </button>

        <button 
          onClick={() => onNavigate?.('tutor')}
          className="glass rounded-3xl p-8 flex flex-col items-center justify-center gap-4 bg-[#0066ff]/5 hover:bg-[#0066ff]/10 active:scale-95 transition-all outline outline-white/5 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] border border-[#0066ff]/20">
            <Play size={24} className="ml-0.5" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">TUTOR BDK</span>
        </button>
      </section>

      {/* Updates */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-3 bg-[#00ffff] rounded-full" />
               UPDATES
            </h2>
         </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[240px] aspect-[16/9] relative rounded-2xl overflow-hidden border border-white/5 shadow-md group shrink-0">
                <img 
                  src={i === 1 ? "https://images6.alphacoders.com/131/1315891.jpeg" : "https://images5.alphacoders.com/131/1314947.png"} 
                  alt="Update" 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 space-y-1">
                     <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        {i === 1 ? 'KYZZY CORE v4.5' : 'SECURE PROTOCOL'}
                     </h3>
                     <p className="text-[8px] font-black text-[#00ffff] uppercase tracking-widest opacity-60">@kyzzy</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Identity Summary Section */}
      <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-lg">
         <div className="bg-[#0066ff]/20 px-8 py-4 border-b border-[#0066ff]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <User size={16} className="text-[#0066ff]" />
               <h3 className="text-[10px] font-black text-white uppercase tracking-widest">IDENTITY</h3>
            </div>
         </div>
         <div className="p-8 space-y-4">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066ff] to-[#1e40af] flex items-center justify-center text-white">
                  <User size={20} />
               </div>
               <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">USER</p>
                  <p className="text-lg font-black text-white capitalize leading-tight">{user.username || 'Kyzzy'}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">LEVEL</p>
                  <p className="text-xs font-black text-[#00ffff] uppercase">{user.role || 'Member'}</p>
               </div>
               <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">LEASE</p>
                  <p className="text-xs font-black text-[#0066ff] uppercase">{getExpiryText()}</p>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-8 text-center">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Kyzzy Protocol v4.5</p>
      </footer>
    </div>
  );
};
