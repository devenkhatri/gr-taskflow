import React, { useMemo } from 'react';
import { Bot, CheckCircle, Clock, FileText, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TaskActivity } from '../types';

interface AIFactChecksViewProps {
    activities: TaskActivity[];
    tasks: import('../types').Task[];
}

const AIFactChecksView: React.FC<AIFactChecksViewProps> = ({ activities, tasks }) => {
    const factChecks = useMemo(() => {
        return activities.filter(a => a.actionType === 'Fact Check Done' || a.actionType.toLowerCase().includes('fact check'));
    }, [activities]);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle size={22} className="text-emerald-500" />
                    AI Fact Checks
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {factChecks.length} Records
                </span>
            </div>
            <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 w-32">Task ID</th>
                            <th className="px-6 py-4">Fact Check Result</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {factChecks.map((log, idx) => {
                            const task = tasks.find(t => t.taskId === log.taskId);
                            const highlightKeyword = import.meta.env.VITE_HIGHLIGHT_KEYWORD;
                            const isHighlighted = highlightKeyword && task && task.message && task.message.toLowerCase().includes(highlightKeyword.toLowerCase());

                            return (
                                <tr key={idx} className={`transition-colors align-top ${isHighlighted
                                        ? 'bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400'
                                        : 'hover:bg-slate-50/50'
                                    }`}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                                            {log.taskId || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            {log.status && (
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${log.status === 'Legit'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-bold">• {log.user}</span>
                                        </div>
                                        <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-mono">
                                            <ReactMarkdown>{log.action}</ReactMarkdown>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {factChecks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                    No AI Fact Checks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AIFactChecksView;
