
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Search, Filter, Plus, Clock, AlertCircle, CheckCircle2, 
  Timer, MoreVertical, ExternalLink, Loader2, RefreshCw, LayoutGrid, List, BarChart
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TaskDetail from './components/TaskDetail';
import KanbanBoard from './components/KanbanBoard';
import AllTasksView from './components/AllTasksView';
import ActivityLogsView from './components/ActivityLogsView';
import { Task, TaskStatus, TaskActivity } from './types';

const COLORS = ['#4f46e5', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981'];
const SHEET_ID = '1lPpH7ZRofix3JCRN1zQyXeypvttFQ-DMkeYfy-FaB8Y';

const normalizeTs = (ts: any): string => {
  if (!ts) return '';
  const s = String(ts).trim();
  return s.replace(/\s+/g, '');
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban' | 'tasks' | 'logs'>('dashboard');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchSheet = async (sheetName: string) => {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        const jsonStr = text.substring(startIdx, endIdx + 1);
        const jsonData = JSON.parse(jsonStr);
        return jsonData.table.rows;
      };

      // Fetching from specifically named sheets as per requirement
      // Sheet 1 is usually 'Sheet1' or 'Tasks', Sheet 2 is 'Tasks Activity Log'
      const [taskRows, logRows] = await Promise.all([
        fetchSheet('Sheet1'),
        fetchSheet('Tasks Activity Log')
      ]);

      const mappedTasks: Task[] = taskRows
        .map((row: any) => {
          const c = row.c;
          if (!c || !c[0]) return null;
          if (c[0]?.v === 'Task ID' || c[0]?.v === 'TaskID') return null;
          
          return {
            taskId: String(c[0]?.v || ''),
            channelId: String(c[1]?.v || ''),
            message: String(c[2]?.v || ''),
            messageTimestamp: String(c[3]?.v || ''),
            user: String(c[4]?.v || ''),
            status: (c[5]?.v as TaskStatus) || TaskStatus.NEW,
            priority: String(c[6]?.v || 'Normal'),
            createdAt: String(c[7]?.v || ''),
            createdBy: String(c[8]?.v || ''),
            lastAction: String(c[9]?.v || '')
          };
        })
        .filter((t): t is Task => t !== null && !!t.taskId);

      const mappedLogs: TaskActivity[] = logRows
        .map((row: any) => {
          const c = row.c;
          if (!c || !c[0]) return null;
          if (c[0]?.v === 'Action Type' || c[0]?.v === 'ActionType') return null;
          
          return {
            taskId: '',
            actionType: String(c[0]?.v || ''),
            action: String(c[1]?.v || ''),
            actionTs: String(c[2]?.v || ''),
            user: String(c[3]?.v || ''),
            timestamp: String(c[4]?.v || ''),
            status: (c[5]?.v as TaskStatus) || undefined,
            priority: c[6]?.v ? String(c[6].v) : undefined,
          };
        })
        .filter((l): l is TaskActivity => l !== null && !!l.actionTs);

      setTasks(mappedTasks);
      setActivities(mappedLogs);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Data sync failed. Ensure your Google Sheet has 'Sheet1' and 'Tasks Activity Log' and is shared correctly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.user?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tasks]);

  const taskActivities = useMemo(() => {
    if (!selectedTask) return [];
    const targetLink = normalizeTs(selectedTask.messageTimestamp);
    return activities.filter(a => normalizeTs(a.actionTs) === targetLink);
  }, [selectedTask, activities]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    new: tasks.filter(t => t.status === TaskStatus.NEW).length,
    pickedUp: tasks.filter(t => t.status === TaskStatus.PICKEDUP).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
  }), [tasks]);

  const chartData = [
    { name: 'Incoming', value: stats.new },
    { name: 'ToDo', value: stats.todo },
    { name: 'PickedUp', value: stats.pickedUp },
    { name: 'Done', value: stats.done },
  ];

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NEW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case TaskStatus.TODO: return 'bg-yellow-100 text-yellow-700 border-blue-200';
      case TaskStatus.PICKEDUP: return 'bg-purple-100 text-purple-700 border-purple-200';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <div className="h-full overflow-hidden">
             <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} />
          </div>
        );
      case 'tasks':
        return (
          <AllTasksView 
            tasks={filteredTasks} 
            activities={activities} 
            onTaskClick={setSelectedTask} 
          />
        );
      case 'logs':
        return (
          <ActivityLogsView 
            tasks={filteredTasks} 
            activities={activities} 
            onTaskClick={setSelectedTask} 
          />
        );
      case 'dashboard':
      default:
        return (
          <div className="pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Tasks" 
                value={stats.total} 
                icon={<AlertCircle size={24} className="text-indigo-600" />} 
                color="bg-indigo-50"
              />
              <StatCard 
                title="Incoming" 
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
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
                  <BarChart size={20} className="text-indigo-500" />
                  Current Load
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      />
                      <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Summary
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <List size={22} className="text-indigo-500" />
                  Registry Overview
                </h3>
                <button 
                  onClick={() => setViewMode('tasks')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                >
                  View Matrix →
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Task Details</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.slice(0, 5).map((task) => (
                      <tr 
                        key={task.taskId + task.messageTimestamp} 
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="px-6 py-5 font-bold text-indigo-600 text-xs">{task.taskId}</td>
                        <td className="px-6 py-5 max-w-xs truncate text-sm text-slate-700">{task.message}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${getStatusStyle(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar currentView={viewMode as any} onViewChange={setViewMode as any} />
      
      <main className="flex-1 h-full overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md py-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {viewMode === 'dashboard' ? 'Analytics Overview' : 
               viewMode === 'kanban' ? 'Kanban Board' : 
               viewMode === 'tasks' ? 'Task Status Matrix' : 'Audit Logs & Activities'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 text-sm">Real-time Task Tracking</p>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <BarChart size={16} />
                Analytics
              </button>
              <button 
                onClick={() => setViewMode('tasks')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List size={16} />
                Matrix
              </button>
              <button 
                onClick={() => setViewMode('logs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Clock size={16} />
                Logs
              </button>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search across your workspace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse text-lg">Syncing with Google Sheets...</p>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          activities={taskActivities}
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

export default App;
