
import React from 'react';
import { MoreHorizontal, Plus, User } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const COLUMNS = [
  { id: TaskStatus.NEW, label: 'Incoming', color: 'bg-blue-500' },
  { id: TaskStatus.TODO, label: 'To Do', color: 'bg-yellow-500' },
  { id: TaskStatus.PICKEDUP, label: 'Picked Up', color: 'bg-purple-500' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-orange-500' },
  { id: TaskStatus.DONE, label: 'Completed', color: 'bg-emerald-500' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
      <div className="flex gap-6 h-full min-w-max pr-8">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div key={column.id} className="w-80 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`}></div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{column.label}</h3>
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              <div className="bg-slate-100/60 rounded-2xl p-3 flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 scrollbar-thin border border-slate-200/50">
                {columnTasks.length > 0 ? columnTasks.map((task) => (
                  <div
                    key={task.taskId + task.messageTimestamp}
                    onClick={() => onTaskClick(task)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 transition-all cursor-pointer group flex-shrink-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                          {task.taskId}
                        </span>
                        {task.channelId && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[100px]">
                            {task.channelId}
                          </span>
                        )}
                      </div>
                      <button className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 font-medium line-clamp-4 mb-4 leading-relaxed h-[4.5em]">
                      {task.message}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-500 border border-indigo-100">
                          {task.user?.substring(0, 2).toUpperCase() || '?'}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[80px]">{task.user}</span>
                      </div>
                      {task.priority && (
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm ${task.priority.toLowerCase() === 'high'
                            ? 'text-rose-600 bg-rose-50 border border-rose-100'
                            : 'text-slate-400 bg-slate-50 border border-slate-100'
                          }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium text-center">Empty Stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
