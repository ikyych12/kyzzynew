import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key as KeyIcon, 
  Shield, 
  Trash2, 
  Plus, 
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
  Ban,
  UserCheck,
  Edit2,
  Mail
} from 'lucide-react';
import { collection, query, getDocs, doc, deleteDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from '../lib/firebase';
import { UserProfile, PremiumKey, storage } from '../lib/storage';
import { handleFirestoreError, OperationType } from '../lib/errors';

interface AdminPanelProps {
  user: UserProfile;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [keys, setKeys] = useState<PremiumKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'keys'>('users');

  // Key Creation State
  const [newKeyDays, setNewKeyDays] = useState(30);
  const [newKeyRole, setNewKeyRole] = useState<'MEMBER' | 'RESELLER' | 'ADMIN'>('MEMBER');
  const [newKeyTarget, setNewKeyTarget] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  // Subject Creation State
  const [newSubjectUsername, setNewSubjectUsername] = useState('');
  const [newSubjectPassword, setNewSubjectPassword] = useState('1');
  const [newSubjectRole, setNewSubjectRole] = useState<'MEMBER' | 'RESELLER' | 'ADMIN'>('MEMBER');
  const [newSubjectTier, setNewSubjectTier] = useState<'Free' | 'Premium' | 'Lifetime'>('Free');
  const [newSubjectDurationHours, setNewSubjectDurationHours] = useState(24);
  const [creatingUser, setCreatingUser] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // Sync every minute
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (expiry: string | null) => {
    if (!expiry) return { text: 'UNLIMITED', color: 'text-slate-400', isExpired: false };
    const expiryDate = new Date(expiry);
    const diff = expiryDate.getTime() - currentTime.getTime();
    
    if (diff <= 0) return { text: 'EXPIRED', color: 'text-red-500', isExpired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}D ${hours}H REMAINING`, color: 'text-green-500', isExpired: false };
    if (hours > 0) return { text: `${hours}H ${minutes}M REMAINING`, color: 'text-yellow-500', isExpired: false };
    return { text: `${minutes}M REMAINING`, color: 'text-orange-500', isExpired: false };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(d => ({ ...d.data(), id: d.id } as UserProfile)));
      
      const keysSnap = await getDocs(collection(db, 'premiumKeys'));
      setKeys(keysSnap.docs.map(d => ({ ...d.data(), id: d.id } as PremiumKey)));
    } catch (err: any) {
      console.error(err);
      alert(`SYNC ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!newSubjectUsername) return alert('Username required');
    const targetPath = `users/${newSubjectUsername.toLowerCase()}`;
    setCreatingUser(true);
    try {
      const expiry = newSubjectTier === 'Lifetime' 
        ? null 
        : new Date(Date.now() + newSubjectDurationHours * 60 * 60 * 1000).toISOString();

      await storage.createUser(newSubjectUsername, {
        password: newSubjectPassword,
        role: newSubjectRole,
        tier: newSubjectTier,
        expiry: expiry
      });
      await fetchData();
      setNewSubjectUsername('');
      setNewSubjectPassword('1');
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, targetPath, auth);
    } finally {
      setCreatingUser(false);
    }
  };

  const generateKey = async () => {
    setCreatingKey(true);
    let keyId = 'new-key';
    try {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const keyString = `TMK-${randomPart}`;
      keyId = keyString; // Use key as ID for public getDoc lookup
      
      const keyData = {
        key: keyString,
        durationDays: newKeyDays,
        targetRole: newKeyRole,
        targetUser: newKeyTarget || null,
        status: 'unused',
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'premiumKeys', keyId), keyData);
      await fetchData();
      setNewKeyTarget('');
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, `premiumKeys/${keyId}`, auth);
    } finally {
      setCreatingKey(false);
    }
  };

  const updateUserProfile = async (uId: string, updates: Partial<UserProfile>) => {
    if (!auth.currentUser) {
      return alert('AUTH REQUIRED: You must be logged in with Google (kytyg800@gmail.com) to modify database records.');
    }
    try {
      await updateDoc(doc(db, 'users', uId), updates);
      await fetchData();
      alert('PROTOCOL UPDATED SUCCESSFULLY');
    } catch (err: any) {
      console.error(err);
      alert(`UPDATE FAILED: ${err.message}`);
      handleFirestoreError(err, OperationType.UPDATE, `users/${uId}`, auth);
    }
  };

  const toggleBan = async (u: UserProfile) => {
    const isBanned = !u.isBanned;
    const reason = isBanned ? prompt('Reason for ban?') || 'Violation of terms' : '';
    await updateUserProfile(u.id, { isBanned, bannedReason: reason });
  };

  const deleteUser = async (uId: string) => {
    if (!auth.currentUser) {
      return alert('AUTH REQUIRED: You must be logged in with Google (kytyg800@gmail.com) to delete subjects.');
    }
    if (uId === 'iky' || uId === 'kyzzy') return alert('PROTECTED IDENTITY');
    if (!confirm('DELETE SUBJECT DATA?')) return;
    try {
      await deleteDoc(doc(db, 'users', uId));
      await fetchData();
      alert('SUBJECT DELETED');
    } catch (err: any) {
      console.error(err);
      alert(`DELETE FAILED: ${err.message}`);
    }
  };

  const deleteKey = async (kId: string) => {
    if (!confirm('DELETE PROTOCOL KEY?')) return;
    try {
      await deleteDoc(doc(db, 'premiumKeys', kId));
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 size={40} className="animate-spin text-[#9333ea]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-black tracking-tighter uppercase">Admin Console</h2>
         <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-bold">Authorized Personnel Only</p>
         {user.role === 'OWNER' && !auth.currentUser && (
           <div className="mt-4 p-6 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-3xl space-y-4">
             <div className="space-y-1">
               <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest text-center">Elevation Required</p>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center leading-relaxed">
                 You are logged in with PIN. Database write operations (Ban, Delete, Create) require Google Authentication for security.
               </p>
             </div>
             <button 
               onClick={async () => {
                 try {
                   await loginWithGoogle();
                   window.location.reload();
                 } catch (e) {
                   alert('Elevation Failed');
                 }
               }}
               className="w-full py-3 bg-yellow-500 text-black rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
             >
               <Mail size={12} /> Elevate to Protocol Admin
             </button>
           </div>
         )}
         {user.role === 'OWNER' && auth.currentUser && !auth.currentUser.email?.includes('kytyg800@gmail.com') && (
           <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
             <p className="text-[9px] text-red-500 font-black uppercase tracking-widest text-center">
               Unauthorized Admin Account: {auth.currentUser.email}
             </p>
           </div>
         )}
      </div>

      <div className="flex gap-2 p-1 glass rounded-2xl border border-white/5">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#9333ea] text-white' : 'text-slate-500'}`}
        >
          Subjects
        </button>
        <button 
          onClick={() => setActiveTab('keys')}
          className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'keys' ? 'bg-[#c084fc] text-black' : 'text-slate-500'}`}
        >
          Matrix Keys
        </button>
      </div>

      {activeTab === 'keys' && (
        <section className="glass rounded-3xl p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest pl-2">Generate Protocol Key</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Duration (Days)</label>
                  <input 
                    type="number" 
                    value={newKeyDays}
                    onChange={(e) => setNewKeyDays(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Target Grade</label>
                  <select 
                    value={newKeyRole}
                    onChange={(e: any) => setNewKeyRole(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black uppercase"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="RESELLER">Reseller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Hard-coded Target (Optional)</label>
               <input 
                type="text" 
                placeholder="USERNAME"
                value={newKeyTarget}
                onChange={(e) => setNewKeyTarget(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black uppercase"
              />
            </div>
            <button 
              onClick={generateKey}
              disabled={creatingKey}
              className="w-full py-4 bg-[#c084fc] text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              {creatingKey ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Generate Access Serial
            </button>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest pl-2">Active Protocols ({keys.length})</h3>
             <div className="space-y-3">
                {keys.sort((a, b) => {
                  const timeA = a.createdAt?.seconds || 0;
                  const timeB = b.createdAt?.seconds || 0;
                  return timeB - timeA;
                }).map(k => (
                  <div key={k.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white/5 rounded-xl text-[#c084fc]">
                          <KeyIcon size={20} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-black uppercase tracking-tighter text-white">{k.key}</p>
                             <button onClick={() => navigator.clipboard.writeText(k.key)} className="text-slate-600 hover:text-white transition-colors">
                                <Copy size={12} />
                             </button>
                          </div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {k.durationDays}D | {k.targetRole} {k.targetUser ? `→ ${k.targetUser}` : ''}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${k.status === 'unused' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {k.status}
                       </span>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="space-y-6">
           <div className="glass rounded-3xl p-6 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest pl-2">Create New Subject</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Username</label>
                    <input 
                      type="text" 
                      value={newSubjectUsername}
                      onChange={(e) => setNewSubjectUsername(e.target.value)}
                      placeholder="IDENTITY"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black uppercase"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">PIN Code</label>
                    <input 
                      type="text" 
                      value={newSubjectPassword}
                      onChange={(e) => setNewSubjectPassword(e.target.value)}
                      placeholder="PIN"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Role</label>
                    <select 
                      value={newSubjectRole}
                      onChange={(e: any) => setNewSubjectRole(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black uppercase"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="RESELLER">Reseller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Clearance</label>
                    <select 
                      value={newSubjectTier}
                      onChange={(e: any) => setNewSubjectTier(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black uppercase"
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">Premium</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                 </div>
              </div>
              {newSubjectTier !== 'Lifetime' && (
                <div className="space-y-2">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-2">Lease Duration (Hours)</label>
                   <input 
                     type="number" 
                     value={newSubjectDurationHours}
                     onChange={(e) => setNewSubjectDurationHours(Number(e.target.value))}
                     className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#9333ea] text-xs font-black"
                   />
                </div>
              )}
              <button 
                onClick={createSubject}
                disabled={creatingUser}
                className="w-full py-4 bg-[#9333ea] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {creatingUser ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Register Subject
              </button>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest pl-2">Subject Database ({users.length})</h3>
              <div className="space-y-4">
                 {users.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(u => (
                    <div key={u.id} className="glass rounded-[2rem] p-6 space-y-4 relative overflow-hidden group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg ${u.isBanned ? 'from-red-600 to-red-900 border border-red-500/50' : 'from-[#9333ea] to-[#581c87]'}`}>
                                {u.isBanned ? <Ban size={24} /> : u.username[0]?.toUpperCase()}
                             </div>
                             <div>
                                <h4 className={`text-lg font-black tracking-tighter uppercase ${u.isBanned ? 'text-red-500 line-through' : 'text-white'}`}>{u.username}</h4>
                                <div className="flex items-center gap-2">
                                   <Shield size={10} className="text-[#d8b4fe]" />
                                   <span className="text-[10px] font-black text-[#d8b4fe] uppercase tracking-widest">{u.role}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => toggleBan(u)}
                               className={`p-3 rounded-2xl transition-all ${u.isBanned ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                               title={u.isBanned ? 'Unban' : 'Ban'}
                             >
                                {u.isBanned ? <UserCheck size={20} /> : <Ban size={20} />}
                             </button>
                             <button onClick={() => deleteUser(u.id)} className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>

                       {u.isBanned && (
                         <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Banned Reason</p>
                            <p className="text-xs text-red-400 font-bold">{u.bannedReason || 'NO REASON PROVIDED'}</p>
                         </div>
                       )}

                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                             <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Clearance Status</p>
                             <select 
                               value={u.tier}
                               onChange={(e) => updateUserProfile(u.id, { tier: e.target.value as any })}
                               className="w-full bg-transparent text-[10px] font-black text-[#9333ea] uppercase focus:outline-none cursor-pointer appearance-none"
                             >
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                                <option value="Lifetime">Lifetime</option>
                             </select>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                             <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Role Clearance</p>
                             <select 
                               value={u.role}
                               onChange={(e) => updateUserProfile(u.id, { role: e.target.value as any })}
                               className="w-full bg-transparent text-[10px] font-black text-[#d8b4fe] uppercase focus:outline-none cursor-pointer appearance-none"
                             >
                                <option value="MEMBER">Member</option>
                                <option value="RESELLER">Reseller</option>
                                <option value="ADMIN">Admin</option>
                             </select>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                             <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Status / Expiry</p>
                             <p className={`text-[10px] font-black uppercase truncate ${getRemainingTime(u.expiry).color}`}>
                               {getRemainingTime(u.expiry).text}
                             </p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                             <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Registered At</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase">
                               {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                             </p>
                          </div>
                       </div>

                       <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2 group/token">
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Login Token (Key)</p>
                          <div className="flex items-center justify-between">
                             <code className="text-[10px] font-black text-yellow-500 tracking-wider blur-[3px] group-hover/token:blur-0 transition-all">
                                {u.recoveryKey || 'NO TOKEN'}
                             </code>
                             {u.recoveryKey && (
                               <button 
                                 onClick={() => navigator.clipboard.writeText(u.recoveryKey!)}
                                 className="text-slate-600 hover:text-white transition-colors"
                               >
                                  <Copy size={14} />
                               </button>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}
    </div>
  );
};

export default AdminPanel;
