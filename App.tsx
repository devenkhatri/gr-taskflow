
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Search, Filter, Plus, Clock, AlertCircle, CheckCircle2,
  Timer, MoreVertical, ExternalLink, Loader2, RefreshCw, LayoutGrid, List, BarChart, Menu, Columns3, Calendar, XCircle, CheckCircle, Sparkles, ArrowUpDown,
  ClockPlus,
  NotepadText,
  ClipboardCheck,
  WandSparkles,
  UserCircle,
  LogOut
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
import FilteredKanbanView from './components/FilteredKanbanView';
import LoginScreen from './components/LoginScreen';
import { Task, TaskStatus, TaskActivity } from './types';

const COLORS = ['#4f46e5', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981'];
const SHEET_ID = import.meta.env.VITE_SHEET_ID || '';

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

const formatStatus = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'created') return 'Completed';
  if (s === 'done') return 'Published';
  return status;
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban' | 'filtered-kanban' | 'tasks' | 'logs' | 'channels' | 'users' | 'fact-checks' | 'title-generations' | 'ai-combined'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [channelList, setChannelList] = useState<{ id: string; name: string; purpose: string; taskEnabled: string; factCheckEnabled: string; aiEnabled: string }[]>([]);
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);
  const [dynamicStages, setDynamicStages] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedCreator, setSelectedCreator] = useState<string>('All');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'priority' | 'taskid'>('taskid');
  const [userRole, setUserRole] = useState<'admin' | 'viewer' | null>(null);

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
      const mappedTasks: Task[] = (() => {
        const headerRow = taskRows.find((r: any) => r.c && r.c.some((c: any) => {
          const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return v === 'taskid' || v === 'id';
        }));

        let iMap = {
          taskId: 0, channelId: 1, message: 2, messageTimestamp: 3, user: 4,
          status: 5, priority: 6, createdAt: 7, createdBy: 8, lastAction: 9,
          updatedAt: 10, updatedBy: 11, messageUrl: 12
        };

        if (headerRow) {
          const getI = (patterns: string[]) => headerRow.c.findIndex((c: any) => {
            const v = String(c?.v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return patterns.some(p => v === p.toLowerCase().replace(/[^a-z0-9]/g, ''));
          });

          const newId = getI(['taskid', 'id']);
          if (newId !== -1) {
            iMap = {
              taskId: newId,
              channelId: getI(['channelid', 'channel']),
              message: getI(['message', 'text', 'content']),
              messageTimestamp: getI(['messagetimestamp', 'timestamp']),
              user: getI(['user', 'sender']),
              status: getI(['status', 'state']),
              priority: getI(['priority']),
              createdAt: getI(['createdat', 'creationtime']),
              createdBy: getI(['createdby', 'creator']),
              lastAction: getI(['lastaction']),
              updatedAt: getI(['updatedat']),
              updatedBy: getI(['updatedby']),
              messageUrl: getI(['messageurl', 'url', 'link'])
            };
          }
        }

        return taskRows.map((row: any) => {
          const c = row.c;
          if (!c || !c[iMap.taskId]) return null;
          const taskId = String(c[iMap.taskId]?.v || '');
          if (taskId.toLowerCase().replace(/[^a-z0-9]/g, '') === 'taskid') return null;

          const rawChannelId = String(c[iMap.channelId]?.v || '').trim();

          return {
            taskId: taskId,
            channelId: rawChannelId,
            message: String(c[iMap.message]?.v || ''),
            messageTimestamp: String(c[iMap.messageTimestamp]?.v || ''),
            user: String(c[iMap.user]?.v || ''),
            status: String(c[iMap.status]?.v || 'NEW'),
            priority: String(c[iMap.priority]?.v || 'Normal'),
            createdAt: String(c[iMap.createdAt]?.v || ''),
            createdBy: String(c[iMap.createdBy]?.v || ''),
            updatedAt: iMap.updatedAt !== -1 ? String(c[iMap.updatedAt]?.v || '') : '',
            updatedBy: iMap.updatedBy !== -1 ? String(c[iMap.updatedBy]?.v || '') : '',
            lastAction: String(c[iMap.lastAction]?.v || ''),
            channelName: channelMap.get(rawChannelId) || rawChannelId,
            messageUrl: (iMap.messageUrl !== -1 && c[iMap.messageUrl]) ? String(c[iMap.messageUrl]?.v || '') : ''
          };
        }).filter((t): t is Task => t !== null && !!t.taskId);
      })();

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
    const role = localStorage.getItem('taskflow_role') as 'admin' | 'viewer' | null;
    if (auth === 'true' && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      // Force viewer role to filtered-kanban view
      if (role === 'viewer') {
        setViewMode('filtered-kanban');
      }
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

  const availableCreators = useMemo(() => {
    const creators = new Set<string>();
    tasks.forEach(task => {
      const creator = task.createdBy || task.user;
      if (creator) creators.add(creator);
    });
    return ['All', ...Array.from(creators).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch = task.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.updatedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel = selectedChannel === 'All' || (task.channelName || task.channelId || 'Uncategorized') === selectedChannel;

      const matchesCreator = selectedCreator === 'All' || (task.createdBy || task.user) === selectedCreator;

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

      return matchesSearch && matchesChannel && matchesCreator && matchesDate;
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
  }, [searchTerm, tasks, selectedChannel, selectedCreator, dateRange, sortOption]);

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
    const doneStage = dynamicStages.find(s => s.toLowerCase().includes('done') || s.toLowerCase().includes('complete') || s.toLowerCase().includes('published'));
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
      name: formatStatus(stage),
      value: stats[stage] || 0
    }));
  }, [dynamicStages, stats]);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('todo')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('pickup') || s.includes('picked')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('progress')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s.includes('created') || s.includes('completed')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (s.includes('done') || s.includes('complete') || s.includes('published')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'legit') return 'bg-teal-100 text-teal-700 border-teal-200';
    if (s === 'fake') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatCardIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return <ClockPlus size={24} className="text-amber-600" />;
    if (s.includes('todo')) return <List size={24} className="text-blue-600" />;
    if (s.includes('pickup') || s.includes('picked')) return <NotepadText size={24} className="text-purple-600" />;
    if (s.includes('progress')) return <RefreshCw size={24} className="text-orange-600" />;
    if (s.includes('created') || s.includes('completed')) return <ClipboardCheck size={24} className="text-indigo-600" />;
    if (s.includes('done') || s.includes('complete') || s.includes('published')) return <CheckCircle2 size={24} className="text-emerald-600" />;
    return <AlertCircle size={24} className="text-slate-600" />;
  };

  const getStatCardColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return 'bg-amber-50';
    if (s.includes('todo')) return 'bg-blue-50';
    if (s.includes('pickup') || s.includes('picked')) return 'bg-purple-50';
    if (s.includes('progress')) return 'bg-orange-50';
    if (s.includes('created') || s.includes('completed')) return 'bg-indigo-50';
    if (s.includes('done') || s.includes('complete') || s.includes('published')) return 'bg-emerald-50';
    return 'bg-slate-50';
  };

  const getStageHexColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('new') || s.includes('incoming')) return '#f59e0b'; // Amber 500
    if (s.includes('todo')) return '#3b82f6'; // Blue 500
    if (s.includes('pickup') || s.includes('picked')) return '#a855f7'; // Purple 500
    if (s.includes('progress')) return '#f97316'; // Orange 500
    if (s.includes('created') || s.includes('completed')) return '#6366f1'; // Indigo 500
    if (s.includes('done') || s.includes('complete') || s.includes('published')) return '#10b981'; // Emerald 500
    return '#94a3b8'; // Slate 400
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <div className="h-full overflow-hidden">
            <KanbanBoard tasks={filteredTasks} stages={dynamicStages} onTaskClick={setSelectedTask} />
          </div>
        );
      case 'filtered-kanban':
        return (
          <div className="h-full overflow-hidden">
            <FilteredKanbanView tasks={filteredTasks} stages={dynamicStages} onTaskClick={setSelectedTask} />
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
                <StatCard title="Total Tasks" value={stats.total} icon={<BarChart size={24} className="text-indigo-600" />} color="bg-indigo-50" />
                {dynamicStages.map((stage) => {
                  return (
                    <StatCard
                      key={stage}
                      title={formatStatus(stage)}
                      value={stats[stage] || 0}
                      icon={getStatCardIcon(stage)}
                      color={getStatCardColor(stage)}
                    />
                  );
                })}
                <StatCard title="AI Fact Checks" value={stats.aiFactChecks} icon={<WandSparkles size={24} className="text-teal-600" />} color="bg-teal-50" />
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
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStageHexColor(entry.name)} />
                        ))}
                      </Bar>
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
                          <Cell key={`cell-${index}`} fill={getStageHexColor(entry.name)} />
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
                      <th className="px-6 py-4">Task Owner</th>
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
                        <td className="px-6 py-5 font-bold text-indigo-600 text-xs">
                          <div className="flex items-center gap-2">
                            {task.taskId}
                            {task.messageUrl && (
                              <a
                                href={task.messageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                title="View on Slack"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 max-w-xs truncate text-sm text-slate-700">{task.message}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                              {(task.updatedBy || task.createdBy || task.user || '?').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{task.updatedBy || task.createdBy || task.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${getStatusStyle(task.status)}`}>
                            {formatStatus(task.status)}
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

  const handleLogin = (role: 'admin' | 'viewer') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('taskflow_auth', 'true');
    localStorage.setItem('taskflow_role', role);
    // Force viewer role to filtered-kanban view
    if (role === 'viewer') {
      setViewMode('filtered-kanban');
    }
  };

  // Wrapper for setViewMode that respects viewer role restrictions
  const handleViewModeChange = (newMode: typeof viewMode) => {
    // Viewers can only access filtered-kanban
    if (userRole === 'viewer') {
      return;
    }
    setViewMode(newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('taskflow_auth');
    localStorage.removeItem('taskflow_role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (authLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {userRole === 'admin' && (
        <Sidebar
          currentView={viewMode as any}
          onViewChange={handleViewModeChange as any}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 h-full overflow-y-auto p-4 md:p-8 relative ${userRole === 'admin' ? 'md:ml-64' : ''}`}>
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {userRole === 'admin' && (
                <button
                  className="p-2 -ml-2 text-slate-600 hover:bg-white rounded-lg md:hidden transition-colors"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {viewMode === 'dashboard' ? 'Analytics Overview' :
                    viewMode === 'kanban' ? 'Kanban Board' :
                      viewMode === 'filtered-kanban' ? 'Employee Kanban Board' :
                        viewMode === 'tasks' ? 'Task Status Matrix' :
                          viewMode === 'logs' ? 'Audit Logs & Activities' :
                            viewMode === 'channels' ? 'Channel Management' :
                              viewMode === 'users' ? 'User Management' :
                                viewMode === 'fact-checks' ? 'AI Fact Check Analysis' :
                                  viewMode === 'title-generations' ? 'AI Title Generation Done' : 'AI Master View'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            {userRole === 'admin' && (
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
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
              </div>
            )}
            <div className="flex gap-2 sm:gap-4 items-center">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 shadow-sm flex-shrink-0"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors font-medium shadow-sm flex-shrink-0"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
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
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full sm:w-48 text-slate-600 font-medium"
              >
                {availableCreators.map(creator => (
                  <option key={creator} value={creator}>{creator === 'All' ? 'All Originators' : creator}</option>
                ))}
              </select>
              <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
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
            {(selectedChannel !== 'All' || selectedCreator !== 'All' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSelectedChannel('All');
                  setSelectedCreator('All');
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


        {
          loading && tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-slate-500 font-medium animate-pulse text-lg">Syncing with Google Sheets...</p>
            </div>
          ) : (
            renderContent()
          )
        }
      </main >

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          activities={taskActivities}
          stages={dynamicStages}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div >
  );
};

export default App;
