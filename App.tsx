
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Search, Filter, Plus, Clock, AlertCircle, CheckCircle2,
  Timer, MoreVertical, ExternalLink, Loader2, RefreshCw, LayoutGrid, List, BarChart, Menu, Columns3, Calendar, XCircle, CheckCircle, Sparkles, ArrowUpDown
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TaskDetail from './components/TaskDetail';
import KanbanBoard from './components/KanbanBoard';
import AllTasksView from './components/AllTasksView';
import ActivityLogsView from './components/ActivityLogsView';
import ChannelsView from './components/ChannelsView';
import UsersView from './components/UsersView';
import AIFactChecksView from './components/AIFactChecksView';
import AITitleGenerationsView from './components/AITitleGenerationsView';
import AICombinedView from './components/AICombinedView';
import LoginScreen from './components/LoginScreen';
import { Task, TaskStatus, TaskActivity } from './types';

const COLORS = ['#4f46e5', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981'];
const SHEET_ID = '1lPpH7ZRofix3JCRN1zQyXeypvttFQ-DMkeYfy-FaB8Y';

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  if (dateStr.includes('Date(')) {
    try {
      const parts = dateStr.match(/\d+/g);
      if (parts && parts.length >= 3) {
        return new Date(
          parseInt(parts[0]),
          parseInt(parts[1]),
          parseInt(parts[2]),
          parseInt(parts[3] || '0'),
          parseInt(parts[4] || '0'),
          parseInt(parts[5] || '0')
        );
      }
    } catch (e) { return new Date(0); }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban' | 'tasks' | 'logs' | 'channels' | 'users' | 'fact-checks' | 'title-generations' | 'ai-combined'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [channelList, setChannelList] = useState<{ id: string; name: string; purpose: string; taskEnabled: string; factCheckEnabled: string; aiEnabled: string }[]>([]);
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);
  const [dynamicStages, setDynamicStages] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'priority' | 'taskid'>('taskid');

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
      const [taskRows, logRows, channelRows, userRows, stageRows] = await Promise.all([
        fetchSheet('Sheet1'),
        fetchSheet('Tasks Activity Log'),
        fetchSheet('Active Channels'),
        fetchSheet('Users'),
        fetchSheet('Emoji → Action Mapping')
      ]);

      // Process Stages
      const stagesSet = new Set<string>();
      stagesSet.add('NEW'); // Always include NEW as the first stage
      if (stageRows && stageRows.length > 0) {
        // Meaning is in Column C (index 2)
        stageRows.forEach((row: any) => {
          if (!row.c || !row.c[2]) return;
          const meaning = String(row.c[2].v || '').trim();
          if (meaning && meaning !== 'Meaning') {
            stagesSet.add(meaning);
          }
        });
      }
      const stagesList = Array.from(stagesSet);
      setDynamicStages(stagesList);

      const channelMap = new Map<string, string>();
      // ... (rest of the processing remains similar but using stagesList if needed)
      const userListTemp: { id: string; name: string }[] = [];
      const channelListTemp: { id: string; name: string; purpose: string; taskEnabled: string; factCheckEnabled: string; aiEnabled: string }[] = [];
      if (channelRows && channelRows.length > 0) {
        // Find header row with robust matching
        const headerRow = channelRows.find((r: any) => r.c && r.c.some((c: any) => {
          const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return v === 'channelid' || v === 'id';
        }));

        let idIdx = 0;
        let nameIdx = 1;
        let purposeIdx = 2;
        let taskEnabledIdx = 3;
        let factCheckEnabledIdx = 4;
        let aiEnabledIdx = 5;

        if (headerRow) {
          const getI = (patterns: string[]) => headerRow.c.findIndex((c: any) => {
            const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return patterns.includes(v);
          });

          const newId = getI(['channelid', 'id', 'Channel ID']);
          const newName = getI(['channelname', 'name', 'channel', 'Channel Name']);
          const newPurpose = getI(['purpose', 'description', 'Purpose']);
          const newTask = getI(['taskmanagementenabled', 'taskenabled', 'task', 'Task Management Enabled?']);
          const newFactCheck = getI(['articlefactcheckenabled', 'factcheckenabled', 'factcheck', 'Article FactCheck Enabled?']);
          const newAI = getI(['aiarticleenabled', 'aienabled', 'ai', 'AI Article Enabled?']);

          if (newId !== -1) idIdx = newId;
          if (newName !== -1) nameIdx = newName;
          if (newPurpose !== -1) purposeIdx = newPurpose;
          if (newTask !== -1) taskEnabledIdx = newTask;
          if (newFactCheck !== -1) factCheckEnabledIdx = newFactCheck;
          if (newAI !== -1) aiEnabledIdx = newAI;
        }

        channelRows.forEach((row: any) => {
          if (!row.c) return;
          const id = String(row.c[idIdx]?.v || '').trim();
          const name = String(row.c[nameIdx]?.v || '').trim();
          const purpose = String(row.c[purposeIdx]?.v || '').trim();
          const taskEnabled = String(row.c[taskEnabledIdx]?.v || '').trim();
          const factCheckEnabled = String(row.c[factCheckEnabledIdx]?.v || '').trim();
          const aiEnabled = String(row.c[aiEnabledIdx]?.v || '').trim();

          // Avoid adding the header row itself to the map if it was matched by index but not filtered out
          const isHeader = (val: string) => {
            const v = val.toLowerCase().replace(/[^a-z0-9]/g, '');
            return v === 'channelid' || v === 'id' || v === 'channelname' || v === 'name';
          };

          if (id && name && !isHeader(id)) {
            channelMap.set(id, name);
            channelListTemp.push({
              id,
              name,
              purpose,
              taskEnabled,
              factCheckEnabled,
              aiEnabled
            });
          }
        });
      }
      // Process User List
      if (userRows && userRows.length > 0) {
        // Assume ID, Name columns
        const headerRow = userRows.find((r: any) => r.c && r.c.some((c: any) => {
          const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return v === 'userid' || v === 'id';
        }));

        let idIdx = 0;
        let nameIdx = 1;

        if (headerRow) {
          const getI = (patterns: string[]) => headerRow.c.findIndex((c: any) => {
            const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return patterns.includes(v);
          });

          const newId = getI(['userid', 'id', 'User ID']);
          const newName = getI(['username', 'name', 'User Name']);

          if (newId !== -1) idIdx = newId;
          if (newName !== -1) nameIdx = newName;
        }

        userRows.forEach((row: any) => {
          if (!row.c) return;
          const id = String(row.c[idIdx]?.v || '').trim();
          const name = String(row.c[nameIdx]?.v || '').trim();

          const isHeader = (val: string) => {
            const v = val.toLowerCase().replace(/[^a-z0-9]/g, '');
            return v === 'userid' || v === 'id' || v === 'username' || v === 'name';
          };

          if (id && name && !isHeader(id)) {
            userListTemp.push({ id, name });
          }
        });
      }
      const mappedTasks: Task[] = taskRows
        .map((row: any) => {
          const c = row.c;
          if (!c || !c[0]) return null;
          if (c[0]?.v === 'Task ID' || c[0]?.v === 'TaskID') return null;

          const rawChannelId = String(c[1]?.v || '').trim();

          return {
            taskId: String(c[0]?.v || ''),
            channelId: rawChannelId,
            message: String(c[2]?.v || ''),
            messageTimestamp: String(c[3]?.v || ''),
            user: String(c[4]?.v || ''),
            status: String(c[5]?.v || 'NEW'),
            priority: String(c[6]?.v || 'Normal'),
            createdAt: String(c[7]?.v || ''),
            createdBy: String(c[8]?.v || ''),
            lastAction: String(c[9]?.v || ''),
            channelName: channelMap.get(rawChannelId) || rawChannelId
          };
        })
        .filter((t): t is Task => t !== null && !!t.taskId);

      // Create a map of Message Timestamp -> Task ID for backfilling missing IDs in logs
      const timestampToTaskIdMap = new Map<string, string>();
      mappedTasks.forEach(t => {
        if (t.messageTimestamp && t.taskId) {
          timestampToTaskIdMap.set(t.messageTimestamp, t.taskId);
        }
      });

      const mappedLogs: TaskActivity[] = (() => {
        // Find header row to determine indices
        const headerRow = logRows.find((r: any) => r.c && r.c.some((c: any) => c?.v === 'Action Type' || c?.v === 'ActionType'));

        // Default indices based on previous known structure
        let iMap = {
          taskId: -1,
          actionType: 0,
          action: 1,
          actionTs: 2,
          user: 3,
          timestamp: 4,
          status: 5,
          priority: 6
        };

        if (headerRow) {
          const getI = (name: string) => headerRow.c.findIndex((c: any) => String(c?.v || '').toLowerCase().replace(/\s/g, '') === name);
          const newMap = {
            taskId: getI('taskid'),
            actionType: getI('actiontype'),
            action: getI('action'),
            actionTs: getI('actiontimestamp') === -1 ? getI('actionts') : getI('actiontimestamp'),
            user: getI('user'),
            timestamp: getI('timestamp'),
            status: getI('status'),
            priority: getI('priority')
          };

          if (newMap.actionType !== -1) {
            iMap = newMap;
          }
        }

        return logRows.map((row: any) => {
          const c = row.c;
          if (!c) return null;
          // Skip header row
          const atVal = c[iMap.actionType]?.v;
          if (atVal === 'Action Type' || atVal === 'ActionType') return null;

          let taskId = String(c[iMap.taskId]?.v || '');
          const actionTs = String(c[iMap.actionTs]?.v || '');

          // Fallback: Try to find Task ID via timestamp if missing
          if (!taskId && actionTs) {
            const foundId = timestampToTaskIdMap.get(actionTs);
            if (foundId) {
              taskId = foundId;
            }
          }

          return {
            taskId,
            actionType: String(c[iMap.actionType]?.v || ''),
            action: String(c[iMap.action]?.v || ''),
            actionTs,
            user: String(c[iMap.user]?.v || ''),
            timestamp: String(c[iMap.timestamp]?.v || ''),
            status: (c[iMap.status]?.v as TaskStatus) || undefined,
            priority: c[iMap.priority]?.v ? String(c[iMap.priority]?.v) : undefined,
          };
        }).filter((l: any) => l !== null && !!l.actionTs);
      })();

      setTasks(mappedTasks);
      setActivities(mappedLogs);
      setChannelList(channelListTemp);
      setUserList(userListTemp);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Data sync failed. Ensure your Google Sheet has 'Sheet1' and 'Tasks Activity Log' and is shared correctly.");
    } finally {
      setLoading(false);
    }
  };

  /* Auth State */
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);

  /* Data Fetching */
  useEffect(() => {
    const auth = localStorage.getItem('taskflow_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const availableChannels = useMemo(() => {
    const channels = new Set(tasks.map(t => t.channelName || t.channelId || 'Uncategorized'));
    return ['All', ...Array.from(channels).sort()];
  }, [tasks]);



  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch = task.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.user?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel = selectedChannel === 'All' || (task.channelName || task.channelId || 'Uncategorized') === selectedChannel;

      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const taskDate = parseDate(task.createdAt) || parseDate(task.messageTimestamp);
        if (taskDate) {
          if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            if (taskDate < startDate) matchesDate = false;
          }
          if (matchesDate && dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (taskDate > endDate) matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesChannel && matchesDate;
    });

    // Apply Sorting
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'latest':
          return parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime();
        case 'oldest':
          return parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime();
        case 'priority': {
          const pMap: Record<string, number> = { 'High': 3, 'Normal': 2, 'Low': 1 };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        case 'taskid':
          return b.taskId.localeCompare(a.taskId);
        default:
          return 0;
      }
    });
  }, [searchTerm, tasks, selectedChannel, dateRange, sortOption]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const timeA = parseDate(a.actionTs).getTime();
      const timeB = parseDate(b.actionTs).getTime();
      switch (sortOption) {
        case 'latest':
          return timeB - timeA;
        case 'oldest':
          return timeA - timeB;
        case 'taskid':
          return b.taskId.localeCompare(a.taskId);
        default:
          return timeB - timeA; // Default to latest for logs if priority etc.
      }
    });
  }, [activities, sortOption]);

  const taskActivities = useMemo(() => {
    if (!selectedTask) return [];
    return sortedActivities.filter(a => a.taskId === selectedTask.taskId);
  }, [selectedTask, sortedActivities]);

  /* Statistics Calculation */
  const stats = useMemo(() => {
    const doneStage = dynamicStages.find(s => s.toLowerCase().includes('done') || s.toLowerCase().includes('complete'));
    return {
      total: filteredTasks.length,
      aiFactChecks: activities.filter(a => a.actionType === 'Fact Check Done' || a.actionType?.toLowerCase().includes('fact check')).length,
      aiTitles: activities.filter(a => a.actionType === 'AI Title Generation Done').length,
      doneCount: doneStage ? filteredTasks.filter(t => t.status === doneStage).length : 0,
      ...Object.fromEntries(dynamicStages.map(stage => [stage, filteredTasks.filter(t => t.status === stage).length]))
    };
  }, [filteredTasks, activities, dynamicStages]);

  const chartData = useMemo(() => {
    return dynamicStages.map(stage => ({
      name: stage,
      value: stats[stage] || 0
    }));
  }, [dynamicStages, stats]);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('todo')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('pickup') || s.includes('picked')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('progress')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s.includes('done') || s.includes('complete')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <div className="h-full overflow-hidden">
            <KanbanBoard tasks={filteredTasks} stages={dynamicStages} onTaskClick={setSelectedTask} />
          </div>
        );
      case 'tasks':
        return (
          <AllTasksView
            tasks={filteredTasks}
            activities={sortedActivities}
            stages={dynamicStages}
            sortOption={sortOption}
            onTaskClick={setSelectedTask}
          />
        );
      case 'logs':
        return (
          <ActivityLogsView
            tasks={filteredTasks}
            activities={sortedActivities}
            sortOption={sortOption}
            onTaskClick={setSelectedTask}
          />
        );
      case 'channels':
        return <ChannelsView channels={channelList} />;
      case 'users':
        return <UsersView users={userList} />;
      case 'fact-checks':
        return <AIFactChecksView activities={sortedActivities} />;
      case 'title-generations':
        return <AITitleGenerationsView activities={sortedActivities} />;
      case 'ai-combined':
        return <AICombinedView tasks={filteredTasks} activities={sortedActivities} />;
      case 'dashboard':
      default:
        return (
          <div className="pb-12">
            {viewMode === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Tasks" value={stats.total} icon={<AlertCircle size={24} className="text-indigo-600" />} color="bg-indigo-50" />
                <StatCard title="Completed" value={stats.doneCount} icon={<CheckCircle2 size={24} className="text-green-600" />} color="bg-green-50" />
                {dynamicStages.slice(0, 3).map((stage, idx) => (
                  <StatCard
                    key={stage}
                    title={stage}
                    value={stats[stage] || 0}
                    icon={idx === 0 ? <AlertCircle size={24} className="text-blue-600" /> : <Timer size={24} className="text-purple-600" />}
                    color={idx === 0 ? "bg-blue-50" : "bg-purple-50"}
                  />
                ))}
                <StatCard title="AI Fact Checks" value={stats.aiFactChecks} icon={<CheckCircle size={24} className="text-teal-600" />} color="bg-teal-50" />
                <StatCard title="AI Titles Generated" value={stats.aiTitles} icon={<Sparkles size={24} className="text-violet-600" />} color="bg-violet-50" />
              </div>
            )}

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
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <List size={22} className="text-indigo-500" />
                  Recent Tasks Overview
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
                    {filteredTasks.slice(0, 10).map((task) => (
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

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('taskflow_auth', 'true');
  };

  if (authLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentView={viewMode as any}
        onViewChange={setViewMode as any}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative md:ml-64">
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md py-2">
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 text-slate-600 hover:bg-white rounded-lg md:hidden transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {viewMode === 'dashboard' ? 'Analytics Overview' :
                  viewMode === 'kanban' ? 'Kanban Board' :
                    viewMode === 'tasks' ? 'Task Status Matrix' :
                      viewMode === 'logs' ? 'Audit Logs & Activities' :
                        viewMode === 'channels' ? 'Channel Management' :
                          viewMode === 'users' ? 'User Management' :
                            viewMode === 'fact-checks' ? 'AI Fact Check Analysis' :
                              viewMode === 'title-generations' ? 'AI Title Generation Done' : 'AI Master View'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="hidden xs:block text-slate-500 text-sm">Real-time Task Tracking</p>
                <span className="hidden xs:block text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 w-full md:w-auto no-scrollbar">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-shrink-0">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <BarChart size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <Columns3 size={16} />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('tasks')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">Matrix</span>
              </button>
              <button
                onClick={() => setViewMode('logs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <Clock size={16} />
                <span className="hidden sm:inline">Logs</span>
              </button>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 shadow-sm flex-shrink-0"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-48 text-slate-600 font-medium"
              >
                {availableChannels.map(ch => (
                  <option key={ch} value={ch}>{ch === 'All' ? 'All Channels' : ch}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-40 text-slate-600 font-medium"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="taskid">Task ID</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="text-sm text-slate-600 bg-transparent focus:outline-none w-full sm:w-auto"
                placeholder="Start Date"
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="text-sm text-slate-600 bg-transparent focus:outline-none w-full sm:w-auto"
                placeholder="End Date"
              />
            </div>
            {(selectedChannel !== 'All' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSelectedChannel('All');
                  setDateRange({ start: '', end: '' });
                }}
                className="flex items-center gap-1 px-3 py-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors text-xs font-bold uppercase shadow-sm border border-rose-100"
              >
                <XCircle size={14} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
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
          stages={dynamicStages}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default App;
