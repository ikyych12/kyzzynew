import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Calendar, LogOut, Key as KeyIcon, Edit3, Camera, Check, Copy } from 'lucide-react';
import { storage } from '@/src/lib/storage';

export const ProfileView = ({ user, onLogout, onUpdate }: { user: any, onLogout: () => void, onUpdate: (user: any) => void }) => {
  const [redeemKey, setRedeemKey] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClipboardRedeem = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase();
      if (cleaned.startsWith('KYZZY-')) {
        setRedeemKey(cleaned);
        // Small delay to show the key being pasted
        setTimeout(() => handleRedeem(cleaned), 300);
      } else {
        setMessage({ type: 'error', text: 'Clipboard does not contain a valid protocol key.' });
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'System cannot access clipboard.' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleRedeem = async (passedKey?: string) => {
    const keyToUse = typeof passedKey === 'string' ? passedKey : redeemKey;
    if (!keyToUse || !keyToUse.trim()) return;
    setIsRedeeming(true);
    
    try {
      const licenseKey = keyToUse.trim().toUpperCase();
      const updatedUser = await storage.loginWithKey(licenseKey, user.username);
      
      onUpdate(updatedUser);
      
      setMessage({ type: 'success', text: `Success! Identity clearance upgraded to ${updatedUser.role}.` });
      setRedeemKey('');
    } catch (err: any) {
      let displayError = 'Gagal memproses key. Coba lagi.';
      try {
        if (err.message && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) displayError = `AKSES DITOLAK: ${parsed.error.toUpperCase()}`;
        } else if (err.message) {
          displayError = err.message;
        }
      } catch (pErr) {}
      
      setMessage({ type: 'error', text: displayError });
    }
    
    setIsRedeeming(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const getExpiryText = () => {
    if (user?.tier === 'Lifetime') return '30 Days'; 
    if (!user?.expiry) return '0 Days';
    
    const expiryDate = new Date(user.expiry);
    const now = new Date();
    
    if (expiryDate < now) return '0 Days';
    
    const diff = expiryDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  return (
    <div className="p-5 pb-32 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      
      {/* Floating Header */}
      <section className="relative pt-16 pb-12 px-8 glass-thick border-2 border-white/10 rounded-[3.5rem] text-center shadow-thick overflow-hidden mt-12 bg-gradient-to-b from-[#111827] to-[#050a14]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0066ff]/20 rounded-full blur-[80px]" />
         
         <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="relative group cursor-pointer">
               <div className="w-32 h-32 rounded-full border-4 border-[#0066ff] p-1.5 shadow-[0_0_40px_rgba(0,102,255,0.4)] overflow-hidden bg-black transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-[0_0_60px_rgba(0,102,255,0.6)]">
                  <img 
                    src="https://images.alphacoders.com/132/1322308.png" 
                    alt="Subject" 
                    className="w-full h-full rounded-full object-cover transition-all duration-500"
                  />
               </div>
               <div className="absolute bottom-2 right-2 p-2 bg-[#0066ff] rounded-full border-4 border-[#111827] shadow-xl group-hover:bg-[#00ffff] transition-colors">
                  <Camera size={14} className="text-white group-hover:text-black transition-colors" />
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="text-3xl font-black tracking-tight text-white uppercase text-neon">{user.username}</h2>
               <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/60 text-slate-400 border-2 border-white/5 px-6 py-2 rounded-full">
                        ROLE : {user.role}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-green-500/10 text-green-500 border-2 border-green-500/20 px-6 py-2 rounded-full">
                        ONLINE
                     </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-[#0066ff] to-[#1e40af] text-white px-10 py-3 rounded-full shadow-[0_10px_30px_rgba(0,102,255,0.4)] border border-white/20">
                     STATUS : SECURE
                  </span>
               </div>
            </div>
         </div>
      </section>

      {/* Account Details */}
      <section className="glass-thick border-2 border-white/5 rounded-[3rem] p-10 space-y-6 shadow-thick">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-[#0066ff] rounded-full shadow-[0_0_10px_#0066ff]" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] text-neon">Subject Matrix</h3>
         </div>
         
         <DetailRow icon={<User size={22} />} label="System Name" value={user.username} />
         <DetailRow icon={<Shield size={22} />} label="Clearance" value={user.tier} valueClass="text-[#00ffff] font-black" />
         <DetailRow icon={<Calendar size={22} />} label="Lease Term" value={getExpiryText()} />
         {user.recoveryKey && (
           <DetailRow 
             icon={<KeyIcon size={22} />} 
             label="Recovery Key" 
             value={user.recoveryKey} 
             valueClass="text-yellow-500 font-mono text-[11px]" 
           />
         )}
      </section>

      {/* Redeem Section */}
      <section className="glass-thick border-2 border-[#0066ff]/30 rounded-[3rem] p-10 space-y-8 shadow-neon relative overflow-hidden group hover:border-[#0066ff]/60 transition-all">
         <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066ff]/10 rounded-full blur-[60px] -mr-24 -mt-24 transition-opacity group-hover:opacity-100 opacity-50" />
         
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0066ff]/10 rounded-2xl text-[#0066ff] border border-[#0066ff]/20">
               <KeyIcon size={22} />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] text-neon">Protocol Key Influx</h3>
         </div>

         <div className="space-y-5">
            <div className="relative group">
               <input 
                 type="text" 
                 value={redeemKey}
                 onPaste={(e) => {
                   const pasted = e.clipboardData.getData('Text').trim().toUpperCase();
                   if (pasted.startsWith('KYZZY-')) {
                     setRedeemKey(pasted);
                     setTimeout(() => handleRedeem(pasted), 100);
                   }
                 }}
                 onChange={(e) => setRedeemKey(e.target.value.toUpperCase())}
                 placeholder="ENTER PROTOCOL KEY..."
                 className="w-full bg-black/60 border-2 border-white/5 rounded-3xl p-6 pr-20 text-sm font-mono text-white placeholder:text-slate-800 focus:outline-none focus:border-[#0066ff]/60 transition-all shadow-inner"
               />
               <button 
                 onClick={handleClipboardRedeem}
                 className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[#0066ff]/10 rounded-2xl text-[#0066ff] hover:bg-[#0066ff]/20 active:scale-90 transition-all border border-[#0066ff]/20"
                 title="Paste from Clipboard"
               >
                 <Copy size={18} />
               </button>
            </div>

            <button 
              onClick={() => handleRedeem()}
              disabled={isRedeeming || !redeemKey}
              className="w-full bg-gradient-to-r from-[#0066ff] to-[#1e40af] text-white rounded-3xl py-6 font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_15px_30px_rgba(0,102,255,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 border border-white/10"
            >
              {isRedeeming ? 'Validating...' : 'Initialize Protocol'}
            </button>
            
            <AnimatePresence>
               {message && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-center text-[10px] font-black uppercase tracking-[0.4em] ${message.type === 'success' ? 'text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' : 'text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]'}`}
                  >
                    {message.text}
                  </motion.p>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* Logout Action */}
      <button 
        onClick={onLogout}
        className="w-full bg-red-500/10 border-2 border-red-500/20 text-red-500 rounded-[2.5rem] py-6 font-black uppercase tracking-[0.5em] text-[11px] flex items-center justify-center gap-4 hover:bg-red-500/20 active:scale-[0.98] transition-all group"
      >
        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
        Terminate Session
      </button>

      <footer className="pt-20 text-center">
         <div className="inline-block px-5 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">Kyzzy Identity v4.5 Stable</p>
         </div>
      </footer>
    </div>
  );
};

const DetailRow = ({ icon, label, value, valueClass }: { icon: any, label: string, value: string, valueClass?: string }) => (
  <div className="flex items-center justify-between p-5 bg-black/40 rounded-3xl border-2 border-white/5 hover:border-[#0066ff]/20 transition-all group">
     <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-[#0f172a] flex items-center justify-center text-[#0066ff] border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
           {icon}
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
           <p className={`text-base font-black capitalize tracking-tight ${valueClass || 'text-white'}`}>{value}</p>
        </div>
     </div>
     <Check size={18} className="text-green-500/20 group-hover:text-green-500 transition-colors" />
  </div>
);
