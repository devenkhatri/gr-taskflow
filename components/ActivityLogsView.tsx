
import React, { useMemo } from 'react';
import { History, MessageSquare, User as UserIcon, Clock, ChevronRight, Activity, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Task, TaskStatus, TaskActivity } from '../types';

const formatStatus = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'created') return 'Completed';
  if (s === 'done') return 'Published';
  return status;
};

interface ActivityLogsViewProps {
  tasks: Task[];
  activities: TaskActivity[];
  sortOption: 'latest' | 'oldest' | 'priority' | 'taskid';
  onTaskClick: (task: Task) => void;
}

const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ tasks, activities, sortOption, onTaskClick }) => {
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('Date(')) {
      try {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
          return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]),
            parseInt(parts[2]),
            parseInt(parts[3] || '0'),
            parseInt(parts[4] || '0'),
            parseInt(parts[5] || '0')
          );
        }
      } catch (e) { return new Date(0); }
    }
    return new Date(dateStr);
  };
  const groupedActivities = useMemo(() => {
    const groups = new Map<string, { task?: Task; logs: TaskActivity[] }>();

    activities.forEach(log => {
      const key = log.taskId;
      if (!key) return; // Skip logs without taskId

      if (!groups.has(key)) {
        const task = tasks.find(t => t.taskId === key);
        groups.set(key, { task, logs: [] });
      }
      groups.get(key)!.logs.push(log);
    });

    return Array.from(groups.values())
      .map(group => ({
        ...group,
        logs: group.logs.sort((a, b) => {
          const tA = parseDate(a.timestamp).getTime();
          const tB = parseDate(b.timestamp).getTime();
          return sortOption === 'oldest' ? tA - tB : tB - tA;
        })
      }))
      .sort((a, b) => {
        const latestA = a.logs[0] ? parseDate(a.logs[0].timestamp).getTime() : 0;
        const latestB = b.logs[0] ? parseDate(b.logs[0].timestamp).getTime() : 0;

        if (sortOption === 'oldest') return latestA - latestB;
        if (sortOption === 'taskid') return (b.task?.taskId || '').localeCompare(a.task?.taskId || '');
        return latestB - latestA;
      });
  }, [tasks, activities, sortOption]);

  const getStatusColor = (status?: TaskStatus) => {
    const s = status?.toLowerCase() || ''; // Handle undefined status
    if (s.includes('new') || s.includes('incoming')) return 'text-amber-600 bg-amber-50';
    if (s.includes('todo')) return 'text-blue-600 bg-blue-50';
    if (s.includes('pickup') || s.includes('picked')) return 'text-purple-600 bg-purple-50';
    if (s.includes('progress')) return 'text-orange-600 bg-orange-50';
    if (s.includes('created') || s.includes('completed')) return 'text-indigo-600 bg-indigo-50';
    if (s.includes('done') || s.includes('complete') || s.includes('published')) return 'text-emerald-600 bg-emerald-50';
    if (s === 'legit') return 'text-teal-600 bg-teal-50 border-teal-100';
    if (s === 'fake') return 'text-red-600 bg-red-50 border-red-100';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="space-y-8 pb-12">
      {groupedActivities.map((group, gIdx) => (
        <div key={gIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Task Header */}
          <div
            className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => group.task && onTaskClick(group.task)}
          >
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[10px] shadow-sm uppercase">
                {group.task?.taskId || 'Unknown Task'}
              </div>
              {group.task?.messageUrl && (
                <a
                  href={group.task.messageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="View on Slack"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              {group.task?.channelName && (
                <div className="px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-bold text-[10px] uppercase hidden sm:block">
                  {group.task.channelName}
                </div>
              )}
              <p className="text-sm font-semibold text-slate-700 max-w-md truncate">
                {group.task?.message || 'Archived or deleted task content'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-400 group">
              <span className="text-[10px] font-bold uppercase tracking-widest">Details</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Activity List */}
          <div className="p-6 space-y-6">
            {group.logs.map((log, lIdx) => (
              <div key={lIdx} className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10">
                  <Activity size={12} className="text-indigo-500" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.actionType}</span>
                      {log.status && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase border border-current opacity-80 ${getStatusColor(log.status)}`}>
                          {formatStatus(log.status)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 font-medium leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{log.action}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                      <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                        {log.user?.substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{log.user}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">
                        {parseDate(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {groupedActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
          <History size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-bold">No Activity Logs Found</p>
          <p className="text-sm">Activities will appear here as tasks move through the pipeline.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsView;
