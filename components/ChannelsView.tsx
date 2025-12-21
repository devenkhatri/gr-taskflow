import React from 'react';
import { Hash, ExternalLink, Check, X } from 'lucide-react';

interface ChannelsViewProps {
    channels: {
        id: string;
        name: string;
        purpose: string;
        taskEnabled: string;
        factCheckEnabled: string;
        aiEnabled: string;
    }[];
}

const BooleanBadge = ({ value }: { value: string }) => {
    const isTrue = ['true', 'yes', 'enabled', '1'].includes(value.toLowerCase());
    return isTrue ? (
        <div className="flex justify-center">
            <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                <Check size={14} strokeWidth={3} />
            </div>
        </div>
    ) : (
        <div className="flex justify-center">
            <div className="bg-slate-100 text-slate-400 p-1 rounded-full">
                <X size={14} strokeWidth={3} />
            </div>
        </div>
    );
};

const ChannelsView: React.FC<ChannelsViewProps> = ({ channels }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Hash size={22} className="text-indigo-500" />
                    Active Channels
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {channels.length} Total
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-4">Channel ID</th>
                            <th className="px-4 py-4">Channel Name</th>
                            <th className="px-4 py-4 w-1/4">Purpose</th>
                            <th className="px-4 py-4 text-center">Tasks</th>
                            <th className="px-4 py-4 text-center">FactCheck</th>
                            <th className="px-4 py-4 text-center">Title Generation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {channels.map((channel, idx) => (
                            <tr key={channel.id + idx} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="px-4 py-5">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                                        {channel.id}
                                    </span>
                                </td>
                                <td className="px-4 py-5">
                                    <span className="text-sm font-bold text-slate-700">
                                        {channel.name}
                                    </span>
                                </td>
                                <td className="px-4 py-5">
                                    <p className="text-xs text-slate-600 font-medium line-clamp-2" title={channel.purpose}>
                                        {channel.purpose || '-'}
                                    </p>
                                </td>
                                <td className="px-4 py-5">
                                    <BooleanBadge value={channel.taskEnabled} />
                                </td>
                                <td className="px-4 py-5">
                                    <BooleanBadge value={channel.factCheckEnabled} />
                                </td>
                                <td className="px-4 py-5">
                                    <BooleanBadge value={channel.aiEnabled} />
                                </td>
                            </tr>
                        ))}
                        {channels.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                    No active channels found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChannelsView;
