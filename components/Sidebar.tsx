
import React from 'react';
import { LayoutDashboard, CheckCircle2, ClipboardList, Clock, Settings, User } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', active: true },
    { icon: <ClipboardList size={20} />, label: 'Tasks', active: false },
    { icon: <CheckCircle2 size={20} />, label: 'Completed', active: false },
    { icon: <Clock size={20} />, label: 'Logs', active: false },
    { icon: <User size={20} />, label: 'Team', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ClipboardList className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800">TaskFlow</span>
        </div>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold">
            DG
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Deven Goratela</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
