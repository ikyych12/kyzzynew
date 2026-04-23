import React from 'react';
import { motion } from 'motion/react';
import { Check, Volume2, PlayCircle, Info } from 'lucide-react';

export const TutorialView = () => {
  return (
    <div className="p-5 pb-32 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto">
      
      <div className="flex items-center gap-4 px-2">
         <div className="w-2 h-8 bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff]" />
         <div className="space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter text-neon">CORE PROTOCOL</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">Tutorial Badak Matrix</p>
         </div>
      </div>

      {/* Tutorial Matrix */}
      <section className="relative aspect-video rounded-[3.5rem] overflow-hidden border-4 border-white/5 shadow-thick bg-black group cursor-pointer transition-all hover:border-[#0066ff]/40">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
         <img 
           src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60" 
           alt="Tutorial" 
           className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
           referrerPolicy="no-referrer"
         />
         <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-24 h-24 bg-[#1e40af]/20 rounded-full border-2 border-white/20 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-all shadow-[0_0_40px_rgba(30,64,175,0.4)]">
               <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-white border-b-[14px] border-b-transparent ml-2" />
            </div>
         </div>
         <div className="absolute bottom-10 left-10 z-30 space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter text-neon">Tutorial Badak</h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Protocol</span>
               </div>
               <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">v4.5 Stable</span>
            </div>
         </div>
      </section>

      {/* Instructions Checklist Section */}
      <section className="glass-thick rounded-[3.5rem] border-4 border-white/5 p-10 space-y-8 shadow-thick">
         <div className="flex items-center gap-4 border-b border-white/5 pb-8">
            <div className="w-2 h-8 bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff]" />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] text-neon">CARA BADAK PROTOCOL</h2>
         </div>
         
         <div className="space-y-6">
            <InstructionItem text="Beli Nomer Yang Old/Fresh Terlebih Dahulu." />
            <InstructionItem text="Pasang Imail & Pin" />
            <InstructionItem text="Kalian Diamkan Selama Kurang Lebih 1-7 hari,Jangan Lupa Setting Proxy Menjadi 1.1.1.1" />
            <InstructionItem text="Pada Hari Ke 2 Kalian Matikan Proxy Lalu Tes Buat Blast." />
            <InstructionItem text="Jika Cuma Limit Dan Ga Kenon,Itu Jadi Sudah Proses Badak." />
            <InstructionItem text="Jika Limit Nyalakan Kembali Proxynya." />
            <InstructionItem text="Diamkan Sampai Limit Hilang,Jangan Buka WhatsApp." />
            <InstructionItem text="Selesai Dehh Badak." />
         </div>
      </section>

      <section className="glass-thick border-4 border-white/5 rounded-[2.5rem] p-8 space-y-4">
         <div className="flex items-center gap-3 text-white/50">
            <Info size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">System Intelligence</h3>
         </div>
         <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
            "Follow the protocol precisely. Any deviation might result in registry termination or node disconnect. The Badak process requires patience and sequence."
         </p>
      </section>

      <footer className="pt-10 text-center pb-10">
         <div className="inline-block px-10 py-4 bg-white/5 rounded-full border border-white/5 backdrop-blur-md shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700">Kyzzy Protocol Matrix v4.5</p>
         </div>
      </footer>
    </div>
  );
};

const InstructionItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-5 group">
    <div className="mt-1">
       <div className="w-6 h-6 rounded-lg bg-[#0066ff]/10 flex items-center justify-center border border-[#0066ff]/20 group-hover:bg-[#0066ff] group-hover:text-white transition-all">
          <Check size={14} className="group-hover:scale-110 transition-transform" />
       </div>
    </div>
    <p className="text-[12px] font-bold text-slate-400 leading-relaxed group-hover:text-white transition-colors">{text}</p>
  </div>
);
