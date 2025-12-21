
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Search, Filter, Plus, Clock, AlertCircle, CheckCircle2, 
  Timer, MoreVertical, ExternalLink 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TaskDetail from './components/TaskDetail';
import { TASKS, ACTIVITIES } from './data';
import { Task, TaskStatus } from './types';

const COLORS = ['#4f46e5', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981'];

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return TASKS.filter(task => 
      task.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const stats = useMemo(() => ({
    total: TASKS.length,
    todo: TASKS.filter(t => t.status === TaskStatus.TODO).length,
    new: TASKS.filter(t => t.status === TaskStatus.NEW).length,
    pickedUp: TASKS.filter(t => t.status === TaskStatus.PICKEDUP).length,
    done: TASKS.filter(t => t.status === TaskStatus.DONE).length,
  }), []);

  const chartData = [
    { name: 'New', value: stats.new },
    { name: 'ToDo', value: stats.todo },
    { name: 'PickedUp', value: stats.pickedUp },
    { name: 'Done', value: stats.done },
  ];

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NEW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case TaskStatus.TODO: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case TaskStatus.PICKEDUP: return 'bg-purple-100 text-purple-700 border-purple-200';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time task tracking & activity monitoring system</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <Clock size={18} />
              Export Logs
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold">
              <Plus size={20} />
              New Task
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Tasks" 
            value={stats.total} 
            icon={<AlertCircle size={24} className="text-indigo-600" />} 
            color="bg-indigo-50"
            trend="+12% from yesterday"
          />
          <StatCard 
            title="Awaiting Action" 
            value={stats.new} 
            icon={<Timer size={24} className="text-blue-600" />} 
            color="bg-blue-50"
          />
          <StatCard 
            title="In Progress" 
            value={stats.pickedUp} 
            icon={<MoreVertical size={24} className="text-purple-600" />} 
            color="bg-purple-50"
          />
          <StatCard 
            title="Completed" 
            value={stats.done} 
            icon={<CheckCircle2 size={24} className="text-green-600" />} 
            color="bg-green-50"
            trend="100% success rate"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart size={20} className="text-indigo-500" />
              Status Distribution
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              Efficiency
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task List Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Task Inventory</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search ID, Message, User..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Task ID</th>
                  <th className="px-6 py-4">Content Message</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                  <tr 
                    key={task.taskId} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-6 py-5">
                      <span className="font-bold text-indigo-600">{task.taskId}</span>
                    </td>
                    <td className="px-6 py-5 max-w-xs truncate font-medium text-slate-700">
                      {task.message}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {task.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-600">{task.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 italic max-w-xs truncate">
                      {task.lastAction}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-300 group-hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                      No tasks found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over Detail View */}
      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          activities={ACTIVITIES.filter(a => a.actionTs === selectedTask.messageTimestamp)}
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

export default App;
