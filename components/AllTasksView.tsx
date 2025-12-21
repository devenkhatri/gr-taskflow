
import React from 'react';
import { Check, MessageSquare, User as UserIcon } from 'lucide-react';
import { Task, TaskStatus, TaskActivity } from '../types';

interface AllTasksViewProps {
  tasks: Task[];
  activities: TaskActivity[];
  onTaskClick: (task: Task) => void;
}

const STAGES = [
  TaskStatus.NEW,
  TaskStatus.TODO,
  TaskStatus.PICKEDUP,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE
];

const AllTasksView: React.FC<AllTasksViewProps> = ({ tasks, activities, onTaskClick }) => {
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

  const channelNames = Object.keys(tasksByChannel).sort();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 sticky left-0 bg-slate-50 z-20">Task Info</th>
              {STAGES.map(stage => (
                <th key={stage} className="px-6 py-4 text-center min-w-[100px]">{stage}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {channelNames.map(channel => (
              <React.Fragment key={channel}>
                <tr className="bg-slate-50/50">
                  <td colSpan={STAGES.length + 1} className="px-6 py-3 font-bold text-xs text-slate-500 uppercase tracking-widest border-y border-slate-100">
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
                      <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-indigo-50/20 z-10 min-w-[300px] border-r border-slate-50">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-600 tracking-tighter text-xs">{task.taskId}</span>
                            <span className="text-[10px] text-slate-400 font-medium">• {task.user}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 line-clamp-1">{task.message}</p>
                        </div>
                      </td>
                      {STAGES.map((stage) => {
                        const hasPassed = reached.has(stage);
                        const isCurrent = task.status === stage;

                        return (
                          <td key={stage} className="px-6 py-5 text-center">
                            <div className="flex justify-center items-center">
                              {hasPassed ? (
                                <div className={`p-1.5 rounded-full transition-all duration-300 ${isCurrent
                                  ? 'bg-indigo-600 text-white shadow-md scale-110'
                                  : 'bg-emerald-100 text-emerald-600'
                                  }`}>
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
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
