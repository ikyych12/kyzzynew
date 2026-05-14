import React from 'react';
import { 
  Zap, 
  Play, 
  Shield, 
  Users, 
  Link as LinkIcon,
  User,
  Send
} from 'lucide-react';
import { UserProfile } from '../lib/storage';

interface HomeProps {
  user: UserProfile;
  onNavigate?: (tab: string) => void;
}

const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const stats = {
    online: 442,
    connection: 12
  };

  const getExpiryText = () => {
    if (user.tier === 'Lifetime') return 'LIFETIME ACCESS';
    if (!user.expiry) return 'TRIAL EXPIRED';
    const date = new Date(user.expiry);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-5 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      
      {/* Tuan Muda Kyzzy Main Dashboard Card */}
      <section className="relative overflow-hidden glass rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[#050510] to-[#9333ea]/5 group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#9333ea]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 space-y-8">
            <div className="flex items-start justify-between">
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#9333ea] uppercase tracking-widest">Protocol Matrix</span>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                    TUAN MUDA<br />KYZZY
                  </h1>
               </div>
               <div className="p-4 bg-black/40 rounded-2xl border border-[#9333ea]/20">
                  <Shield size={28} className="text-[#9333ea]" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div 
                 onClick={() => onNavigate?.('profile')}
                 className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-2 hover:border-[#d8b4fe]/20 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-2">
                     <Users size={16} className="text-[#d8b4fe]" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Users</span>
                  </div>
                  <div className="text-3xl font-black text-white flex items-baseline gap-2">
                     {stats.online}
                     <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
               </div>
               <div 
                 onClick={() => onNavigate?.('home')}
                 className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-2 hover:border-[#9333ea]/20 transition-all cursor-pointer"
               >
                  <div className="flex items-center gap-2">
                     <LinkIcon size={16} className="text-[#9333ea]" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nodes</span>
                  </div>
                  <div className="text-3xl font-black text-white">{stats.connection}</div>
               </div>
            </div>
         </div>
      </section>

      {/* Quick Protocol Buttons */}
      <section className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => onNavigate?.('whatsapp')}
          className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-green-500/5 hover:bg-green-500/10 active:scale-95 transition-all outline outline-white/5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10">
            <Zap size={20} />
          </div>
          <span className="text-[7px] font-black text-white uppercase tracking-widest">GAS</span>
        </button>

        <button 
          onClick={() => onNavigate?.('tutorial')}
          className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-[#9333ea]/5 hover:bg-[#9333ea]/10 active:scale-95 transition-all outline outline-white/5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#9333ea]/10 flex items-center justify-center text-[#9333ea] border border-[#9333ea]/10">
            <Play size={20} className="ml-0.5" />
          </div>
          <span className="text-[7px] font-black text-white uppercase tracking-widest">TUTOR</span>
        </button>

        <a 
          href="https://t.me/your_bot_username" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-blue-500/5 hover:bg-blue-500/10 active:scale-95 transition-all outline outline-white/5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
            <Send size={20} className="ml-0.5" />
          </div>
          <span className="text-[7px] font-black text-white uppercase tracking-widest">BOT HUB</span>
        </a>
      </section>

      {/* Updates */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-3 bg-[#d8b4fe] rounded-full" />
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
                        {i === 1 ? 'PROTOCOL MASTER v5.0' : 'SECURE PROTOCOL'}
                     </h3>
                     <p className="text-[8px] font-black text-[#d8b4fe] uppercase tracking-widest opacity-60">@tuanmudakyzzy</p>
                  </div>
               </div>
            ))}
          </div>
      </section>

      {/* Identity Summary Section */}
      <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-lg">
         <div className="bg-[#9333ea]/20 px-8 py-4 border-b border-[#9333ea]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <User size={16} className="text-[#9333ea]" />
               <h3 className="text-[10px] font-black text-white uppercase tracking-widest">IDENTITY</h3>
            </div>
         </div>
         <div className="p-8 space-y-4">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9333ea] to-[#581c87] flex items-center justify-center text-white">
                  <User size={20} />
               </div>
               <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">USER</p>
                  <p className="text-lg font-black text-white capitalize leading-tight">{user.username || 'Owner'}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">LEVEL</p>
                  <p className="text-xs font-black text-[#d8b4fe] uppercase">{user.role || 'Member'}</p>
               </div>
               <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">LEASE</p>
                  <p className="text-xs font-black text-[#9333ea] uppercase">{getExpiryText()}</p>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-8 text-center">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Tuan Muda Kyzzy v5.0</p>
      </footer>
    </div>
  );
};

export default Home;
