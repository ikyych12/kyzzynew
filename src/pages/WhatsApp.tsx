import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Phone, Hash, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../lib/storage';

interface WhatsAppProps {
  user: UserProfile;
}

const BADAK_STEPS = [
  "Initializing Protocol Matrix...",
  "Authenticating Identity...",
  "Configuring Proxy 1.1.1.1...",
  "Bypassing WhatsApp Firewall...",
  "Analyzing Server Latency...",
  "Injecting Badak Script...",
  "Stabilizing Connection...",
  "Finalizing Execution..."
];

const WhatsApp: React.FC<WhatsAppProps> = ({ user }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const numbers = Array.from({ length: 400 }, (_, i) => i + 1);

  const validatePhone = (phone: string) => {
    // E.164 regex: +[country code][number]
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (expiry: string | null) => {
    if (user.tier === 'Lifetime' || !expiry) return { text: 'UNLIMITED ACCESS', color: 'text-green-500' };
    const expiryDate = new Date(expiry);
    const diff = expiryDate.getTime() - currentTime.getTime();
    
    if (diff <= 0) return { text: 'ACCESS EXPIRED', color: 'text-red-500' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}D ${hours}H REMAINING`, color: 'text-[#9333ea]' };
    if (hours > 0) return { text: `${hours}H ${minutes}M REMAINING`, color: 'text-yellow-500' };
    return { text: `${minutes}M REMAINING`, color: 'text-orange-500' };
  };

  const startBadak = async () => {
    if (status === 'PROCESSING') return;
    
    setPhoneError('');

    if (!phoneNumber) {
      setPhoneError('Nomor tidak boleh kosong');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setPhoneError('Gunakan format E.164 (Contoh: +628123456789)');
      return;
    }

    if (!selectedNumber) {
      alert('Pilih angka protocol 1-400!');
      return;
    }
    
    setStatus('PROCESSING');
    setProgress(0);
    setCurrentStepIndex(0);

    // Simulate real-time progress
    for (let i = 0; i < BADAK_STEPS.length; i++) {
      setCurrentStepIndex(i);
      const stepDuration = 800 + Math.random() * 1200;
      const startProgress = (i / BADAK_STEPS.length) * 100;
      const endProgress = ((i + 1) / BADAK_STEPS.length) * 100;
      
      // Smooth progress within each step
      const substeps = 10;
      for (let j = 0; j <= substeps; j++) {
        setProgress(startProgress + (endProgress - startProgress) * (j / substeps));
        await new Promise(r => setTimeout(r, stepDuration / substeps));
      }
    }

    setStatus('READY');
    setProgress(100);
  };

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-lg mx-auto overflow-x-hidden">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">BADAK PROTOCOL</h2>
         <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-[#9333ea] uppercase tracking-[0.3em] font-bold">Execution Matrix Active</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
               <div className={`w-1 h-1 rounded-full animate-pulse bg-current ${getRemainingTime(user.expiry).color}`} />
               <span className={`text-[8px] font-black uppercase tracking-widest ${getRemainingTime(user.expiry).color}`}>
                  {getRemainingTime(user.expiry).text}
               </span>
            </div>
         </div>
      </div>

      {/* Input Section */}
      <section className="glass rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#9333ea]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="space-y-4 relative z-10">
            <div className="space-y-2">
               <div className="flex justify-between items-center pl-2 pr-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                  {phoneError && <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter animate-bounce">{phoneError}</span>}
               </div>
               <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${phoneError ? 'text-red-500' : 'text-[#9333ea]'}`}>
                     <Phone size={18} />
                  </div>
                  <input 
                    type="tel"
                    placeholder="E.G. +628123456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all text-sm font-black text-white ${phoneError ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 focus:border-[#9333ea]/50'}`}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-end pl-2 pr-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Matrix (1-400)</label>
                  {selectedNumber && <span className="text-[10px] font-black text-[#9333ea]">SELECTED: {selectedNumber}</span>}
               </div>
               
               <div className="h-48 overflow-y-auto pr-2 custom-scrollbar bg-black/20 rounded-2xl border border-white/5 p-2">
                  <div className="grid grid-cols-5 gap-2">
                     {numbers.map((num) => (
                        <button
                          key={num}
                          onClick={() => setSelectedNumber(num)}
                          className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                            selectedNumber === num 
                              ? 'bg-[#9333ea] text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                           {num}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <button 
              onClick={startBadak}
              disabled={status === 'PROCESSING'}
              className="w-full py-4 bg-gradient-to-r from-[#9333ea] to-[#581c87] rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
               {status === 'PROCESSING' ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
               {status === 'PROCESSING' ? 'BYPASSING...' : 'GAS BADAK'}
            </button>
         </div>
      </section>

      {/* Status Card */}
      <section className="glass rounded-[2rem] p-6 space-y-6 border border-white/5 relative overflow-hidden transition-all duration-500">
         <AnimatePresence mode="wait">
            {(status === 'PROCESSING' || status === 'READY') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <p className={`text-[8px] font-black uppercase tracking-widest ${status === 'PROCESSING' ? 'text-[#9333ea] animate-pulse' : 'text-green-500'}`}>
                          {status === 'PROCESSING' ? 'Protocol In Progress' : 'Protocol Complete'}
                       </p>
                       <h4 className="text-xs font-black text-white uppercase tracking-tight">
                          {status === 'PROCESSING' ? BADAK_STEPS[currentStepIndex] : 'All Processes Finished'}
                       </h4>
                    </div>
                    <span className="text-[10px] font-black text-white">{Math.round(progress)}%</span>
                 </div>

                 {/* Progress Bar */}
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full shadow-[0_0_10px_rgba(147,51,234,0.5)] ${status === 'READY' ? 'bg-green-500 shadow-green-500/50' : 'bg-[#9333ea]'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                    />
                 </div>

                 {/* Detailed Steps Breakdown */}
                 <div className="grid grid-cols-1 gap-3 pt-2">
                    {BADAK_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex || status === 'READY';
                      const isCurrent = idx === currentStepIndex && status === 'PROCESSING';
                      
                      return (
                        <div key={idx} className="flex items-center gap-4 group">
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500/20 text-green-500' : isCurrent ? 'bg-[#9333ea]/20 text-[#9333ea]' : 'bg-white/5 text-slate-700'}`}>
                              {isCompleted ? <CheckCircle2 size={12} /> : isCurrent ? <Loader2 size={12} className="animate-spin" /> : <div className="w-1 h-1 rounded-full bg-current" />}
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isCompleted ? 'text-slate-300' : isCurrent ? 'text-white' : 'text-slate-600'}`}>
                              {step}
                           </span>
                        </div>
                      );
                    })}
                 </div>
              </motion.div>
            )}
         </AnimatePresence>

         <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${status === 'IDLE' ? 'bg-slate-500/10 text-slate-500' : status === 'PROCESSING' ? 'bg-[#9333ea]/10 text-[#9333ea]' : 'bg-green-500/10 text-green-500'}`}>
                  {status === 'PROCESSING' ? <Loader2 size={24} className="animate-spin" /> : <Shield size={24} />}
               </div>
               <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Execution Mode</p>
                  <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${status === 'IDLE' ? 'text-slate-300' : status === 'PROCESSING' ? 'text-[#9333ea]' : 'text-green-500'}`}>
                     {status === 'IDLE' ? 'SYSTEM IDLE' : status === 'PROCESSING' ? 'BYPASSING...' : 'BADAK READY'}
                  </p>
               </div>
            </div>
            {status === 'READY' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <div className="bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[8px] font-black text-green-500 uppercase">Success</span>
                </div>
              </motion.div>
            )}
         </div>
      </section>

      {/* Success Details Card */}
      <AnimatePresence>
         {status === 'READY' && (
           <motion.div 
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="glass border-[#22c55e]/30 bg-gradient-to-br from-[#22c55e]/10 to-transparent rounded-[2rem] p-8 space-y-6 relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="text-center space-y-2 relative z-10">
                 <div className="w-20 h-20 bg-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={40} className="text-green-500" />
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">BADAK BERHASIL</h3>
                 <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.4em] pt-1">Protocol Matrix Executed</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 relative z-10">
                 <div className="bg-black/60 rounded-3xl p-6 border border-green-500/10 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nomor Tujuan</p>
                       <p className="text-md font-black text-white tracking-widest">{phoneNumber}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                       <Phone size={18} />
                    </div>
                 </div>
                 
                 <div className="bg-black/60 rounded-3xl p-6 border border-green-500/10 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Badak Protocol</p>
                       <p className="text-md font-black text-white tracking-widest">MATRIX #{selectedNumber}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                       <Hash size={18} />
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setStatus('IDLE')}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
              >
                 RESET SESSION
              </button>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Tutorial Card */}
      <section className="glass rounded-[2rem] overflow-hidden border border-white/10">
         <div className="bg-[#9333ea]/20 px-8 py-5 border-b border-[#9333ea]/20 flex items-center gap-3">
            <Hash size={18} className="text-[#9333ea]" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">CARA BADAK PROTOCOL</h3>
         </div>
         <div className="p-8 space-y-4">
            {[
              "Beli Nomer Yang Old/Fresh Terlebih Dahulu.",
              "Pasang Imail & Pin",
              "Diamkan 1-7 hari, Setting Proxy 1.1.1.1",
              "Hari Ke 2 Matikan Proxy Lalu Tes Blast.",
              "Jika Cuma Limit Dan Ga Kenon = SUKSES.",
              "Jika Limit Nyalakan Kembali Proxynya.",
              "Diamkan Sampai Limit Hilang, Jangan Buka WA.",
              "Selesai Dehh Badak."
            ].map((step, i) => (
              <div key={i} className="flex gap-4 group">
                 <span className="text-[10px] font-black text-[#9333ea] opacity-40 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                 <p className="text-[10px] font-black text-slate-300 uppercase leading-relaxed tracking-wide">{step}</p>
              </div>
            ))}
         </div>
      </section>

      <section className="bg-black/40 border border-white/5 rounded-3xl p-8 text-center space-y-4">
         <Shield size={40} className="mx-auto text-[#9333ea] opacity-40" />
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed max-w-[240px] mx-auto">
            ALL PROTOCOLS ARE END-TO-END ENCRYPTED. 
            DO NOT SHARE ACCESS CODES IN PUBLIC CHANNELS.
         </p>
      </section>
    </div>
  );
};

export default WhatsApp;
