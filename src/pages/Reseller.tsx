import React from 'react';
import { UserProfile } from '../lib/storage';

const Reseller: React.FC<{ user: UserProfile }> = ({ user }) => {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-black uppercase">Reseller Terminal</h2>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Protocol Distribution Active</p>
    </div>
  );
};

export default Reseller;
