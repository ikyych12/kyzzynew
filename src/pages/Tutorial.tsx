import React from 'react';
import { Play, PlayCircle, Loader2, Info } from 'lucide-react';
import { UserProfile } from '../lib/storage';

interface TutorialProps {
  user: UserProfile;
}

const Tutorial: React.FC<TutorialProps> = ({ user }) => {
  const videos = [
    { title: 'GAS BADAK GUIDE', duration: '5:22', thumbnail: 'https://images6.alphacoders.com/131/1315891.jpeg' },
    { title: 'MATRIX OVERVIEW', duration: '3:45', thumbnail: 'https://images5.alphacoders.com/131/1314947.png' }
  ];

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-lg mx-auto">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-black tracking-tighter uppercase">Protocol Training</h2>
         <p className="text-[10px] text-[#9333ea] uppercase tracking-[0.3em] font-bold">Standard Operating Procedures</p>
      </div>

      <div className="space-y-6">
        {videos.map((vid, idx) => (
          <div key={idx} className="glass rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5 shadow-xl">
             <div className="aspect-video relative overflow-hidden">
                <img src={vid.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Video" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-125 transition-transform">
                      <Play size={32} className="fill-white" />
                   </div>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white">
                   {vid.duration}
                </div>
             </div>
             <div className="p-6 flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">{vid.title}</h3>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Classification: Confidential</p>
                </div>
                <PlayCircle size={24} className="text-slate-700 group-hover:text-[#9333ea] transition-colors" />
             </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[#9333ea]/5 border border-[#9333ea]/20 rounded-2xl flex gap-4 items-start">
         <Info size={20} className="text-[#9333ea] shrink-0 mt-0.5" />
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
            WATCH FULL VIDEO BEFORE DEPLOYING MODULES. 
            INCORRECT PROTOCOL SEQUENCE MAY LEAD TO SUBJECT LOCKOUT.
         </p>
      </div>
    </div>
  );
};

export default Tutorial;
