
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { TaskStatus, TaskActivity } from '../types';

interface StageTrackerProps {
  currentStatus: TaskStatus;
  activities: TaskActivity[];
  stages: string[];
}

const StageTracker: React.FC<StageTrackerProps> = ({ currentStatus, activities, stages }) => {
  const STAGES = stages.map(s => ({ key: s, label: s }));
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
          const s = stage.key.toLowerCase();

          const getStageColorClass = () => {
            if (s.includes('new') || s.includes('incoming')) return isReached ? 'bg-amber-600' : 'bg-slate-100';
            if (s.includes('todo')) return isReached ? 'bg-blue-600' : 'bg-slate-100';
            if (s.includes('pickup') || s.includes('picked')) return isReached ? 'bg-purple-600' : 'bg-slate-100';
            if (s.includes('progress')) return isReached ? 'bg-orange-600' : 'bg-slate-100';
            if (s.includes('created')) return isReached ? 'bg-indigo-600' : 'bg-slate-100';
            if (s.includes('done') || s.includes('complete')) return isReached ? 'bg-emerald-600' : 'bg-slate-100';
            return isReached ? 'bg-indigo-600' : 'bg-slate-100';
          };

          const getStageTextColorClass = () => {
            if (s.includes('new') || s.includes('incoming')) return isReached ? 'text-amber-600' : 'text-slate-500';
            if (s.includes('todo')) return isReached ? 'text-blue-600' : 'text-slate-500';
            if (s.includes('pickup') || s.includes('picked')) return isReached ? 'text-purple-600' : 'text-slate-500';
            if (s.includes('progress')) return isReached ? 'text-orange-600' : 'text-slate-500';
            if (s.includes('created')) return isReached ? 'text-indigo-600' : 'text-slate-500';
            if (s.includes('done') || s.includes('complete')) return isReached ? 'text-emerald-600' : 'text-slate-500';
            return isReached ? 'text-indigo-600' : 'text-slate-500';
          };

          const getStageRingColorClass = () => {
            if (s.includes('new') || s.includes('incoming')) return 'ring-amber-100';
            if (s.includes('todo')) return 'ring-blue-100';
            if (s.includes('pickup') || s.includes('picked')) return 'ring-purple-100';
            if (s.includes('progress')) return 'ring-orange-100';
            if (s.includes('created')) return 'ring-indigo-100';
            if (s.includes('done') || s.includes('complete')) return 'ring-emerald-100';
            return 'ring-indigo-100';
          };

          return (
            <div key={stage.key} className="flex flex-col items-center z-10 bg-white px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getStageColorClass()} ${isReached ? 'text-white shadow-lg' : 'text-slate-400'} ${isCurrent ? `ring-4 ${getStageRingColorClass()}` : ''}`}
              >
                {isReached ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <span className={`mt-3 text-xs font-semibold whitespace-nowrap ${getStageTextColorClass()}`}>
                {stage.label}
              </span>
              {isCurrent && (
                <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${getStageRingColorClass().replace('ring-', 'bg-')} ${getStageTextColorClass().replace('text-', 'text-700').replace('600', '700')}`}>
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
