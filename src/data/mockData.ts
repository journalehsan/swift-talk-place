import { User, Meeting, ChatConversation, CalendarEvent } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'John Anderson', email: 'john@company.com', status: 'online', department: 'Engineering' },
  { id: '2', name: 'Sarah Mitchell', email: 'sarah@company.com', status: 'busy', department: 'Design' },
  { id: '3', name: 'Michael Chen', email: 'michael@company.com', status: 'away', department: 'Product' },
  { id: '4', name: 'Emily Johnson', email: 'emily@company.com', status: 'online', department: 'Marketing' },
  { id: '5', name: 'David Williams', email: 'david@company.com', status: 'offline', department: 'Sales' },
  { id: '6', name: 'Lisa Thompson', email: 'lisa@company.com', status: 'online', department: 'HR' },
];

export const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Daily Standup',
    description: 'Team sync meeting',
    startTime: new Date(Date.now() + 30 * 60000),
    endTime: new Date(Date.now() + 60 * 60000),
    participants: [mockUsers[0], mockUsers[1], mockUsers[2]],
    isRecurring: true,
  },
  {
    id: '2',
    title: 'Product Review',
    description: 'Review Q4 product roadmap',
    startTime: new Date(Date.now() + 120 * 60000),
    endTime: new Date(Date.now() + 180 * 60000),
    participants: [mockUsers[0], mockUsers[2], mockUsers[3]],
  },
  {
    id: '3',
    title: 'Design Sprint Planning',
    description: 'Plan next design sprint activities',
    startTime: new Date(Date.now() + 240 * 60000),
    endTime: new Date(Date.now() + 300 * 60000),
    participants: [mockUsers[1], mockUsers[3]],
  },
];

export const mockConversations: ChatConversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    messages: [
      { id: '1', senderId: '2', senderName: 'Sarah Mitchell', content: 'Hey, did you see the new designs?', timestamp: new Date(Date.now() - 5 * 60000) },
      { id: '2', senderId: '1', senderName: 'John Anderson', content: 'Yes! They look amazing. Great work!', timestamp: new Date(Date.now() - 4 * 60000) },
      { id: '3', senderId: '2', senderName: 'Sarah Mitchell', content: 'Thanks! Can we discuss the feedback later?', timestamp: new Date(Date.now() - 2 * 60000) },
    ],
    unreadCount: 1,
  },
  {
    id: '2',
    participants: [mockUsers[0], mockUsers[2]],
    messages: [
      { id: '1', senderId: '3', senderName: 'Michael Chen', content: 'The sprint planning is at 3 PM', timestamp: new Date(Date.now() - 30 * 60000) },
    ],
    unreadCount: 0,
  },
  {
    id: '3',
    participants: [mockUsers[0], mockUsers[3]],
    messages: [
      { id: '1', senderId: '4', senderName: 'Emily Johnson', content: 'Need your input on the marketing copy', timestamp: new Date(Date.now() - 60 * 60000) },
    ],
    unreadCount: 2,
  },
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Daily Standup',
    start: new Date(),
    end: new Date(Date.now() + 30 * 60000),
    type: 'meeting',
    color: 'primary',
  },
  {
    id: '2',
    title: 'Product Review',
    start: new Date(Date.now() + 120 * 60000),
    end: new Date(Date.now() + 180 * 60000),
    type: 'meeting',
    color: 'accent',
  },
  {
    id: '3',
    title: 'Submit weekly report',
    start: new Date(Date.now() + 24 * 60 * 60000),
    end: new Date(Date.now() + 24 * 60 * 60000 + 60 * 60000),
    type: 'task',
    color: 'warning',
  },
];
