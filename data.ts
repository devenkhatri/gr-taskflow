
import { Task, TaskActivity, TaskStatus } from './types';

export const TASKS: Task[] = [
  {
    taskId: 'TS0001',
    channelId: 'C09DXNP11QD',
    message: 'Message-1-Edit-2',
    messageTimestamp: '1766318409.200719',
    user: 'Deven Goratela',
    status: TaskStatus.PICKEDUP,
    priority: 'High',
    createdAt: '2025-12-21T13:00:14.417+01:00',
    createdBy: 'Deven Goratela',
    updatedAt: '2025-12-21T13:14:49.052+01:00',
    updatedBy: 'Deven Goratela',
    lastAction: "Status updated to 'PickedUp' by Deven Goratela"
  },
  {
    taskId: 'TS0002',
    channelId: 'C09DXNP11QD',
    message: 'https://gujjurocks.in/harry-potter-daniel-radcliffes-lookalike-spotted-maha-kumbh-mela/',
    messageTimestamp: '1766319626.001519',
    user: 'Deven Goratela',
    status: TaskStatus.NEW,
    priority: 'Normal',
    createdAt: '2025-12-21T13:20:30.493+01:00',
    createdBy: 'Deven Goratela',
    lastAction: "New Task Created"
  },
  {
    taskId: 'TS0003',
    channelId: 'C09DXNP11QD',
    message: 'https://timesofindia.indiatimes.com/sports/football/top-stories/kolkata-chaos-lionel-messis-event-derailed-after-a-very-influential-person-reached-stadium-what-organiser-tells-sit/articleshow/126094706.cms',
    messageTimestamp: '1766319643.940969',
    user: 'Deven Goratela',
    status: TaskStatus.NEW,
    priority: 'Normal',
    createdAt: '2025-12-21T13:20:49.468+01:00',
    createdBy: 'Deven Goratela',
    lastAction: "New Task Created"
  }
];

export const ACTIVITIES: TaskActivity[] = [
  {
    taskId: 'TS0001',
    actionType: 'Task Created',
    action: 'New Task Created',
    actionTs: '1766318409.200719',
    status: TaskStatus.NEW,
    timestamp: '2025-12-21T13:00:17.090+01:00',
    user: 'Deven Goratela'
  },
  {
    taskId: 'TS0001',
    actionType: 'AI Title Generation',
    action: '1. યુએસએ ટુડે: એસટન ફાઈલોમાં પૂરું નામ\n2. પના નવા દસ્તાવેજોમાં એસટનના રહસ્યો',
    actionTs: '1766318409.200719',
    timestamp: '2025-12-21T13:00:29.376+01:00',
    user: 'U05R4MF1DDG'
  },
  {
    taskId: 'TS0001',
    actionType: 'Fact Check Done',
    action: '**Answer**\nI’m unable to evaluate the legitimacy because no article or URL was provided...',
    actionTs: '1766318409.200719',
    timestamp: '2025-12-21T13:00:33.131+01:00',
    user: 'U05R4MF1DDG'
  },
  {
    taskId: 'TS0001',
    actionType: 'Reaction Added',
    action: "Status updated to 'ToDo'",
    actionTs: '1766318409.200719',
    status: TaskStatus.TODO,
    timestamp: '2025-12-21T13:05:50.098+01:00',
    user: 'Deven Goratela'
  },
  {
    taskId: 'TS0001',
    actionType: 'Message Edited',
    action: 'Message Edited from "Message-1-Edit-1" to "Message-1-Edit-2"',
    actionTs: '1766318409.200719',
    timestamp: '2025-12-21T13:13:59.381+01:00',
    user: 'Deven Goratela'
  },
  {
    taskId: 'TS0001',
    actionType: 'Reaction Added',
    action: "Status updated to 'PickedUp'",
    actionTs: '1766318409.200719',
    status: TaskStatus.PICKEDUP,
    timestamp: '2025-12-21T13:14:50.504+01:00',
    user: 'Deven Goratela'
  },
  {
    taskId: 'TS0002',
    actionType: 'Task Created',
    action: 'New Task Created',
    actionTs: '1766319626.001519',
    status: TaskStatus.NEW,
    timestamp: '2025-12-21T13:20:32.769+01:00',
    user: 'Deven Goratela'
  },
  {
    taskId: 'TS0002',
    actionType: 'AI Title Generation',
    action: '**Summary of the article**\nThe news piece reports a viral video of Harry Potter lookalike...',
    actionTs: '1766319626.001519',
    timestamp: '2025-12-21T13:20:42.841+01:00',
    user: 'U05R4MF1DDG'
  }
];
