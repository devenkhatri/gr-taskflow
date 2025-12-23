import React, { useMemo, useState } from 'react';
import { Bot, Search, Filter, Sparkles, CheckCircle, FileText, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Task, TaskActivity, TaskStatus } from '../types';

interface AICombinedViewProps {
    tasks: Task[];
    activities: TaskActivity[];
}

const AICombinedView: React.FC<AICombinedViewProps> = ({ tasks, activities }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'both' | 'factcheck' | 'titlegen' | 'missing'>('all');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const combinedData = useMemo(() => {
        return tasks.map(task => {
            // Find latest relevant activities for this task
            const taskActivities = activities.filter(a => a.taskId === task.taskId);

            // Sort by timestamp descending to get latest
            taskActivities.sort((a, b) => new Date(b.actionTs || 0).getTime() - new Date(a.actionTs || 0).getTime());

            const factCheck = taskActivities.find(a =>
                a.actionType === 'Fact Check Done' ||
                a.actionType.toLowerCase().includes('fact check')
            );

            const titleGen = taskActivities.find(a =>
                a.actionType === 'AI Title Generation Done' ||
                a.actionType === 'AI Title Generation'
            );

            return {
                ...task,
                factCheckContent: factCheck?.action,
                titleGenContent: titleGen?.action,
                hasFactCheck: !!factCheck,
                hasTitleGen: !!titleGen
            };
        }).filter(item => {
            // Filter out items that have NO AI activity at all, unless we want to show gaps?
            // User asked for "combines both... for the task", implies matrix view.
            // Let's keep all tasks but allow filtering.
            return true;
        });
    }, [tasks, activities]);

    const filteredData = useMemo(() => {
        return combinedData.filter(item => {
            const matchesSearch =
                item.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.message.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (filterType === 'all') return true;
            if (filterType === 'both') return item.hasFactCheck && item.hasTitleGen;
            if (filterType === 'factcheck') return item.hasFactCheck;
            if (filterType === 'titlegen') return item.hasTitleGen;
            if (filterType === 'missing') return !item.hasFactCheck || !item.hasTitleGen;

            return true;
        });
    }, [combinedData, searchTerm, filterType]);

    const toggleExpand = (taskId: string) => {
        setExpandedRow(expandedRow === taskId ? null : taskId);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header & Controls */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/30">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Bot size={22} className="text-indigo-500" />
                        AI Master View
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Consolidated Fact Checks & Titles</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Task ID or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 font-medium w-full sm:w-48"
                        >
                            <option value="all">All Tasks</option>
                            <option value="both">Completed Both</option>
                            <option value="factcheck">Has Fact Check</option>
                            <option value="titlegen">Has Title Gen</option>
                            <option value="missing">Missing AI Data</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">#</th>
                            <th className="px-6 py-4 w-32">Task ID</th>
                            <th className="px-6 py-4 w-1/3">Original Message</th>
                            <th className="px-6 py-4 w-1/4">AI Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((item) => (
                            <React.Fragment key={item.taskId}>
                                <tr
                                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedRow === item.taskId ? 'bg-indigo-50/20' : ''}`}
                                    onClick={() => toggleExpand(item.taskId)}
                                >
                                    <td className="px-6 py-4 text-center">
                                        {expandedRow === item.taskId ? <ChevronDown size={16} className="text-indigo-500" /> : <ChevronRight size={16} className="text-slate-400" />}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 whitespace-nowrap">
                                            {item.taskId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <p className="text-sm text-slate-700 font-medium line-clamp-2">{item.message}</p>
                                        <div className="flex gap-2 mt-2">
                                            {(() => {
                                                const s = item.status.toLowerCase();
                                                let style = 'bg-slate-50 text-slate-500 border-slate-100';
                                                if (s.includes('new') || s.includes('incoming')) style = 'bg-amber-100 text-amber-700 border-amber-200';
                                                else if (s.includes('todo')) style = 'bg-blue-100 text-blue-700 border-blue-200';
                                                else if (s.includes('pickup') || s.includes('picked')) style = 'bg-purple-100 text-purple-700 border-purple-200';
                                                else if (s.includes('progress')) style = 'bg-orange-100 text-orange-700 border-orange-200';
                                                else if (s.includes('created')) style = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                                                else if (s.includes('done') || s.includes('complete')) style = 'bg-emerald-100 text-emerald-700 border-emerald-200';

                                                return (
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${style}`}>
                                                        {item.status}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg border ${item.hasFactCheck
                                                ? (item.factCheckContent?.toLowerCase().includes('fake123')
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-teal-50 text-teal-700 border-teal-100')
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                <CheckCircle size={14} className={
                                                    item.hasFactCheck
                                                        ? (item.factCheckContent?.toLowerCase().includes('fake123') ? 'text-red-500' : 'text-teal-500')
                                                        : 'text-slate-300'
                                                } />
                                                Fact Check
                                                {!item.hasFactCheck && <span className="ml-auto text-slate-300 text-[10px] uppercase">Pending</span>}
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg border ${item.hasTitleGen ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                <Sparkles size={14} className={item.hasTitleGen ? 'text-violet-500' : 'text-slate-300'} />
                                                Title Gen
                                                {!item.hasTitleGen && <span className="ml-auto text-slate-300 text-[10px] uppercase">Pending</span>}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                {expandedRow === item.taskId && (
                                    <tr className="bg-slate-50/50">
                                        <td colSpan={5} className="px-6 py-6 ring-1 ring-slate-100 ring-inset">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Fact Check Output */}
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                                                        <CheckCircle size={16} className={
                                                            item.hasFactCheck && item.factCheckContent?.toLowerCase().includes('fake123')
                                                                ? "text-red-500"
                                                                : "text-teal-500"
                                                        } />
                                                        Fact Check Result
                                                    </h4>
                                                    {item.hasFactCheck ? (
                                                        <div className="prose prose-sm max-w-none text-slate-600 font-mono text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 h-64 overflow-y-auto custom-scrollbar">
                                                            <ReactMarkdown>{item.factCheckContent || ''}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                            <FileText size={24} className="opacity-20" />
                                                            <span className="text-xs font-medium">No Data Available</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Title Gen Output */}
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                                                        <Sparkles size={16} className="text-violet-500" />
                                                        Generated Titles
                                                    </h4>
                                                    {item.hasTitleGen ? (
                                                        <div className="prose prose-sm max-w-none text-slate-700 text-sm whitespace-pre-wrap bg-violet-50/10 p-3 rounded-lg border border-violet-100 h-64 overflow-y-auto custom-scrollbar">
                                                            <ReactMarkdown>{item.titleGenContent || ''}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                            <LayoutGrid size={24} className="opacity-20" />
                                                            <span className="text-xs font-medium">No Data Available</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                    No matching tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AICombinedView;
