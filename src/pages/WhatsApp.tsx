import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Phone, Send, ChevronDown, Loader2, CheckCircle2, Shield } from 'lucide-react';

export const WhatsAppView = ({ user }: { user: any }) => {
  const [target, setTarget] = useState('');
  const [method, setMethod] = useState('Select - Badak');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const methods = [
    'Badak 50 Chat',
    'Badak 100 Chat',
    'Badak 200 Chat'
  ];

  const isPremium = user?.tier === 'Premium' || user?.tier === 'Lifetime';

  const handleGo = () => {
    if (!target || method === 'Select - Badak') return;
    if (!isPremium) return;
    setStatus('processing');
    
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 2000);
  };

  const getExpiryText = () => {
    if (user?.tier === 'Lifetime') return '30 Days'; // Match screenshot display
    return '30 Days';
  };

  if (!isPremium) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
           <Shield size={40} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-tighter">ACCESS RESTRICTED</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">This tool requires <span className="text-[#0066ff] font-bold">PREMIUM MATRIX</span> access. Please redeem a key in your profile to initialize this protocol.</p>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <button className="text-[10px] font-bold text-[#0066ff] uppercase tracking-[0.2em] animate-pulse">Contact Admin for Keys</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      
      {/* Top Profile Card */}
      <div className="relative overflow-hidden glass-thick border-4 border-white/5 rounded-[3.5rem] p-10 text-center shadow-thick mt-4 bg-gradient-to-b from-[#111827] to-[#050a14]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[80px]" />
         <div className="space-y-6 relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase text-neon">{user.username || 'iky bau'}</h2>
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-center gap-3">
                  <div className="bg-black/60 border-2 border-white/5 px-6 py-2 rounded-full min-w-[120px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ROLE : {user.role || 'Member'}</span>
                  </div>
                  <div className="bg-[#0066ff] shadow-[0_10px_20px_rgba(0,102,255,0.4)] px-6 py-2 rounded-full min-w-[120px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">EXPIRED : 30 Days</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Tool Identity Card */}
      <div className="glass-thick border-2 border-white/10 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-thick group">
         <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center border-2 border-green-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="p-3 bg-green-500/20 rounded-2xl">
               <MessageSquare size={32} className="text-green-500" />
            </div>
         </div>
         <div className="space-y-1">
            <h3 className="font-black text-white text-lg uppercase tracking-[0.2em] text-neon">BADAK WHATSAPP</h3>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Status: Active | Method: 4 Available</p>
         </div>
      </div>

      {/* Control Panel */}
      <div className="glass-thick border-2 border-white/5 rounded-[3.5rem] p-10 space-y-10 shadow-thick">
         {/* Target Input */}
         <div className="space-y-5">
            <p className="text-[12px] font-black text-[#00ffff] uppercase tracking-[0.4em] pl-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] text-neon">TARGET NUMBER</p>
            <div className="relative group">
               <input 
                 type="text" 
                 value={target}
                 onChange={(e) => setTarget(e.target.value)}
                 placeholder="628XXXXXXXXXX"
                 className="w-full bg-black/60 border-2 border-white/5 rounded-3xl p-6 text-base font-mono text-white placeholder:text-slate-800 focus:outline-none focus:border-[#0066ff]/60 transition-all shadow-inner"
               />
            </div>
         </div>

         {/* Method Selector */}
         <div className="space-y-5 relative">
            <p className="text-[12px] font-black text-[#0066ff] uppercase tracking-[0.4em] pl-2 drop-shadow-[0_0_8px_rgba(0,102,255,0.4)] text-neon">SELECT METHOD</p>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-black/60 border-2 border-white/5 rounded-3xl p-6 flex items-center justify-between text-base text-slate-500 font-black group focus:outline-none focus:border-[#0066ff]/60 transition-all shadow-inner relative z-10"
            >
              <span className={method !== 'Select - Badak' ? 'text-white' : ''}>{method}</span>
              <ChevronDown className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-[#0066ff]' : ''}`} size={24} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute z-50 left-0 right-0 top-full mt-4 bg-[#050a14] border-2 border-[#0066ff]/40 rounded-[2.5rem] overflow-hidden shadow-thick backdrop-blur-3xl"
                >
                  {methods.map((m) => (
                    <button 
                      key={m}
                      onClick={() => { setMethod(m); setIsDropdownOpen(false); }}
                      className="w-full px-10 py-6 text-left text-[11px] font-black text-slate-500 hover:text-white hover:bg-[#0066ff]/20 transition-all border-b-2 border-white/5 last:border-0 uppercase tracking-[0.3em]"
                    >
                      {m}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Action Button */}
         <button 
           onClick={handleGo}
           disabled={status !== 'idle' || !target || method === 'Select - Badak'}
           className="w-full bg-gradient-to-r from-[#0066ff] to-[#1e40af] text-white rounded-[2rem] py-7 font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_20px_40px_rgba(0,102,255,0.4)] border border-white/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-4 text-neon"
         >
           {status === 'processing' ? (
             <>
               <Loader2 className="animate-spin" size={22} />
               <span>INITIALIZING...</span>
             </>
           ) : status === 'success' ? (
             <>
               <CheckCircle2 size={22} className="text-[#00ffff]" />
               <span>SUCCESSFUL</span>
             </>
           ) : (
             <>
               <Send size={22} />
               <span>DEPLOY PROTOCOL</span>
             </>
           )}
         </button>
      </div>

      <footer className="pt-16 text-center">
         <div className="inline-block px-5 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">Kyzzy Badak Core v4.5</p>
         </div>
      </footer>
    </div>
  );
};
