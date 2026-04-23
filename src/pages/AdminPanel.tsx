import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Monitor, Trash2, Edit, Save, X, UserPlus, Database } from 'lucide-react';
import { storage } from '@/src/lib/storage';

export const AdminPanel = ({ currentUser }: { currentUser: any }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  
  // Add User State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');
  const [newDuration, setNewDuration] = useState('30');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    let userList = storage.getUsers();
    
    // Granular Visibility:
    // ADMIN cannot see OWNER accounts in the registry
    if (currentUser.role === 'ADMIN') {
      userList = userList.filter(u => u.role !== 'OWNER');
    }
    
    // RESELLER and below shouldn't even be here, but just in case:
    if (currentUser.role === 'RESELLER' || currentUser.role === 'MEMBER') {
       userList = [];
    }

    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = (username: string) => {
    // Role Hierarchy Logic
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
      return alert(`Access Denied: As an ${currentUser.role}, you cannot promote users to ${editRole}.`);
    }

    if (currentUser.role === 'OWNER' && editRole === 'OWNER' && username !== currentUser.username) {
      return alert('Safety Lock: You cannot assign the OWNER role to other accounts via the console.');
    }

    storage.updateUser(username, { role: editRole as any });
    setEditingId(null);
    fetchUsers();
  };

  const handleDelete = (username: string) => {
    const targetUser = users.find(u => u.username === username);
    if (targetUser?.role === 'OWNER') return alert('Access Denied: Subject has OWNER clearance.');
    if (username === 'iky') return alert('Cannot delete root owner');
    if (!confirm('Are you sure you want to delete this user?')) return;
    storage.deleteUser(username);
    fetchUsers();
  };

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) return alert('Fill all fields');
    
    // Strict Role Hierarchy Logic
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
      return alert(`Access Denied: As an ${currentUser.role}, you cannot create a user with the role ${newRole}. You can only create roles with lower authority.`);
    }

    // Even OWNERs usually shouldn't create other OWNERs via UI to prevent accidents, 
    // but we allow them to create ADMINs and below.
    if (currentUser.role === 'OWNER' && newRole === 'OWNER') {
      return alert('Safety Lock: You cannot create another OWNER account through the matrix console.');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newDuration));

    const newUser = {
      id: Math.random().toString(36).substring(2, 11),
      username: newUsername.toLowerCase().trim(),
      role: newRole as any,
      tier: (newRole === 'ADMIN' || newRole === 'OWNER' || newRole === 'RESELLER') ? 'Premium' as const : 'Free' as const,
      expiry: expiryDate.toISOString(),
      createdAt: new Date().toISOString()
    };

    const existingUsers = storage.getUsers();
    if (existingUsers.find(u => u.username === newUser.username)) {
      return alert('Username already exists');
    }

    existingUsers.push(newUser);
    storage.saveUsers(existingUsers);
    
    alert(`Success: User ${newUsername} created with role ${newRole}`);
    setShowAddForm(false);
    setNewUsername('');
    setNewPassword('');
    fetchUsers();
  };

  return (
    <div className="p-5 pb-32 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto relative z-10">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-[0.2em] uppercase text-neon italic">Matrix</h2>
          <p className="text-[10px] text-[#0066ff] font-black uppercase tracking-[0.4em] leading-none pl-1">Level: {currentUser.role}</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-5 glass-thick text-[#0066ff] rounded-[2rem] border-2 border-[#0066ff]/20 hover:border-[#0066ff]/60 hover:bg-[#0066ff]/10 hover:shadow-neon transition-all active:scale-90"
        >
          {showAddForm ? <X size={28} /> : <UserPlus size={28} />}
        </button>
      </div>

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
                      <option value="RESELLER">RESELLER</option>
                      {currentUser.role === 'OWNER' && <option value="ADMIN">ADMIN</option>}
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
                onClick={handleCreateUser}
                className="w-full bg-gradient-to-r from-[#0066ff] to-[#1e40af] text-white rounded-[2rem] py-6 font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_15px_40px_rgba(0,102,255,0.4)] mt-4 active:scale-95 transition-all border border-white/20 text-neon"
              >
                EXECUTE IDENTITY UPLOAD
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-thick border-2 border-white/5 rounded-[3.5rem] p-10 shadow-thick">
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
                        <option value="RESELLER">RESELLER</option>
                        {currentUser.role === 'OWNER' && <option value="ADMIN">ADMIN</option>}
                        {currentUser.role === 'OWNER' && <option value="OWNER">OWNER</option>}
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
    </div>
  );
};
