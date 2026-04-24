import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, Plus, Copy, Check, History, Clock } from 'lucide-react';
import { storage } from '@/src/lib/storage';

const getSeconds = (ts: any) => {
  if (!ts) return 0;
  if (typeof ts.seconds === 'number') return ts.seconds;
  if (ts instanceof Date) return Math.floor(ts.getTime() / 1000);
  if (typeof ts === 'string') return Math.floor(new Date(ts).getTime() / 1000);
  return 0;
};

export const ResellerView = ({ user }: { user: any }) => {
  const [keys, setKeys] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [targetUser, setTargetUser] = useState('');
  const [duration, setDuration] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchMyKeys = async () => {
    try {
      const allKeys = await storage.getKeys();
      // OWNER can see all keys, others only their own
      const myKeys = user.role === 'OWNER' 
        ? allKeys 
        : allKeys.filter(k => k.generatedBy === user.username);
      
      // Sort: Unused keys top, then newest first
      setKeys(myKeys.sort((a, b) => {
        if (a.status === 'unused' && b.status === 'used') return -1;
        if (a.status === 'used' && b.status === 'unused') return 1;
        return getSeconds(b.createdAt) - getSeconds(a.createdAt);
      }));

      // Fetch users for target selection
      const allUsers = await storage.getUsers();
      // Resellers can only target Members
      setAvailableUsers(allUsers.filter(u => u.role === 'MEMBER'));
    } catch (err: any) {
      let msg = 'Failed to fetch vault records';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `VAULT ACCESS DENIED: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      console.error(err);
      alert(msg);
    }
  };

  useEffect(() => {
    fetchMyKeys();
  }, []);

  const generateKey = async (customDuration?: number) => {
    setGenerating(true);
    
    // Kyzzy Style Key: KZY-XXXX-XXXX
    const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKeyString = `KZY-${segment()}-${segment()}`;
    
    try {
      await storage.addKey({
        key: newKeyString,
        durationDays: customDuration || duration,
        status: 'unused',
        targetRole: 'MEMBER',
        targetUser: targetUser || undefined,
        generatedBy: user.username,
        createdAt: null
      });
      
      await fetchMyKeys();
      setTargetUser('');
    } catch (err: any) {
      let msg = 'Failed to mint access key';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `SECURITY REJECTION: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      console.error(err);
      alert(msg);
    }
    setGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-5 pb-32 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto relative z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-[0.2em] text-white uppercase text-neon italic">Vault</h1>
          <p className="text-[10px] text-[#0066ff] font-black uppercase tracking-[0.4em] leading-none pl-1">Authorized ID: {user.username}</p>
        </div>
        <div className="p-5 glass-thick text-[#0066ff] rounded-[2rem] border-2 border-[#0066ff]/20 shadow-neon">
          <Key size={30} className="animate-pulse" />
        </div>
      </div>

      {/* Key Generation Module */}
      <section className="glass-thick border-4 border-white/5 rounded-[4rem] p-12 shadow-thick relative overflow-hidden group scanline">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066ff]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-6 bg-[#0066ff] rounded-full shadow-[0_0_10px_#0066ff]" />
             <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Mint Access Key</h2>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-2">Select Duration</label>
             <div className="grid grid-cols-3 gap-4">
                {[7, 30, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-5 rounded-3xl border-2 transition-all text-xs font-black uppercase tracking-widest ${
                      duration === d 
                        ? 'bg-[#0066ff]/20 border-[#0066ff] text-[#0066ff] shadow-neon' 
                        : 'bg-black/40 border-white/5 text-slate-600 hover:border-white/20'
                    }`}
                  >
                    {d === 365 ? '1 Year' : `${d} Days`}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-2">Designate Subject (Optional)</label>
              <select 
                value={targetUser} 
                onChange={(e) => setTargetUser(e.target.value)}
                className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-5 text-xs font-black focus:outline-none focus:border-[#0066ff]/60 transition-all text-white appearance-none cursor-pointer shadow-inner"
              >
                <option value="">ALL SUBJECTS (PUBLIC)</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.username}>{u.username.toUpperCase()} [{u.role}]</option>
                ))}
              </select>
           </div>

          <div className="flex flex-col gap-4">
             <button 
               onClick={() => generateKey()}
               disabled={generating}
               className="w-full py-8 bg-gradient-to-br from-[#0066ff] to-[#1e40af] rounded-[2.5rem] font-black text-white uppercase tracking-[0.6em] text-[11px] shadow-[0_20px_40px_rgba(0,102,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-2 border-white/20 text-neon"
             >
               {generating ? (
                 <>
                   <Plus className="animate-spin" size={24} />
                   CRYPTING...
                 </>
               ) : (
                 <>
                   <Plus size={24} />
                   MINT SELECTED
                 </>
               )}
             </button>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => generateKey(30)}
                 className="flex-1 py-4 bg-black/40 border-2 border-[#0066ff]/30 rounded-3xl text-[9px] font-black text-[#0066ff] uppercase tracking-widest hover:border-[#0066ff] transition-all"
               >
                 Quick 30D
               </button>
               <button 
                 onClick={() => generateKey(365)}
                 className="flex-1 py-4 bg-black/40 border-2 border-yellow-500/30 rounded-3xl text-[9px] font-black text-yellow-500 uppercase tracking-widest hover:border-yellow-500 transition-all"
               >
                 Quick 1Y
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-4">
              <History size={18} className="text-[#0066ff]" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Key Inventory</h2>
           </div>
           <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{keys.length} Records</span>
        </div>

        <div className="space-y-4">
          {keys.length === 0 ? (
            <div className="py-20 text-center glass-thick rounded-[3rem] border-2 border-dashed border-white/5 text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
              Vault is Empty
            </div>
          ) : keys.map((k) => (
            <div key={k.id} className="glass-thick rounded-[2.5rem] p-6 border-2 border-white/5 flex items-center justify-between hover:border-[#0066ff]/30 transition-all group">
              <div className="space-y-2">
                <p className="text-sm font-black text-white tracking-[0.1em] font-mono group-hover:text-[#0066ff] transition-colors uppercase">{k.key}</p>
                <div className="flex gap-3 items-center">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border-2 ${
                    k.status === 'unused' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {k.status}
                  </span>
                  <div className="flex items-center gap-2 bg-[#00ffff]/5 px-3 py-1 rounded-lg border border-[#00ffff]/10">
                    <span className="text-[8px] font-black text-[#00ffff] uppercase tracking-widest">{k.targetRole}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                    <Clock size={10} className="text-[#0066ff]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       {k.durationDays}D Protocol
                    </span>
                  </div>
                  {k.targetUser && (
                    <div className="flex items-center gap-2 bg-yellow-500/5 px-3 py-1 rounded-lg border border-yellow-500/10">
                      <span className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter">TARGET: {k.targetUser}</span>
                    </div>
                  )}
                  {k.status === 'used' && k.usedBy && (
                    <div className="flex items-center gap-2 bg-[#0066ff]/5 px-3 py-1 rounded-lg border border-[#0066ff]/10">
                      <span className="text-[8px] font-black text-[#0066ff] uppercase tracking-tighter">BY: {k.usedBy}</span>
                    </div>
                  )}
                  {user.role === 'OWNER' && (
                    <span className="text-[8px] font-black text-slate-700 uppercase">FROM: {k.generatedBy}</span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => copyToClipboard(k.key)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 active:scale-90 ${
                  copiedKey === k.key 
                    ? 'bg-green-500/20 border-green-500 text-green-500 shadow-lg' 
                    : 'bg-black border-white/10 text-slate-400 hover:border-[#0066ff]/60 hover:text-[#0066ff]'
                }`}
              >
                {copiedKey === k.key ? <Check size={24} /> : <Copy size={24} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center pb-10 pt-4">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-800">Secure Vault Protocol active</p>
      </footer>
    </div>
  );
};
