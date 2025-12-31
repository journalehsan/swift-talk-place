import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockData';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Phone,
  MoreVertical,
  Hand,
  Grid3X3,
  Maximize2,
  Settings,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MeetingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Sarah Mitchell', content: 'Hi everyone!', time: '10:30 AM' },
    { id: '2', sender: 'Michael Chen', content: 'Ready to start?', time: '10:31 AM' },
  ]);

  const participants = mockUsers.slice(0, 4);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now().toString(), sender: user?.name || 'You', content: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setChatMessage('');
    }
  };

  const handleLeaveMeeting = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-meeting-bg flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 px-4 flex items-center justify-between meeting-glass border-b border-border/20">
          <div className="flex items-center gap-3">
            <span className="text-meeting-foreground font-medium">Daily Standup</span>
            <span className="text-meeting-foreground-muted text-sm">|</span>
            <span className="text-meeting-foreground-muted text-sm">10:30 - 11:00 AM</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="meeting" size="icon-sm">
              <Grid3X3 size={18} className="text-meeting-foreground" />
            </Button>
            <Button variant="meeting" size="icon-sm">
              <Maximize2 size={18} className="text-meeting-foreground" />
            </Button>
            <Button variant="meeting" size="icon-sm">
              <Settings size={18} className="text-meeting-foreground" />
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-4">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className={cn(
                'relative rounded-xl overflow-hidden bg-meeting-controls',
                index === 0 && 'ring-2 ring-primary'
              )}
            >
              {/* Simulated video feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <UserAvatar user={participant} size="xl" showStatus={false} />
              </div>
              
              {/* Participant info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-meeting-foreground text-sm font-medium">
                    {participant.name}
                    {participant.id === user?.id && ' (You)'}
                  </span>
                  {index === 1 && <MicOff size={14} className="text-red-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="h-20 px-4 flex items-center justify-center gap-3 meeting-glass border-t border-border/20">
          <Button
            variant={isMuted ? 'meeting-danger' : 'meeting'}
            size="icon-lg"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full"
          >
            {isMuted ? <MicOff size={22} className="text-meeting-foreground" /> : <Mic size={22} className="text-meeting-foreground" />}
          </Button>
          
          <Button
            variant={isVideoOn ? 'meeting' : 'meeting-danger'}
            size="icon-lg"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="rounded-full"
          >
            {isVideoOn ? <Video size={22} className="text-meeting-foreground" /> : <VideoOff size={22} className="text-meeting-foreground" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? 'meeting-active' : 'meeting'}
            size="icon-lg"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className="rounded-full"
          >
            <Monitor size={22} className="text-meeting-foreground" />
          </Button>
          
          <Button variant="meeting" size="icon-lg" className="rounded-full">
            <Hand size={22} className="text-meeting-foreground" />
          </Button>
          
          <div className="w-px h-8 bg-border/30 mx-2" />
          
          <Button
            variant={isChatOpen ? 'meeting-active' : 'meeting'}
            size="icon-lg"
            onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }}
            className="rounded-full"
          >
            <MessageSquare size={22} className="text-meeting-foreground" />
          </Button>
          
          <Button
            variant={isParticipantsOpen ? 'meeting-active' : 'meeting'}
            size="icon-lg"
            onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }}
            className="rounded-full"
          >
            <Users size={22} className="text-meeting-foreground" />
          </Button>
          
          <Button variant="meeting" size="icon-lg" className="rounded-full">
            <MoreVertical size={22} className="text-meeting-foreground" />
          </Button>
          
          <div className="w-px h-8 bg-border/30 mx-2" />
          
          <Button
            variant="meeting-danger"
            size="lg"
            onClick={handleLeaveMeeting}
            className="rounded-full px-6"
          >
            <Phone size={20} className="mr-2 rotate-[135deg]" />
            Leave
          </Button>
        </div>
      </div>

      {/* Side Panel - Chat or Participants */}
      {(isChatOpen || isParticipantsOpen) && (
        <div className="w-80 meeting-glass border-l border-border/20 flex flex-col animate-slide-up">
          <div className="h-14 px-4 flex items-center border-b border-border/20">
            <h3 className="text-meeting-foreground font-medium">
              {isChatOpen ? 'In-call messages' : 'Participants'}
            </h3>
          </div>

          {isChatOpen ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-meeting-foreground text-sm font-medium">{msg.sender}</span>
                        <span className="text-meeting-foreground-muted text-xs">{msg.time}</span>
                      </div>
                      <p className="text-meeting-foreground/80 text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Send a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-meeting-controls border-border/30 text-meeting-foreground placeholder:text-meeting-foreground-muted"
                  />
                  <Button variant="meeting" size="icon" onClick={handleSendMessage}>
                    <Send size={18} className="text-meeting-foreground" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10">
                    <UserAvatar user={participant} size="sm" />
                    <div className="flex-1">
                      <p className="text-meeting-foreground text-sm font-medium">
                        {participant.name}
                        {participant.id === user?.id && ' (You)'}
                      </p>
                      <p className="text-meeting-foreground-muted text-xs">{participant.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
