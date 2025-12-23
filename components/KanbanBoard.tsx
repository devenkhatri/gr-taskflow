import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  stages: string[];
  onTaskClick: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, stages, onTaskClick }) => {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && stages.length > 0) {
      const cancelledStage = stages.find(s => s.toLowerCase().includes('cancelled'));
      if (cancelledStage) {
        setCollapsedColumns(new Set([cancelledStage]));
      }
      setIsInitialized(true);
    }
  }, [stages, isInitialized]);

  const getStageColor = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return 'bg-amber-500';
    if (s.includes('todo')) return 'bg-blue-500';
    if (s.includes('pickup') || s.includes('picked')) return 'bg-purple-500';
    if (s.includes('progress')) return 'bg-orange-500';
    if (s.includes('created')) return 'bg-indigo-500';
    if (s.includes('done') || s.includes('complete')) return 'bg-emerald-500';
    return 'bg-slate-400';
  };

  const columns = stages.map(stage => ({
    id: stage,
    label: stage,
    color: getStageColor(stage)
  }));

  const toggleColumn = (columnId: string) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId);
    } else {
      newCollapsed.add(columnId);
    }
    setCollapsedColumns(newCollapsed);
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
      <div className="flex gap-4 h-full min-w-max pr-8 px-2">
        {columns.map((column) => {
          const isCollapsed = collapsedColumns.has(column.id);
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-80'}`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between mb-4 px-1 flex-shrink-0 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
                <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm flex-shrink-0`}></div>
                  {!isCollapsed ? (
                    <>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{column.label}</h3>
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </>
                  ) : (
                    <div className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </div>
                  )}
                </div>

                <div className={`flex items-center ${isCollapsed ? 'flex-col' : 'gap-1'}`}>
                  {!isCollapsed && (
                    <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                      <Plus size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleColumn(column.id)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors bg-white/50 border border-slate-200 shadow-sm"
                    title={isCollapsed ? "Expand Column" : "Collapse Column"}
                  >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                </div>
              </div>

              {/* Column Content */}
              <div className={`bg-slate-100/60 rounded-2xl flex-1 flex flex-col gap-3 min-h-0 border border-slate-200/50 transition-all duration-300 ${isCollapsed ? 'items-center py-4 w-12' : 'p-3 overflow-y-auto w-80'}`}>
                {isCollapsed ? (
                  <div className="h-full flex items-center justify-center">
                    <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest vertical-text transform -rotate-180 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                      {column.label}
                    </h3>
                  </div>
                ) : (
                  <>
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
                            {task.channelName && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[100px]">
                                {task.channelName}
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
                  </>
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
