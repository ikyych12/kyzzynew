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
    <div className="p-6 pb-32 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-lg mx-auto">
      
      {/* Kyzzy Main Dashboard Card */}
      <section className="relative overflow-hidden glass-thick border-4 border-[#0066ff]/20 rounded-[4rem] p-12 shadow-thick bg-gradient-to-br from-[#050a14] via-[#050a14] to-[#0066ff10] group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066ff]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
         
         <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between">
               <div className="space-y-2">
                  <span className="text-[11px] font-black text-[#0066ff] uppercase tracking-[0.6em] text-neon">Access Verified</span>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                    KYZZY<br />MATRIX
                  </h1>
               </div>
               <div className="p-5 bg-black/60 rounded-3xl border-2 border-[#0066ff]/20 shadow-neon">
                  <Shield size={32} className="text-[#0066ff]" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div 
                 onClick={() => onNavigate?.('profile')}
                 className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-3 group/stat hover:border-[#00ffff]/30 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-3">
                     <Users size={18} className="text-[#00ffff]" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Subjects</span>
                  </div>
                  <div className="text-4xl font-black text-white flex items-baseline gap-2">
                     {stats.online}
                     <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                  </div>
               </div>
               <div 
                 onClick={() => onNavigate?.('admin')}
                 className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-3 hover:border-[#0066ff]/30 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-3">
                     <LinkIcon size={18} className="text-[#0066ff]" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Modules</span>
                  </div>
                  <div className="text-4xl font-black text-white">{stats.connection}</div>
               </div>
            </div>
         </div>
      </section>

      {/* Quick Protocol Buttons */}
      <section className="grid grid-cols-2 gap-5">
        <button 
          onClick={() => onNavigate?.('whatsapp')}
          className="glass-thick border-4 border-white/5 rounded-[4rem] p-10 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-green-500/10 to-green-950/30 hover:scale-[1.05] active:scale-95 transition-all shadow-thick group shrink-0"
        >
          <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 group-hover:bg-green-500/20 transition-all border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <Zap size={32} className="fill-green-500/20" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] text-neon">GAS BADAK</span>
        </button>

        <button 
          onClick={() => onNavigate?.('tutor')}
          className="glass-thick border-4 border-white/5 rounded-[4rem] p-10 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0066ff]/10 to-[#1e40af]/30 hover:scale-[1.05] active:scale-95 transition-all shadow-thick group shrink-0"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] group-hover:scale-110 group-hover:bg-[#0066ff]/20 transition-all border border-[#0066ff]/20 shadow-[0_0_30px_rgba(0,102,255,0.1)]">
            <Play size={32} className="fill-[#0066ff]/20 ml-1" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] text-neon">TUTOR BDK</span>
        </button>
      </section>

      {/* Latest Protocol Updates (News Reel) */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
               <span className="w-1.5 h-4 bg-[#00ffff] rounded-full shadow-[0_0_10px_#00ffff]" />
               LATEST UPDATES
            </h2>
            <span className="text-[9px] font-black text-[#0066ff] uppercase tracking-widest">View Database</span>
         </div>

          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar px-2">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[280px] aspect-[16/10] relative rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-thick group shrink-0">
                <img 
                  src={i === 1 ? "https://images6.alphacoders.com/131/1315891.jpeg" : "https://images5.alphacoders.com/131/1314947.png"} 
                  alt="Update" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 space-y-2">
                     <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                        {i === 1 ? 'KYZZY CORE v4.5' : 'SECURE PROTOCOL'}
                     </h3>
                     <p className="text-[9px] font-black text-[#00ffff] uppercase tracking-widest opacity-70">Deployed by @kyzzy</p>
                  </div>
                  <div className="absolute top-6 right-6">
                     <span className="bg-[#00ffff]/20 backdrop-blur-md border border-[#00ffff]/40 px-3 py-1 rounded-full text-[8px] font-black text-[#00ffff] uppercase tracking-widest">NEW</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Admin Access Quick Link */}
      {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
         <button 
           onClick={() => onNavigate?.('admin')}
           className="w-full relative overflow-hidden glass-thick border-4 border-[#0066ff]/30 rounded-[3rem] p-8 group shadow-neon transition-all hover:border-[#0066ff] active:scale-95"
         >
            <div className="absolute inset-0 bg-[#0066ff]/5 group-hover:bg-[#0066ff]/10 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border-2 border-[#0066ff]/40 flex items-center justify-center text-[#0066ff] group-hover:scale-110 transition-transform">
                     <Shield size={32} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                     <h3 className="text-lg font-black text-white tracking-widest uppercase">Admin Console</h3>
                     <p className="text-[10px] font-black text-[#0066ff] uppercase tracking-[0.4em]">System Control Authorized</p>
                  </div>
               </div>
               <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
               </div>
            </div>
         </button>
      )}

      {/* Identity Summary Section */}
      <section className="glass-thick rounded-[3.5rem] border-4 border-white/5 overflow-hidden shadow-thick">
         <div className="bg-[#0066ff] px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <User size={20} className="text-white" />
               <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">ACCOUNT IDENTITY</h3>
            </div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
         </div>
         <div className="p-10 space-y-6">
            <div className="bg-black/40 rounded-3xl p-6 border-2 border-white/5 flex items-center gap-6 group">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#1e40af] flex items-center justify-center text-white border-2 border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                  <User size={28} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">LOGGED AS</p>
                  <p className="text-xl font-black text-white capitalize tracking-tighter text-neon">{user.username || 'Kyzzy'}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
               <div className="bg-black/20 rounded-3xl p-5 border-2 border-white/5 text-center space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ACCESS LEVEL</p>
                  <p className="text-sm font-black text-[#00ffff] uppercase">{user.role || 'Member'}</p>
               </div>
               <div className="bg-black/20 rounded-3xl p-5 border-2 border-white/5 text-center space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">REMAINING</p>
                  <p className="text-sm font-black text-[#0066ff] uppercase">{getExpiryText()}</p>
               </div>
            </div>
         </div>
      </section>

      <footer className="pt-10 text-center pb-10">
         <div className="inline-block px-10 py-4 bg-white/5 rounded-full border border-white/5 backdrop-blur-md shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">Kyzzy Protocol Matrix v4.5</p>
         </div>
      </footer>
    </div>
  );
};
