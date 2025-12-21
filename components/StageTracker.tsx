
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { TaskStatus, TaskActivity } from '../types';

interface StageTrackerProps {
  currentStatus: TaskStatus;
  activities: TaskActivity[];
}

const STAGES = [
  { key: TaskStatus.NEW, label: 'Task Created' },
  { key: TaskStatus.TODO, label: 'Todo' },
  { key: TaskStatus.PICKEDUP, label: 'Picked Up' },
  { key: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { key: TaskStatus.DONE, label: 'Done' }
];

const StageTracker: React.FC<StageTrackerProps> = ({ currentStatus, activities }) => {
  // Find which stages have actually been reached based on logs
  const reachedStatuses = new Set(
    activities
      .filter(a => a.status)
      .map(a => a.status as TaskStatus)
  );
  
  // Also include the current status explicitly
  reachedStatuses.add(currentStatus);

  return (
    <div className="py-8 px-4 w-full">
      <div className="relative flex items-center justify-between">
        {/* Progress Line Background */}
        <div className="absolute left-0 right-0 h-0.5 bg-slate-200 top-1/2 -translate-y-1/2 z-0 mx-8"></div>
        
        {STAGES.map((stage, idx) => {
          const isReached = reachedStatuses.has(stage.key);
          const isCurrent = stage.key === currentStatus;
          
          return (
            <div key={stage.key} className="flex flex-col items-center z-10 bg-white px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isReached 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
              >
                {isReached ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <span className={`mt-3 text-xs font-semibold whitespace-nowrap ${
                isReached ? 'text-indigo-600' : 'text-slate-500'
              }`}>
                {stage.label}
              </span>
              {isCurrent && (
                <span className="mt-1 text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase tracking-tighter">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageTracker;
