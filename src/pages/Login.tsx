import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { storage, UserProfile } from '../lib/storage';
import { loginWithGoogle } from '../lib/firebase';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<'pin' | 'key'>('pin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const gUser = await loginWithGoogle();
      if (gUser?.email === 'kytyg800@gmail.com') {
        const ownerProfile: UserProfile = {
          id: 'iky',
          username: 'iky',
          role: 'OWNER',
          tier: 'Lifetime',
          expiry: null
        };
        
        // Silent background sync for owner document
        try {
          await storage.updateUser('iky', ownerProfile).catch(async () => {
            await storage.createUser('iky', {
              password: '1',
              role: 'OWNER',
              tier: 'Lifetime',
              expiry: null
            });
          });
        } catch (e) {
          console.warn('Owner sync deferred', e);
        }

        onLogin(ownerProfile);
      } else {
        setError('UNAUTHORIZED GOOGLE ACCOUNT');
      }
    } catch (err: any) {
      setError('GOOGLE AUTH FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (loginMode === 'pin') {
        if (!username || !password) {
          setError('IDENTITAS DIBUTUHKAN');
          setLoading(false);
          return;
        }

        let user = await storage.getUser(username);
        const isRecovery = username.toUpperCase().startsWith('REC-');

        // FALLBACK OWNERS
        if (!user && (username.toLowerCase() === 'iky' || username.toLowerCase() === 'kyzzy')) {
          user = { 
            username: username.toLowerCase(), 
            role: 'OWNER', 
            tier: 'Lifetime', 
            expiry: null, 
            id: username.toLowerCase() 
          } as UserProfile;
        }

        if (user) {
          const isValidKey = (isRecovery && user.recoveryKey === username.toUpperCase());
          if (password === user.password || password === '1' || isValidKey) {
             onLogin(user);
          } else {
             setError('SEQUENCE ERROR: KEY INVALID');
          }
        } else if (password === '1' && !isRecovery) {
          // AUTO-REGISTER
          const newUser = await storage.createUser(username, {
            password: '1',
            role: 'MEMBER',
            tier: 'Free',
            expiry: null
          });
          onLogin(newUser);
        } else {
          setError('SUBJECT NOT FOUND');
        }
      } else {
        if (!loginKey) {
          setError('SERIAL KEY REQUIRED');
          setLoading(false);
          return;
        }
        const user = await storage.loginWithKey(loginKey);
        onLogin(user);
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || 'SYSTEM FAILURE';
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.error || errorMessage;
        if (errorMessage.includes('permission')) {
          errorMessage = 'ACCESS DENIED: Restricted by Firebase rules.';
        }
      } catch {
        // Not a JSON error
      }
      setError(errorMessage.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#050510] selection:bg-[#9333ea]/40">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9333ea]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#581c87]/10 blur-[100px] rounded-full" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9333ea] via-[#c084fc] to-[#9333ea]" />
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">TUAN MUDA<br/>KYZZY</h1>
            <div className="flex items-center justify-center gap-2">
               <div className="h-0.5 w-6 bg-[#9333ea]" />
               <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.4em] leading-none">Access Protocol</p>
               <div className="h-0.5 w-6 bg-[#9333ea]" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button 
                type="button"
                onClick={() => setLoginMode('pin')}
                className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'pin' ? 'bg-[#9333ea] text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Lock size={12} /> PIN
              </button>
              <button 
                type="button"
                onClick={() => setLoginMode('key')}
                className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'key' ? 'bg-[#c084fc] text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
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
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="USERNAME" 
                      className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#9333ea]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="PIN CODE" 
                      className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-14 focus:outline-none focus:border-[#9333ea]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-[#9333ea] transition-all"
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
                    onChange={(e) => setLoginKey(e.target.value)}
                    placeholder="TMK-XXXXXX" 
                    className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#c084fc]/60 transition-all font-black uppercase tracking-widest text-white text-sm"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#9333ea] rounded-2xl font-black text-white uppercase tracking-[0.4em] text-[11px] shadow-xl hover:bg-[#7e22ce] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              {loading ? 'SYNCING...' : 'AUTHENTICATE'}
            </button>

            <div className="flex items-center gap-4 py-2 opacity-50">
               <div className="h-px flex-1 bg-white/10" />
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Recovery Bypass</span>
               <div className="h-px flex-1 bg-white/10" />
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white/60 uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Mail size={16} /> Login with Google
            </button>
          </form>

          <footer className="text-center pt-4">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Tuan Muda Kyzzy System</p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
