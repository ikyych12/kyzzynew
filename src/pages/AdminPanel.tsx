import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Monitor, Trash2, Edit, Save, X, UserPlus, Database, Key, Plus, Copy, Check } from 'lucide-react';
import { storage, PremiumKey, UserProfile } from '@/src/lib/storage';

const getSeconds = (ts: any) => {
  if (!ts) return 0;
  if (typeof ts.seconds === 'number') return ts.seconds;
  if (ts instanceof Date) return Math.floor(ts.getTime() / 1000);
  if (typeof ts === 'string') return Math.floor(new Date(ts).getTime() / 1000);
  return 0;
};

export const AdminPanel = ({ currentUser }: { currentUser: UserProfile }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'keys'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [keys, setKeys] = useState<PremiumKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  
  // Add User State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');
  const [newDuration, setNewDuration] = useState('30');
  const [showAddForm, setShowAddForm] = useState(false);

  // Key System State
  const [keyDuration, setKeyDuration] = useState('30');
  const [keyTargetRole, setKeyTargetRole] = useState<'MEMBER' | 'RESELLER' | 'ADMIN'>('MEMBER');
  const [keyTargetUser, setKeyTargetUser] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeAdminTab === 'users' || activeAdminTab === 'keys') {
        const userList = await storage.getUsers();
        if (activeAdminTab === 'users') {
          let filteredUsers = userList;
          if (currentUser.role === 'ADMIN') {
            filteredUsers = userList.filter(u => u.role !== 'OWNER');
          } else if (currentUser.role === 'RESELLER') {
            filteredUsers = userList.filter(u => u.role === 'MEMBER');
          }
          setUsers(filteredUsers);
        } else {
          // Always fetch users for selection in keys tab
          setUsers(userList);
        }
      }
      
      if (activeAdminTab === 'keys') {
        const keyList = await storage.getKeys();
        setKeys(keyList.sort((a, b) => getSeconds(b.createdAt) - getSeconds(a.createdAt)));
      }
    } catch (err: any) {
      let msg = 'Failed to fetch matrix data';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `ACCESS DENIED: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      console.error(err);
      alert(msg);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeAdminTab]);

  const handleUpdateRole = async (username: string) => {
    const getRoleWeight = (role: string) => {
      switch (role) {
        case 'OWNER': return 4;
        case 'ADMIN': return 3;
        case 'RESELLER': return 2;
        case 'MEMBER': return 1;
        default: return 0;
      }
    };

    const currentWeight = getRoleWeight(currentUser.role);
    const targetWeight = getRoleWeight(editRole);

    if (targetWeight >= currentWeight && currentUser.role !== 'OWNER') {
      return alert(`Akses Ditolak: Sebagai ${currentUser.role}, anda tidak bisa mempromosikan user ke ${editRole}.`);
    }

    try {
      await storage.updateUser(username, { role: editRole as any });
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      let msg = 'Failed to update subject role';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `SECURITY REJECTION: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      alert(msg);
    }
  };

  const handleDelete = async (username: string) => {
    if (username === 'iky' || username === 'kyzzy') return alert('Tidak bisa menghapus root owner');
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await storage.deleteUser(username);
      fetchData();
    } catch (err: any) {
      let msg = 'Failed to terminate subject record';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `SECURITY REJECTION: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      alert(msg);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return alert('Isi semua field');
    
    const getRoleWeight = (role: string) => {
      switch (role) {
        case 'OWNER': return 4;
        case 'ADMIN': return 3;
        case 'RESELLER': return 2;
        case 'MEMBER': return 1;
        default: return 0;
      }
    };

    const currentWeight = getRoleWeight(currentUser.role);
    const targetWeight = getRoleWeight(newRole);

    if (targetWeight >= currentWeight && currentUser.role !== 'OWNER') {
      return alert(`Akses Ditolak: Sebagai ${currentUser.role}, anda tidak bisa membuat user dengan role ${newRole}.`);
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newDuration));

    try {
      await storage.createUser(newUsername, {
        password: newPassword,
        role: newRole as any,
        tier: (newRole === 'ADMIN' || newRole === 'OWNER' || newRole === 'RESELLER') ? 'Premium' as const : 'Free' as const,
        expiry: expiryDate.toISOString(),
        createdAt: null
      });
      
      alert(`Berhasil: User ${newUsername} dibuat.`);
      setShowAddForm(false);
      setNewUsername('');
      setNewPassword('');
      fetchData();
    } catch (err: any) {
      let msg = err.message || 'System error during upload';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `IDENTITY UPLOAD REJECTED: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      alert(msg);
    }
  };

  const handleGenerateKey = async () => {
    const generatedKey = `KYZZY-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      await storage.addKey({
        key: generatedKey,
        durationDays: parseInt(keyDuration),
        status: 'unused',
        targetRole: keyTargetRole,
        targetUser: keyTargetUser || undefined,
        generatedBy: currentUser.username,
        createdAt: null
      });
      
      fetchData();
      alert(`Key Berhasil Dibuat: ${generatedKey} [${keyTargetRole}]${keyTargetUser ? ` specifically for ${keyTargetUser}` : ''}`);
      setKeyTargetUser('');
    } catch (err: any) {
      let msg = 'Failed to generate access key';
      try {
        if (err.message?.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = `SYSTEM REJECTION: ${parsed.error.toUpperCase()}`;
        }
      } catch (e) {}
      alert(msg);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-5 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto relative z-10">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-[0.2em] uppercase text-neon italic">Matrix</h2>
          <p className="text-[10px] text-[#0066ff] font-black uppercase tracking-[0.4em] leading-none pl-1">Level: {currentUser.role}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveAdminTab(activeAdminTab === 'users' ? 'keys' : 'users')}
            className="p-4 glass-thick text-white rounded-2xl border-2 border-white/5 hover:border-[#0066ff]/60 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            {activeAdminTab === 'users' ? <Key size={18} /> : <Users size={18} />}
            {activeAdminTab === 'users' ? 'Keys' : 'Users'}
          </button>
          
          {activeAdminTab === 'users' && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-4 bg-[#0066ff] text-white rounded-2xl border-2 border-[#0066ff]/20 hover:shadow-neon transition-all active:scale-90"
            >
              {showAddForm ? <X size={18} /> : <UserPlus size={18} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeAdminTab === 'users' ? (
          <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <AnimatePresence>
              {showAddForm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="overflow-hidden"
                >
                  <div className="glass-thick border-4 border-[#0066ff]/30 rounded-[4rem] p-10 space-y-8 mb-6 shadow-thick relative overflow-hidden group scanline">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066ff]/10 blur-3xl -mr-16 -mt-16" />
                    
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                      <div className="p-2 bg-[#0066ff]/10 rounded-lg text-[#0066ff]">
                         <UserPlus size={16} />
                      </div>
                      Initialize New Subject
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Target Identity</label>
                        <input 
                          type="text" 
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="USERNAME"
                          className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-sm font-black focus:outline-none focus:border-[#0066ff]/60 transition-all uppercase placeholder:text-slate-900 shadow-inner"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Security Hash</label>
                        <input 
                          type="text" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="KEYPASS"
                          className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-sm font-black focus:outline-none focus:border-[#0066ff]/60 transition-all placeholder:text-slate-900 shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Assign Class</label>
                          <select 
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-sm font-black focus:outline-none focus:border-[#0066ff]/60 transition-all text-white appearance-none cursor-pointer shadow-inner"
                          >
                            <option value="MEMBER">MEMBER</option>
                            {currentUser.role === 'ADMIN' && <option value="RESELLER">RESELLER</option>}
                            {currentUser.role === 'OWNER' && (
                              <>
                                <option value="RESELLER">RESELLER</option>
                                <option value="ADMIN">ADMIN</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Lease Data</label>
                          <select 
                            value={newDuration}
                            onChange={(e) => setNewDuration(e.target.value)}
                            className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-sm font-black focus:outline-none focus:border-[#0066ff]/60 transition-all text-white appearance-none cursor-pointer shadow-inner"
                          >
                            <option value="1">1 DAY</option>
                            <option value="7">7 DAYS</option>
                            <option value="30">30 DAYS</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCreateUser()}
                      className="w-full bg-gradient-to-r from-[#0066ff] to-[#1e40af] text-white rounded-[2rem] py-6 font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_15px_40px_rgba(0,102,255,0.4)] mt-4 active:scale-95 transition-all border border-white/20 text-neon"
                    >
                      EXECUTE IDENTITY UPLOAD
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass-thick border-4 border-white/5 rounded-[4rem] p-10 shadow-thick">
              <div className="flex items-center gap-4 mb-10 px-2 text-neon">
                 <div className="p-3 bg-[#0066ff]/10 rounded-2xl text-[#0066ff] border border-[#0066ff]/20">
                    <Database size={24} />
                 </div>
                 <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Identity Registry</h3>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 text-center text-slate-800 animate-pulse uppercase text-xs font-black tracking-[0.5em] font-mono">SCANNING MATRIX...</div>
                ) : users.map((user) => (
                  <div key={user.username} className="bg-black/30 rounded-3xl p-5 border-2 border-white/5 flex items-center justify-between group hover:border-[#0066ff]/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] font-black uppercase text-sm border-2 border-[#0066ff]/20 group-hover:scale-110 group-hover:bg-[#0066ff] group-hover:text-white transition-all">
                        {user.username?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-base capitalize text-white">{user.username}</h4>
                        <div className="flex gap-2">
                          {editingId === user.username ? (
                          <select 
                            value={editRole} 
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-[#050a14] border-2 border-[#0066ff]/60 rounded-xl px-3 py-1 text-[11px] font-black text-[#0066ff] focus:outline-none shadow-neon"
                          >
                            <option value="MEMBER">MEMBER</option>
                            {currentUser.role === 'ADMIN' && <option value="RESELLER">RESELLER</option>}
                            {currentUser.role === 'OWNER' && (
                              <>
                                <option value="RESELLER">RESELLER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="OWNER">OWNER</option>
                              </>
                            )}
                          </select>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-slate-500 border border-slate-800 px-3 py-1 rounded-full leading-none group-hover:border-[#0066ff]/40 group-hover:text-[#0066ff] transition-all">
                              {user.role}
                            </span>
                          )}
                          <span className="text-[10px] font-black uppercase text-[#0066ff]/80 border border-[#0066ff]/20 px-3 py-1 rounded-full leading-none bg-[#0066ff]/5">
                            {user.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {editingId === user.username ? (
                        <>
                          <button onClick={() => handleUpdateRole(user.username)} className="p-3 bg-green-500/10 text-green-500 rounded-2xl border-2 border-green-500/20 hover:bg-green-500 hover:text-black transition-all active:scale-90">
                            <Save size={20} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90">
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(user.username); setEditRole(user.role); }} className="p-3 text-slate-700 hover:text-[#0066ff] hover:bg-white/5 rounded-2xl transition-all">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => handleDelete(user.username)} className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="keys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="glass-thick border-4 border-[#00ffff]/30 rounded-[4rem] p-10 space-y-8 shadow-thick relative overflow-hidden group scanline">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffff]/10 blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-4 mb-2 text-neon">
                   <div className="p-3 bg-[#00ffff]/10 rounded-2xl text-[#00ffff] border border-[#00ffff]/20">
                      <Plus size={24} />
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white">Generate Access Key</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Target Account Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['MEMBER', 'RESELLER', 'ADMIN'].map((r) => {
                          const getRoleWeight = (role: string) => {
                            switch (role) {
                              case 'OWNER': return 4;
                              case 'ADMIN': return 3;
                              case 'RESELLER': return 2;
                              case 'MEMBER': return 1;
                              default: return 0;
                            }
                          };
                          
                          if (getRoleWeight(r) >= getRoleWeight(currentUser.role) && currentUser.role !== 'OWNER') return null;
                          
                          return (
                            <button
                              key={r}
                              onClick={() => setKeyTargetRole(r as any)}
                              className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${keyTargetRole === r ? 'bg-[#00ffff] text-black border-[#00ffff] shadow-neon' : 'bg-black/40 text-slate-500 border-white/5 hover:border-[#00ffff]/40'}`}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Specific Target User (Optional)</label>
                      <select 
                        value={keyTargetUser} 
                        onChange={(e) => setKeyTargetUser(e.target.value)}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-xs font-black focus:outline-none focus:border-[#00ffff]/60 transition-all text-white appearance-none cursor-pointer shadow-inner"
                      >
                        <option value="">ALL USERS (PUBLIC KEY)</option>
                        {users.map(u => (
                          <option key={u.id} value={u.username}>{u.username.toUpperCase()} [{u.role}]</option>
                        ))}
                      </select>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Key Authorization Period</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['1', '7', '30'].map((d) => (
                          <button
                            key={d}
                            onClick={() => setKeyDuration(d)}
                            className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${keyDuration === d ? 'bg-[#00ffff] text-black border-[#00ffff] shadow-neon' : 'bg-black/40 text-slate-500 border-white/5 hover:border-[#00ffff]/40'}`}
                          >
                            {d} Days
                          </button>
                        ))}
                      </div>
                   </div>

                   <button 
                    onClick={() => handleGenerateKey()}
                    className="w-full bg-gradient-to-r from-[#00ffff] to-[#0066ff] text-black rounded-[2rem] py-6 font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_15px_40px_rgba(0,255,255,0.4)] mt-2 active:scale-95 transition-all border border-white/20"
                   >
                    CREATE PREMIUM KEY
                   </button>
                </div>
             </div>

             <div className="glass-thick border-4 border-white/5 rounded-[4rem] p-10 shadow-thick">
                <div className="flex items-center gap-4 mb-10 px-2 text-neon">
                   <div className="p-3 bg-[#0066ff]/10 rounded-2xl text-[#0066ff] border border-[#0066ff]/20">
                      <Key size={24} />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">License Registry</h3>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="py-20 text-center text-slate-800 animate-pulse uppercase text-xs font-black tracking-[0.5em] font-mono">RETRIEVING KEYS...</div>
                  ) : keys.length === 0 ? (
                    <div className="py-20 text-center text-slate-800 uppercase text-[10px] font-black tracking-[0.4em]">NO ACTIVE KEYS FOUND</div>
                  ) : keys.map((k) => (
                    <div key={k.id} className="bg-black/30 rounded-3xl p-6 border-2 border-white/5 space-y-4 group hover:border-[#00ffff]/30 transition-all relative overflow-hidden">
                       <div className="flex items-center justify-between">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${k.status === 'unused' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-700'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${k.status === 'unused' ? 'text-green-500' : 'text-slate-600'}`}>{k.status}</span>
                                <span className="text-[10px] font-black text-[#00ffff] tracking-widest uppercase ml-auto">{k.targetRole}</span>
                             </div>
                             <h4 className="font-mono font-black text-white tracking-widest text-sm">{k.key}</h4>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(k.key)}
                            className={`p-4 rounded-xl transition-all ${copiedKey === k.key ? 'bg-green-500 text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                          >
                            {copiedKey === k.key ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                       </div>
                       <div className="flex justify-between items-end border-t border-white/5 pt-4">
                          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                             Generated By: <span className="text-slate-300">{k.generatedBy}</span>
                          </div>
                          {k.targetUser && (
                            <div className="text-[9px] text-yellow-500 font-black uppercase tracking-widest bg-yellow-500/5 px-2 py-0.5 rounded-lg border border-yellow-500/10 mb-0.5">
                               TARGET: {k.targetUser}
                            </div>
                          )}
                          <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-[#00ffff] uppercase">
                             {k.durationDays} Days
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
