import React, { useEffect } from 'react';
import { X, Calendar, User, Hash, MessageSquare, History, Clock } from 'lucide-react';
import { Task, TaskActivity, TaskStatus } from '../types';
import StageTracker from './StageTracker';

interface TaskDetailProps {
  task: Task;
  activities: TaskActivity[];
  stages: string[];
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, activities, stages, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return 'bg-amber-100 text-amber-700';
    if (s.includes('todo')) return 'bg-blue-100 text-blue-700';
    if (s.includes('pickup') || s.includes('picked')) return 'bg-purple-100 text-purple-700';
    if (s.includes('progress')) return 'bg-orange-100 text-orange-700';
    if (s.includes('created')) return 'bg-indigo-100 text-indigo-700';
    if (s.includes('done') || s.includes('complete')) return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Improved date parsing for Google's weird timestamp strings
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    // Handle Date(2025,0,24,...)
    if (dateStr.includes('Date(')) {
      try {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
          // JS Date month is 0-indexed, which matches Google's export
          return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]),
            parseInt(parts[2]),
            parseInt(parts[3] || '0'),
            parseInt(parts[4] || '0'),
            parseInt(parts[5] || '0')
          );
        }
      } catch (e) {
        return new Date(0);
      }
    }
    return new Date(dateStr);
  };

  const sortedActivities = [...activities].sort((a, b) => {
    return parseDate(b.timestamp).getTime() - parseDate(a.timestamp).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col slide-in-from-right animate-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm">
              {task.taskId}
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Audit Trail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors border border-transparent hover:border-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase shadow-sm border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className="text-sm text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Channel: {task.channelName || task.channelId}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold bg-indigo-50/30 p-5 rounded-r-2xl border-y border-r border-indigo-100/50">
                {task.message}
              </p>
            </div>
          </div>

          {/* Life Cycle Visual */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              Task Lifecycle
            </h3>
            <StageTracker currentStatus={task.status} activities={activities} stages={stages} />
          </section>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="p-2.5 bg-white rounded-lg text-indigo-500 shadow-sm border border-slate-100">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{task.updatedBy ? 'Updated By' : 'Originator'}</p>
                <p className="text-sm font-bold text-slate-800">{task.updatedBy || task.createdBy || task.user}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="p-2.5 bg-white rounded-lg text-indigo-500 shadow-sm border border-slate-100">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log Date</p>
                <p className="text-sm font-bold text-slate-800">
                  {parseDate(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <History size={16} className="text-indigo-500" />
                History ({activities.length})
              </h3>
              <div className="h-px bg-slate-100 flex-1 ml-4"></div>
            </div>

            <div className="space-y-8">
              {sortedActivities.length > 0 ? sortedActivities.map((activity, idx) => (
                <div key={idx} className="relative pl-10 before:absolute before:left-4 before:top-4 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-xl bg-white border-2 border-indigo-500 shadow-sm z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{activity.actionType}</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                        {parseDate(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed mb-4">
                      {activity.action}
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {activity.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{activity.user}</span>
                      </div>
                      {activity.status && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Clock size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">No records found</p>
                  <p className="text-xs mt-1">Activity may still be pending sync.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
