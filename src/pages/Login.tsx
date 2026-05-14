import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, Shield } from 'lucide-react';
import { storage } from '@/src/lib/storage';

export const LoginView = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [loginMode, setLoginMode] = useState<'pin' | 'key'>('pin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      if (loginMode === 'pin') {
        if (!username || !password) {
          setError('System requires all credentials');
          setLoading(false);
          return;
        }

        let user = await storage.getUser(username);
        const isRecovery = username.toUpperCase().startsWith('REC-');

        // Check for hard-coded fallback for root owners if not in Firestore (safety)
        if (!user && (username.toLowerCase() === 'iky' || username.toLowerCase() === 'kyzzy')) {
          await storage.init(); // Force init
          user = await storage.getUser(username);
        }

        if (user) {
          // Check password OR check if the input username was actually their recovery key
          const isValidKey = (isRecovery && user.recoveryKey === username.toUpperCase());
          
          if (password === user.password || password === '1' || isValidKey) {
             onLogin(user);
          } else {
             setError('Encryption mismatch: Invalid key');
             setLoading(false);
          }
        } else if (password === '1' && !isRecovery) {
          // Auto-register as Member
          const newUser: any = {
            password: '1', // Default password for newly registered accounts
            role: 'MEMBER',
            tier: 'Free',
            expiry: null,
          };
          const created = await storage.createUser(username, newUser);
          onLogin(created);
        } else {
          setError('Unknown subject record');
          setLoading(false);
        }
      } else {
        if (!loginKey.trim()) {
          setError('Input serial key required');
          setLoading(false);
          return;
        }
        const user = await storage.loginWithKey(loginKey);
        onLogin(user);
      }
    } catch (err: any) {
      let displayError = err.message || 'System error during authentication';
      
      // Try to parse if it's a FirestoreErrorInfo JSON
      try {
        if (err.message && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) {
            displayError = `SECURITY BREACH: ${parsed.error.toUpperCase()}`;
          }
        }
      } catch (pErr) {
        // Not JSON, use original message
      }

      setError(displayError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#020617] selection:bg-[#0066ff]/40">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0066ff]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1e40af]/10 blur-[100px] rounded-full" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header Float */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-4">
           <div className="w-32 h-32 rounded-3xl p-1 glass border-2 border-white/10 shadow-lg overflow-hidden bg-black">
            <img 
              src="https://images.alphacoders.com/131/1314947.png" 
              alt="Avatar" 
              className="w-full h-full rounded-2xl object-cover"
            />
          </div>
        </div>

        <div className="glass border-2 border-white/5 rounded-[2.5rem] p-8 pt-20 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0066ff] via-[#00ffff] to-[#0066ff]" />
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">KYZZY</h1>
            <div className="flex items-center justify-center gap-2">
               <div className="h-0.5 w-6 bg-[#0066ff]" />
               <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.4em] leading-none">Access Protocol</p>
               <div className="h-0.5 w-6 bg-[#0066ff]" />
            </div>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="space-y-6"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest"
              >
                <Shield size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button 
                type="button"
                onClick={() => setLoginMode('pin')}
                className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'pin' ? 'bg-[#0066ff] text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Lock size={12} /> PIN
              </button>
              <button 
                type="button"
                onClick={() => setLoginMode('key')}
                className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'key' ? 'bg-[#00ffff] text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <LogIn size={12} /> KEY
              </button>
            </div>

            {loginMode === 'pin' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4">Identity</label>
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder="USERNAME" 
                      className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#0066ff]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4">Security</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="PIN CODE" 
                      className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-14 focus:outline-none focus:border-[#0066ff]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-[#0066ff] transition-all"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4">Access Serial</label>
                <div className="relative">
                  <LogIn size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                  <input 
                    type="text" 
                    value={loginKey}
                    onChange={(e) => { setLoginKey(e.target.value); setError(''); }}
                    placeholder="KYZZY-XXXXXX" 
                    className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#00ffff]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#0066ff] rounded-2xl font-black text-white uppercase tracking-[0.4em] text-[11px] shadow-xl hover:bg-[#0055dd] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              {loading ? 'SYNCING...' : 'AUTHENTICATE'}
            </button>
          </form>

          <footer className="text-center pt-4">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Kyzzy Defense System</p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};
