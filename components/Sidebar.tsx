import React from 'react';
import { LayoutDashboard, CheckCircle2, ClipboardList, Clock, Settings, User, Columns3, Sparkles, CheckCircle, Bot, Filter } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'kanban' | 'filtered-kanban' | 'tasks' | 'logs' | 'channels' | 'users' | 'fact-checks' | 'title-generations' | 'ai-combined';
  onViewChange: (view: 'dashboard' | 'kanban' | 'filtered-kanban' | 'tasks' | 'logs' | 'channels' | 'users' | 'fact-checks' | 'title-generations' | 'ai-combined') => void;
}

const Sidebar: React.FC<SidebarProps & { isOpen: boolean; onClose: () => void }> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const handleViewChange = (view: any) => {
    onViewChange(view);
    onClose();
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <LayoutDashboard className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">TaskFlow</span>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overview</p>
          </div>
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <LayoutDashboard size={20} className={currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Dashboard</span>
          </button>

          <div className="mt-8 px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
          </div>
          <button
            onClick={() => handleViewChange('kanban')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'kanban'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <ClipboardList size={20} className={currentView === 'kanban' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => handleViewChange('filtered-kanban')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'filtered-kanban'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <Filter size={20} className={currentView === 'filtered-kanban' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Employee Kanban</span>
          </button>
          <button
            onClick={() => handleViewChange('tasks')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'tasks'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <CheckCircle2 size={20} className={currentView === 'tasks' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>All Tasks</span>
          </button>
          <button
            onClick={() => handleViewChange('logs')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'logs'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <Clock size={20} className={currentView === 'logs' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Activity Logs</span>
          </button>

          <div className="mt-8 px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Insights</p>
          </div>
          <button
            onClick={() => handleViewChange('ai-combined')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'ai-combined'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <Bot size={20} className={currentView === 'ai-combined' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>AI Master Log</span>
          </button>
          <button
            onClick={() => handleViewChange('fact-checks')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'fact-checks'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <CheckCircle size={20} className={currentView === 'fact-checks' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>AI Fact Checks</span>
          </button>
          <button
            onClick={() => handleViewChange('title-generations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'title-generations'
              ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <Sparkles size={20} className={currentView === 'title-generations' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>AI Titles</span>
          </button>


          <div className="mt-8 px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
          </div>
          <button
            onClick={() => handleViewChange('channels')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'channels'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <Columns3 size={20} className={currentView === 'channels' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Channels</span>
          </button>
          <button
            onClick={() => handleViewChange('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${currentView === 'users'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <User size={20} className={currentView === 'users' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Users</span>
          </button>
        </nav>


        {/* <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
              DG
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">Deven Goratela</p>
              <p className="text-xs text-slate-500">Workspace Admin</p>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;
