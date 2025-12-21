
import React from 'react';
import { X, Calendar, User, Hash, MessageSquare, History } from 'lucide-react';
import { Task, TaskActivity, TaskStatus } from '../types';
import StageTracker from './StageTracker';

interface TaskDetailProps {
  task: Task;
  activities: TaskActivity[];
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, activities, onClose }) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NEW: return 'bg-blue-100 text-blue-700';
      case TaskStatus.TODO: return 'bg-yellow-100 text-yellow-700';
      case TaskStatus.PICKEDUP: return 'bg-purple-100 text-purple-700';
      case TaskStatus.IN_PROGRESS: return 'bg-orange-100 text-orange-700';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col slide-in-from-right animate-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm">
              {task.taskId}
            </span>
            <h2 className="text-xl font-bold text-slate-800">Task Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm font-medium text-slate-500">Channel: {task.channelId}</span>
            </div>
            
            <p className="text-lg text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-500">
              {task.message}
            </p>
          </div>

          {/* Life Cycle Visual */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              Task Stage Progress
            </h3>
            <StageTracker currentStatus={task.status} activities={activities} />
          </section>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Requester</p>
                <p className="text-sm font-semibold text-slate-800">{task.createdBy}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Created On</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
              <History size={18} className="text-indigo-500" />
              Activity History ({activities.length})
            </h3>
            <div className="space-y-6">
              {activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, idx) => (
                <div key={idx} className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-500 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-indigo-600">{activity.actionType}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {activity.action}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {activity.user.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{activity.user}</span>
                      {activity.status && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
