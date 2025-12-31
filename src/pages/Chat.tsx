import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockConversations, mockUsers } from '@/data/mockData';
import { Search, Send, Phone, Video, MoreVertical, Plus, Smile, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Chat() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(selectedConversation.messages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        senderName: user?.name || 'You',
        content: message,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const getOtherUser = (conversation: typeof mockConversations[0]) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-7rem)] flex rounded-xl border border-border overflow-hidden bg-card animate-fade-in">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button variant="ghost" size="icon-sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {mockConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const isSelected = selectedConversation.id === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setMessages(conversation.messages);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                    )}
                  >
                    {otherUser && <UserAvatar user={otherUser} size="md" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{otherUser?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(lastMessage?.timestamp, 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Online Users */}
          <div className="p-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">ONLINE NOW</p>
            <div className="flex gap-2">
              {mockUsers.filter(u => u.status === 'online' && u.id !== user?.id).slice(0, 4).map((u) => (
                <UserAvatar key={u.id} user={u} size="sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              {getOtherUser(selectedConversation) && (
                <UserAvatar user={getOtherUser(selectedConversation)!} size="md" />
              )}
              <div>
                <h3 className="font-medium">{getOtherUser(selectedConversation)?.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {getOtherUser(selectedConversation)?.status === 'online' ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                  >
                    {!isOwn && (
                      <UserAvatar
                        user={mockUsers.find(u => u.id === msg.senderId) || mockUsers[0]}
                        size="sm"
                        showStatus={false}
                      />
                    )}
                    <div className={cn('max-w-[70%]', isOwn && 'text-right')}>
                      <div
                        className={cn(
                          'inline-block px-4 py-2 rounded-2xl',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(msg.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-3">
                  <UserAvatar
                    user={getOtherUser(selectedConversation) || mockUsers[0]}
                    size="sm"
                    showStatus={false}
                  />
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
