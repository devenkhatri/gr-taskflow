
import React from 'react';
import { Check, MessageSquare, User as UserIcon } from 'lucide-react';
import { Task, TaskStatus, TaskActivity } from '../types';

interface AllTasksViewProps {
  tasks: Task[];
  activities: TaskActivity[];
  stages: string[];
  sortOption: 'latest' | 'oldest' | 'priority' | 'taskid';
  onTaskClick: (task: Task) => void;
}

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
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const AllTasksView: React.FC<AllTasksViewProps> = ({ tasks, activities, stages, sortOption, onTaskClick }) => {
  const getTaskReachedStatuses = (task: Task) => {
    const taskLogs = activities.filter(a => a.taskId === task.taskId);

    const reached = new Set<TaskStatus>();
    // Add from logs
    taskLogs.forEach(log => {
      if (log.status) reached.add(log.status);
    });
    // Add current status
    reached.add(task.status);

    // Heuristic: If it's DONE, it likely passed through everything before it
    // But we only show what's recorded or currently active
    return reached;
  };

  // Group tasks by channel
  const tasksByChannel = React.useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const channel = task.channelName || 'Uncategorized';
      if (!groups[channel]) groups[channel] = [];
      groups[channel].push(task);
    });
    return groups;
  }, [tasks]);

  const channelNames = React.useMemo(() => {
    return Object.keys(tasksByChannel).sort((a, b) => {
      const latestA = tasksByChannel[a][0] ? parseDate(tasksByChannel[a][0].messageTimestamp).getTime() : 0;
      const latestB = tasksByChannel[b][0] ? parseDate(tasksByChannel[b][0].messageTimestamp).getTime() : 0;

      if (sortOption === 'oldest') return latestA - latestB;
      if (sortOption === 'taskid') return b.localeCompare(a); // Channel name sort
      return latestB - latestA;
    });
  }, [tasksByChannel, sortOption]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0 md:min-w-full">
          <thead>
            <tr className="text-slate-500 uppercase text-[8px] md:text-[10px] font-bold tracking-widest">
              <th className="px-2 md:px-6 py-3 md:py-4 sticky left-0 top-0 bg-slate-50 z-40 border-b border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[100px] md:min-w-[300px]">
                Task Info
              </th>
              {stages.map(stage => (
                <th key={stage} className="px-1 md:px-6 py-3 md:py-4 text-center sticky top-0 bg-slate-50 z-30 border-b border-slate-100 min-w-[45px] md:min-w-[110px]">
                  <span className="md:hidden">{stage.substring(0, 4)}</span>
                  <span className="hidden md:inline">{stage}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {channelNames.map(channel => (
              <React.Fragment key={channel}>
                <tr className="bg-slate-50/50">
                  <td colSpan={stages.length + 1} className="px-4 md:px-6 py-2 md:py-3 font-bold text-[9px] md:text-xs text-slate-500 uppercase tracking-widest border-y border-slate-100 sticky left-0 z-10 bg-slate-50/50 backdrop-blur-sm">
                    {channel}
                  </td>
                </tr>
                {tasksByChannel[channel].map((task) => {
                  const reached = getTaskReachedStatuses(task);
                  return (
                    <tr
                      key={task.taskId + task.messageTimestamp}
                      className="hover:bg-indigo-50/20 transition-colors cursor-pointer group"
                      onClick={() => onTaskClick(task)}
                    >
                      <td className="px-2 md:px-6 py-2 md:py-5 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-20 min-w-[100px] md:min-w-[300px] border-r border-b border-slate-100 shadow-[4px_0_8px_rgba(0,0,0,0.03)]">
                        <div className="flex flex-col gap-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-indigo-600 tracking-tighter text-[9px] md:text-xs">{task.taskId}</span>
                            <span className="text-[8px] md:text-[10px] text-slate-400 font-medium truncate">• {task.user}</span>
                          </div>
                          <p className="text-[10px] md:text-sm font-medium text-slate-700 line-clamp-1">
                            <span className="md:hidden">
                              {task.message.length > 20 ? task.message.substring(0, 20) + '...' : task.message}
                            </span>
                            <span className="hidden md:inline">{task.message}</span>
                          </p>
                        </div>
                      </td>
                      {stages.map((stage) => {
                        const hasPassed = reached.has(stage);
                        const isCurrent = task.status === stage;

                        return (
                          <td key={stage} className="px-1 md:px-6 py-2 md:py-5 text-center border-b border-slate-50">
                            <div className="flex justify-center items-center">
                              {hasPassed ? (
                                <div className={`p-0.5 md:p-1.5 rounded-full transition-all duration-300 ${isCurrent
                                  ? (stage.toLowerCase().includes('new') || stage.toLowerCase().includes('incoming') ? 'bg-amber-600 text-white' :
                                    stage.toLowerCase().includes('todo') ? 'bg-blue-600 text-white' :
                                      stage.toLowerCase().includes('pickup') || stage.toLowerCase().includes('picked') ? 'bg-purple-600 text-white' :
                                        stage.toLowerCase().includes('progress') ? 'bg-orange-600 text-white' :
                                          stage.toLowerCase().includes('created') ? 'bg-indigo-600 text-white' :
                                            stage.toLowerCase().includes('done') || stage.toLowerCase().includes('complete') ? 'bg-emerald-600 text-white' :
                                              'bg-slate-600 text-white')
                                  : 'bg-emerald-100 text-emerald-600'
                                  } shadow-md ${isCurrent ? 'scale-105 md:scale-110' : ''}`}>
                                  <Check size={10} className="md:w-3.5 md:h-3.5" strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-slate-100"></div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">
            No tasks found in the registry.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTasksView;
