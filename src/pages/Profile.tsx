import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Calendar, 
  Key as KeyIcon,
  Copy,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { storage, UserProfile } from '../lib/storage';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [redeemKey, setRedeemKey] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyRecovery = () => {
    if (user.recoveryKey) {
      navigator.clipboard.writeText(user.recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRedeem = async (keyToUse: string) => {
    if (!keyToUse.trim()) return;
    setIsRedeeming(true);
    
    try {
      const licenseKey = keyToUse.trim().toUpperCase();
      const updatedUser = await storage.loginWithKey(licenseKey, user.username);
      
      onUpdate(updatedUser);
      
      setMessage({ type: 'success', text: `Success! Identity clearance upgraded to ${updatedUser.role}.` });
      setRedeemKey('');
    } catch (err: any) {
      let displayError = 'Gagal memproses key. Coba lagi.';
      if (err.message) displayError = err.message;
      setMessage({ type: 'error', text: displayError });
    } finally {
      setIsRedeeming(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getExpiryText = () => {
    if (user.tier === 'Lifetime') return 'INFINITY';
    if (!user.expiry) return 'EXPIRED';
    const date = new Date(user.expiry);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-lg mx-auto">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-black tracking-tighter uppercase">Subject Profile</h2>
         <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Identity Authentication Data</p>
      </div>

      {/* Profile Info */}
      <section className="glass rounded-[2rem] p-8 space-y-6">
         <DetailRow icon={<User size={22} />} label="System Name" value={user.username} />
         <DetailRow icon={<Shield size={22} />} label="Clearance" value={user.tier} valueClass="text-[#d8b4fe] font-black" />
         <DetailRow icon={<Calendar size={22} />} label="Lease Term" value={getExpiryText()} />
         {user.recoveryKey && (
           <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3">
               <KeyIcon size={20} className="text-slate-500" />
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Recovery Key</span>
                 <span className="text-[10px] font-mono text-yellow-500 font-bold">{user.recoveryKey}</span>
               </div>
             </div>
             <button 
               onClick={handleCopyRecovery}
               className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
             >
               {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
             </button>
           </div>
         )}
      </section>

      {/* Redeem Section */}
      <section className="glass rounded-[2rem] p-8 space-y-6">
         <div className="flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest pl-2">Redeem Protocol</h3>
            <div className="relative">
               <KeyIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="TMK-XXXXXX"
                 value={redeemKey}
                 onChange={(e) => setRedeemKey(e.target.value.toUpperCase())}
                 onPaste={(e) => {
                   const pasted = e.clipboardData.getData('Text').trim().toUpperCase();
                   if (pasted.startsWith('TMK-')) {
                     setRedeemKey(pasted);
                     setTimeout(() => handleRedeem(pasted), 100);
                   }
                 }}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#9333ea]/60 transition-all font-black text-sm uppercase"
               />
            </div>
         </div>

         {message && (
            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
               {message.text}
            </div>
         )}

         <button 
           disabled={isRedeeming || !redeemKey}
           onClick={() => handleRedeem(redeemKey)}
           className="w-full py-5 bg-[#9333ea] rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.4em] shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
         >
            {isRedeeming ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
            VERIFY PROTOCOL
         </button>
      </section>

      {/* Logout Section */}
      <section className="pt-4">
         <button 
           onClick={onLogout}
           className="w-full py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-red-500/20 active:scale-95"
         >
            TERMINATE SESSION (LOGOUT)
         </button>
      </section>
    </div>
  );
};

const DetailRow: React.FC<{ icon: any, label: string, value: string, valueClass?: string }> = ({ icon, label, value, valueClass }) => (
  <div className="flex items-center gap-6 group">
     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-[#9333ea] transition-colors">
        {icon}
     </div>
     <div className="space-y-0.5">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-black uppercase ${valueClass || 'text-white'}`}>{value}</p>
     </div>
  </div>
);

export default Profile;
