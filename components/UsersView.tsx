import React from 'react';
import { User, Mail, Shield } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
}

interface UsersViewProps {
    users: UserData[];
}

const UsersView: React.FC<UsersViewProps> = ({ users }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <User size={22} className="text-indigo-500" />
                    Team Members
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {users.length} Total
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-1/3">User ID</th>
                            <th className="px-6 py-4">User Name</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user, idx) => (
                            <tr key={user.id + idx} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {user.id}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">
                                            {user.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="text-indigo-500 hover:text-indigo-700 transition-colors">
                                        <Shield size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersView;
