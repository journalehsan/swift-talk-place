export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  department?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: User[];
  isRecurring?: boolean;
  meetingLink?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'reminder' | 'task';
  color?: string;
}
