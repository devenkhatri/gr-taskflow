
import React from 'react';
import { LayoutDashboard, CheckCircle2, ClipboardList, Clock, Settings, User, Columns3, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'kanban' | 'tasks' | 'logs';
  onViewChange: (view: 'dashboard' | 'kanban' | 'tasks' | 'logs') => void;
}

const Sidebar: React.FC<SidebarProps & { isOpen: boolean; onClose: () => void }> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Analytics' },
    { id: 'kanban', icon: <Columns3 size={20} />, label: 'Kanban Board' },
    { id: 'tasks', icon: <ClipboardList size={20} />, label: 'All Tasks' },
    { id: 'logs', icon: <Activity size={20} />, label: 'Activity Logs' },
  ];

  const handleViewChange = (id: string) => {
    onViewChange(id as any);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white h-full border-r border-slate-200 flex flex-col flex-shrink-0 
        transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
              <ClipboardList className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">TaskFlow</span>
          </div>
          {/* Close button for mobile */}
          {/* Note: User usually clicks outside, but explicit close is good practice */}
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <span className={`${currentView === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="mt-8 px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all opacity-50 cursor-not-allowed">
            <User size={20} className="text-slate-400" />
            <span>Team Members</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all opacity-50 cursor-not-allowed">
            <Settings size={20} className="text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
              DG
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">Deven Goratela</p>
              <p className="text-xs text-slate-500">Workspace Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
