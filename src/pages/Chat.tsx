import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockConversations, mockUsers } from '@/data/mockData';
import { Search, Send, Phone, Video, MoreVertical, Plus, Smile, Paperclip, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

// Helper to highlight matching text
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-400/50 dark:bg-yellow-500/40 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(selectedConversation.messages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
    '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨',
    '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
    '👍', '👎', '👋', '🙌', '👏', '🤝', '❤️', '🔥',
    '✨', '🎉', '💯', '✅', '⭐', '💪', '🙏', '💬',
  ];

  // Filter conversations based on search query (contact name or message content)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockConversations;
    }
    
    const query = searchQuery.toLowerCase();
    
    return mockConversations.filter((conversation) => {
      const otherUser = conversation.participants.find(p => p.id !== user?.id);
      const nameMatch = otherUser?.name.toLowerCase().includes(query);
      const messageMatch = conversation.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      );
      return nameMatch || messageMatch;
    });
  }, [searchQuery, user?.id]);

  // Check if a conversation has matching messages
  const getMatchingMessagePreview = (conversation: typeof mockConversations[0]) => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    const matchingMessage = conversation.messages.find(msg => 
      msg.content.toLowerCase().includes(query)
    );
    return matchingMessage;
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setEmojiOpen(false);
  };

  const handleAttachment = (type: 'file' | 'photo') => {
    console.log(`Attaching ${type}`);
  };

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
        <ResizablePanelGroup direction="horizontal">
          {/* Conversations Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col">
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
                    placeholder="Search contacts & messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {filteredConversations.length} result{filteredConversations.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredConversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No results found
                    </p>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const lastMessage = conversation.messages[conversation.messages.length - 1];
                      const isSelected = selectedConversation.id === conversation.id;
                      const matchingMessage = getMatchingMessagePreview(conversation);

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
                              <span className="font-medium truncate">
                                <HighlightText text={otherUser?.name || ''} highlight={searchQuery} />
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(lastMessage?.timestamp, 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {matchingMessage ? (
                                <HighlightText text={matchingMessage.content} highlight={searchQuery} />
                              ) : (
                                lastMessage?.content
                              )}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Online Users */}
              <div className="p-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">ONLINE NOW</p>
                <div className="flex gap-2 flex-wrap">
                  {mockUsers.filter(u => u.status === 'online' && u.id !== user?.id).slice(0, 4).map((u) => (
                    <UserAvatar key={u.id} user={u} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Chat Area */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
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
                            <p className="text-sm">
                              <HighlightText text={msg.content} highlight={searchQuery} />
                            </p>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => handleAttachment('file')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Files / Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAttachment('photo')}>
                        <Image className="h-4 w-4 mr-2" />
                        Photo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="p-1.5 hover:bg-muted rounded text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppLayout>
  );
}
