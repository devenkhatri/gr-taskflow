import React from 'react';
import { Task } from '../types';
import KanbanBoard from './KanbanBoard';

interface FilteredKanbanViewProps {
    tasks: Task[];
    stages: string[];
    onTaskClick: (task: Task) => void;
}

const FilteredKanbanView: React.FC<FilteredKanbanViewProps> = ({ tasks, stages, onTaskClick }) => {
    // Filter stages to only include "NEW", stages containing "picked", and "Completed" stages
    const filteredStages = stages.filter(stage => {
        const s = stage.toLowerCase();
        return s === 'new' || s.includes('picked') || s.includes('pickup') || s.includes('completed') || s === 'created' || s.includes('done') || s.includes('published');
    });

    return (
        <div className="h-full overflow-hidden">
            <KanbanBoard tasks={tasks} stages={filteredStages} onTaskClick={onTaskClick} />
        </div>
    );
};

export default FilteredKanbanView;
