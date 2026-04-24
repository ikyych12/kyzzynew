import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Phone, Send, ChevronDown, Loader2, CheckCircle2, Shield, Database } from 'lucide-react';

export const WhatsAppView = ({ user }: { user: any }) => {
  const [target, setTarget] = useState('');
  const [method, setMethod] = useState('Select - Badak');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const methods = [
    'Badak 50 Chat',
    'Badak 100 Chat',
    'Badak 200 Chat'
  ];

  const isPremium = user?.tier === 'Premium' || user?.tier === 'Lifetime' || user?.role === 'OWNER';

  const validateNumber = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 15) return false;
    return true;
  };

  const detectProvider = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('62')) {
      const prefix = clean.substring(2, 5);
      if (['811', '812', '813', '821', '822', '852', '853', '823'].includes(prefix)) return 'Telkomsel';
      if (['814', '815', '816', '855', '856', '857', '858'].includes(prefix)) return 'Indosat Ooredoo';
      if (['817', '818', '819', '859', '877', '878'].includes(prefix)) return 'XL Axiata';
      if (['831', '832', '833', '838'].includes(prefix)) return 'Axis';
      if (['895', '896', '897', '898', '899'].includes(prefix)) return 'Tri (3)';
      if (['881', '882', '883', '884', '885', '886', '887', '888', '889'].includes(prefix)) return 'Smartfren';
      return 'Unknown (ID)';
    }
    return 'International / Unknown';
  };

  const detectRegion = (num: string) => {
    if (num.startsWith('62')) return 'Indonesia';
    if (num.startsWith('1')) return 'USA / Canada';
    if (num.startsWith('44')) return 'United Kingdom';
    if (num.startsWith('60')) return 'Malaysia';
    if (num.startsWith('65')) return 'Singapore';
    if (num.startsWith('61')) return 'Australia';
    if (num.startsWith('81')) return 'Japan';
    if (num.startsWith('82')) return 'South Korea';
    if (num.startsWith('84')) return 'Vietnam';
    if (num.startsWith('66')) return 'Thailand';
    if (num.startsWith('63')) return 'Philippines';
    return 'International';
  };

  const handleGo = () => {
    if (!target || method === 'Select - Badak') return;
    if (!isPremium) return;
    
    if (!validateNumber(target)) {
      setError('NOMOR TIDAK VALID');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    setStatus('processing');
    setLogs(['MENYIAPKAN SISTEM...', 'MEMBUAT JALUR AMAN...', 'MENEMBUS KEAMANAN...']);
    
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev];
        const randomLogs = [
          'MENGIRIM PESAN...',
          'MEMINDAI TUJUAN...',
          'ENKRIPSI DATA...',
          'MENGHUBUNGKAN SERVER...',
          'MENGOPTIMALKAN JALUR...'
        ];
        newLogs.push(randomLogs[Math.floor(Math.random() * randomLogs.length)]);
        if (newLogs.length > 3) newLogs.shift();
        return newLogs;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(logInterval);
      setResult({
        number: target,
        provider: detectProvider(target),
        region: detectRegion(target),
        badak: method
      });
      setStatus('success');
    }, 4000);
  };

  const getExpiryText = () => {
    if (user?.tier === 'Lifetime') return '30 Hari'; // Match screenshot display
    return '30 Hari';
  };

  if (!isPremium) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
           <Shield size={40} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-tighter">AKSES DIBATASI</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Alat ini memerlukan akses <span className="text-[#0066ff] font-bold">PREMIUM MATRIX</span>. Harap masukkan kunci di profil Anda untuk memulai.</p>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <button className="text-[10px] font-bold text-[#0066ff] uppercase tracking-[0.2em] animate-pulse">Hubungi Admin Untuk Kunci</button>
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      
      {/* Top Profile Card */}
      <div className="relative overflow-hidden glass-thick border-4 border-white/5 rounded-[3.5rem] p-10 text-center shadow-thick mt-4 bg-gradient-to-b from-[#111827] to-[#050a14]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[80px]" />
         <div className="space-y-6 relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase text-neon">{user.username || 'Kyzzy'}</h2>
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-center gap-3">
                  <div className="bg-black/60 border-2 border-white/5 px-6 py-2 rounded-full min-w-[120px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">JABATAN : {user.role || 'Member'}</span>
                  </div>
                  <div className="bg-[#0066ff] shadow-[0_10px_20px_rgba(0,102,255,0.4)] px-6 py-2 rounded-full min-w-[120px]">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">MASA AKTIF : 30 Hari</span>
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
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Status: Aktif | Tersedia: 4 Metode</p>
         </div>
      </div>

      {/* Control Panel */}
      <div className="glass-thick border-2 border-white/5 rounded-[3.5rem] p-10 space-y-10 shadow-thick">
         {/* Target Input */}
         <div className="space-y-5">
            <p className="text-[12px] font-black text-[#00ffff] uppercase tracking-[0.4em] pl-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] text-neon">NOMOR TUJUAN</p>
            <div className="relative group">
               <input 
                 type="text" 
                 value={target}
                 onChange={(e) => setTarget(e.target.value)}
                 placeholder="628XXXXXXXXXX"
                 className={`w-full bg-black/60 border-2 ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/5 shadow-inner'} rounded-3xl p-6 text-xl text-white font-black tracking-widest focus:outline-none focus:border-[#00ffff]/60 transition-all placeholder:text-slate-800`}
               />
               {error && (
                 <motion.p 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="absolute -bottom-6 left-4 text-[10px] font-black text-red-500 uppercase tracking-widest"
                 >
                   {error}
                 </motion.p>
               )}
               <Phone className={`absolute right-6 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : 'text-slate-700'}`} size={24} />
            </div>
         </div>

         {/* Method Selector */}
         <div className="space-y-5 relative">
            <p className="text-[12px] font-black text-[#0066ff] uppercase tracking-[0.4em] pl-2 drop-shadow-[0_0_8px_rgba(0,102,255,0.4)] text-neon">PILIH METODE</p>
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
             <div className="flex flex-col items-center gap-2">
               <div className="flex items-center gap-4">
                 <Loader2 className="animate-spin" size={22} />
                 <span>SEDANG MEMPROSES...</span>
               </div>
               <div className="flex flex-col items-center gap-1 opacity-50 font-mono text-[8px] tracking-widest">
                 {logs.map((log, i) => (
                   <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{log}</motion.span>
                 ))}
               </div>
             </div>
           ) : (
             <>
               <Send size={22} />
               <span>MULAI PROSES</span>
             </>
           )}
         </button>

         {/* Success Modal Overlay */}
         <AnimatePresence>
           {status === 'success' && result && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050a14]/98 backdrop-blur-3xl"
             >
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                 animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                 exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                 className="w-full max-w-sm glass-thick border-4 border-[#00ffff]/40 rounded-[3rem] p-1 shadow-[0_0_150px_rgba(0,255,255,0.2)] relative overflow-hidden"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/10 via-transparent to-[#0066ff]/10 pointer-events-none" />
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-80" />
                 
                 <div className="relative z-10 bg-[#050a14]/95 rounded-[2.8rem] p-10 space-y-8">
                   {/* Header Animation */}
                   <div className="flex flex-col items-center text-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00ffff] blur-3xl opacity-30 animate-pulse" />
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 12 }}
                          className="relative p-7 bg-black border-4 border-[#00ffff] rounded-[2.5rem] shadow-[0_0_40px_rgba(0,255,255,0.5)]"
                        >
                          <CheckCircle2 size={48} className="text-[#00ffff]" />
                        </motion.div>
                        <motion.div 
                          initial={{ scale: 0, x: 20 }}
                          animate={{ scale: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="absolute -top-1 -right-1 bg-[#0066ff] w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#050a14] shadow-lg"
                        >
                          <Database size={16} className="text-white" />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-lg text-neon">SUKSES</h4>
                         <div className="h-0.5 w-12 bg-[#00ffff] mx-auto rounded-full" />
                         <p className="text-[11px] text-[#00ffff] font-black uppercase tracking-[0.4em] animate-pulse">BERHASIL DIKIRIM</p>
                      </div>
                   </div>

                   {/* Data Grid */}
                   <div className="space-y-3 font-mono">
                     <div className="bg-white/10 rounded-3xl p-6 border border-white/10 space-y-5 shadow-inner">
                       <div className="flex justify-between items-end border-b border-white/10 pb-4">
                         <div>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] block mb-2">NOMOR TARGET</span>
                           <span className="text-xl text-white font-black tracking-widest text-neon drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">{result.number}</span>
                         </div>
                         <div className="text-right">
                           <div className="px-3 py-1 bg-[#00ffff]/20 rounded-full border border-[#00ffff]/30">
                              <span className="text-[10px] text-[#00ffff] font-black uppercase">BERhasil</span>
                           </div>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">PROVIDER KARTU</span>
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-[#00ffff] rounded-full shadow-[0_0_8px_#00ffff] animate-pulse" />
                             <span className="text-[12px] text-white font-black uppercase">{result.provider}</span>
                           </div>
                         </div>
                         <div className="space-y-1.5 text-right">
                           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">REGION</span>
                           <span className="text-[12px] text-white font-bold uppercase">{result.region}</span>
                         </div>
                       </div>
                     </div>

                     <div className="px-5 py-4 bg-[#0066ff]/20 border border-[#0066ff]/40 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={14} className="text-[#0066ff]" />
                          <span className="text-[10px] text-[#0066ff] font-black uppercase tracking-widest">BADAK:</span>
                        </div>
                        <span className="text-[11px] text-white font-black uppercase tracking-tight">{result.badak}</span>
                     </div>
                   </div>

                   <button 
                     onClick={() => {
                       setStatus('idle');
                       setResult(null);
                       setTarget('');
                       setMethod('Select - Badak');
                     }}
                     className="w-full relative group h-18 overflow-hidden rounded-2xl shadow-neon shadow-[#0066ff]/30"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-[#0066ff] to-[#1e40af] group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                     <span className="relative flex items-center justify-center gap-3 text-[12px] font-black text-white uppercase tracking-[0.6em]">
                       SELESAI
                     </span>
                   </button>
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      <footer className="pt-16 text-center">
         <div className="inline-block px-5 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">Kyzzy Badak Core v4.5</p>
         </div>
      </footer>
    </div>
  );
};
