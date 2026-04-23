import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, Shield } from 'lucide-react';
import { storage } from '@/src/lib/storage';

export const LoginView = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('System requires all credentials');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate system processing
    setTimeout(() => {
      // Initialize system data
      storage.init();

      let user = storage.getUser(username);

      if (username.toLowerCase() === 'iky') {
        if (password === '1') {
          // Hard-enforce OWNER role for iky
          if (!user) {
            user = {
              id: 'iky_root',
              username: 'iky',
              role: 'OWNER',
              tier: 'Lifetime',
              expiry: null,
              createdAt: new Date().toISOString()
            };
          } else if (user.role !== 'OWNER') {
             user.role = 'OWNER';
             user.tier = 'Lifetime';
             storage.updateUser('iky', { role: 'OWNER', tier: 'Lifetime' });
          }
          onLogin(user);
        } else {
          setError('Encryption mismatch: Invalid key');
          setLoading(false);
        }
        return;
      }

      if (user) {
        if (password === '1' || password === username) {
           onLogin(user);
        } else {
           setError('Encryption mismatch: Invalid key');
           setLoading(false);
        }
      } else if (password === '1') {
        // Auto-register as Member
        const newUser = {
          id: Math.random().toString(36).substring(2, 11),
          username: username.toLowerCase(),
          role: 'MEMBER' as const,
          tier: 'Free' as const,
          expiry: null,
          createdAt: new Date().toISOString()
        };
        const users = storage.getUsers();
        users.push(newUser);
        storage.saveUsers(users);
        onLogin(newUser);
      } else {
        setError('Unknown subject record');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#020617] selection:bg-[#0066ff]/40">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0066ff]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1e40af]/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#0066ff 1px, transparent 1px), linear-gradient(90deg, #0066ff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header Float */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-4">
           <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-40 h-40 rounded-[3.5rem] p-1.5 glass-thick border-4 border-white/20 shadow-neon overflow-hidden bg-black rotate-6 hover:rotate-0 transition-transform duration-500"
          >
            <img 
              src="https://images.alphacoders.com/131/1314947.png" 
              alt="Avatar" 
              className="w-full h-full rounded-[3rem] object-cover transition-all duration-700"
            />
          </motion.div>
        </div>

        <div className="glass-thick border-[6px] border-white/5 rounded-[4rem] p-10 pt-24 space-y-10 shadow-thick bg-black/40 backdrop-blur-3xl overflow-hidden relative scanline">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0066ff] via-[#00ffff] to-[#0066ff] animate-pulse" />
          
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic text-neon">KYZZY</h1>
            <div className="flex items-center justify-center gap-2">
               <div className="h-0.5 w-8 bg-[#0066ff]" />
               <p className="text-[9px] text-white font-black uppercase tracking-[0.5em] leading-none">Access Protocol</p>
               <div className="h-0.5 w-8 bg-[#0066ff]" />
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border-2 border-red-500/20 p-5 rounded-3xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                   <Shield size={16} />
                </div>
                {error}
              </motion.div>
            )}

            {/* Username Input Container */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pl-6">Subject Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-700 pointer-events-none transition-all group-focus-within:text-[#0066ff] group-focus-within:scale-110">
                   <User size={22} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="USERNAME" 
                  className="w-full bg-black/80 border-4 border-white/5 rounded-[2.5rem] py-7 pl-16 pr-8 focus:outline-none focus:border-[#0066ff]/60 focus:bg-black transition-all font-black uppercase tracking-widest text-white shadow-thick placeholder:text-slate-900"
                />
              </div>
            </div>

            {/* Password Input Container */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pl-6">Security Sequence</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-700 pointer-events-none transition-all group-focus-within:text-[#0066ff] group-focus-within:scale-110">
                   <Lock size={22} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="ENCRYPT_KEY" 
                  className="w-full bg-black/80 border-4 border-white/5 rounded-[2.5rem] py-7 pl-16 pr-16 focus:outline-none focus:border-[#0066ff]/60 focus:bg-black transition-all font-black uppercase tracking-widest text-white shadow-thick placeholder:text-slate-900"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-8 flex items-center text-slate-700 hover:text-[#0066ff] transition-all active:scale-90"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-8 bg-gradient-to-br from-[#0066ff] to-[#1e40af] rounded-[2.5rem] font-black text-white uppercase tracking-[0.6em] text-[11px] shadow-[0_25px_50px_rgba(0,102,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-2 border-white/20 text-neon"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <LogIn size={24} />}
            {loading ? 'SYNCING MATRIX...' : 'AUTHENTICATE'}
          </button>

          <footer className="pt-4 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Protected by Kyzzy Defense System</p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};
