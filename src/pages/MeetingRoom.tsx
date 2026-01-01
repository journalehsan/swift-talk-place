import { useState, useRef, useEffect, useCallback } from 'react';
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
  MonitorOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function MeetingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Sarah Mitchell', content: 'Hi everyone!', time: '10:30 AM' },
    { id: '2', sender: 'Michael Chen', content: 'Ready to start?', time: '10:31 AM' },
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const participants = mockUsers.slice(0, 4);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle microphone
  const handleToggleMute = useCallback(async () => {
    try {
      if (isMuted) {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStreamRef.current) {
          // Add audio track to existing stream
          stream.getAudioTracks().forEach(track => {
            localStreamRef.current?.addTrack(track);
          });
        } else {
          localStreamRef.current = stream;
        }
        toast.success('Microphone enabled');
      } else {
        // Mute audio tracks
        localStreamRef.current?.getAudioTracks().forEach(track => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
        toast.info('Microphone disabled');
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, [isMuted]);

  // Toggle camera
  const handleToggleVideo = useCallback(async () => {
    try {
      if (!isVideoOn) {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        if (localStreamRef.current) {
          stream.getVideoTracks().forEach(track => {
            localStreamRef.current?.addTrack(track);
          });
        } else {
          localStreamRef.current = stream;
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        toast.success('Camera enabled');
      } else {
        // Stop video tracks
        localStreamRef.current?.getVideoTracks().forEach(track => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        toast.info('Camera disabled');
      }
      setIsVideoOn(!isVideoOn);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, [isVideoOn]);

  // Toggle screen sharing
  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        // Request screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: 'monitor',
          },
          audio: true
        });
        
        screenStreamRef.current = stream;
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }
        
        // Listen for when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null;
          }
          screenStreamRef.current = null;
          toast.info('Screen sharing stopped');
        };
        
        toast.success('Screen sharing started');
        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = null;
        }
        screenStreamRef.current = null;
        toast.info('Screen sharing stopped');
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      if ((error as Error).name !== 'AbortError') {
        toast.error('Could not share screen. Please try again.');
      }
    }
  }, [isScreenSharing]);

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
    // Cleanup streams before leaving
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
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
        <div className="flex-1 flex p-4 gap-4 min-h-0">
          {/* Left scrollable participants when screen sharing */}
          {isScreenSharing && (
            <div className="w-48 flex-shrink-0 overflow-y-auto space-y-3 pr-2">
              {/* Local User */}
              <div className="aspect-video relative rounded-lg overflow-hidden bg-meeting-controls ring-2 ring-primary">
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserAvatar user={user || participants[0]} size="lg" showStatus={false} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-meeting-foreground text-xs font-medium">You</span>
                    <div className="flex items-center gap-1">
                      {isMuted && <MicOff size={12} className="text-red-400" />}
                      {!isVideoOn && <VideoOff size={12} className="text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Other Participants */}
              {participants.slice(1).map((participant, index) => (
                <div
                  key={participant.id}
                  className="aspect-video relative rounded-lg overflow-hidden bg-meeting-controls"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserAvatar user={participant} size="lg" showStatus={false} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-meeting-foreground text-xs font-medium truncate">
                        {participant.name.split(' ')[0]}
                      </span>
                      {index === 0 && <MicOff size={12} className="text-red-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Screen Share - main area when active */}
          {isScreenSharing ? (
            <div className="flex-1 relative rounded-xl overflow-hidden bg-meeting-controls ring-2 ring-primary min-h-0">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <Monitor size={14} className="text-primary" />
                  <span className="text-meeting-foreground text-sm font-medium">
                    You are sharing your screen
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Regular grid when not screen sharing */
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Local User Video */}
              <div className="relative rounded-xl overflow-hidden bg-meeting-controls ring-2 ring-primary">
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserAvatar user={user || participants[0]} size="xl" showStatus={false} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-meeting-foreground text-sm font-medium">You</span>
                    <div className="flex items-center gap-2">
                      {isMuted && <MicOff size={14} className="text-red-400" />}
                      {!isVideoOn && <VideoOff size={14} className="text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Participants */}
              {participants.slice(1, 4).map((participant, index) => (
                <div
                  key={participant.id}
                  className="relative rounded-xl overflow-hidden bg-meeting-controls"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserAvatar user={participant} size="xl" showStatus={false} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-meeting-foreground text-sm font-medium">
                        {participant.name}
                      </span>
                      {index === 0 && <MicOff size={14} className="text-red-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="h-20 px-4 flex items-center justify-center gap-3 meeting-glass border-t border-border/20">
          <Button
            variant={isMuted ? 'meeting-danger' : 'meeting'}
            size="icon-lg"
            onClick={handleToggleMute}
            className="rounded-full"
          >
            {isMuted ? <MicOff size={22} className="text-meeting-foreground" /> : <Mic size={22} className="text-meeting-foreground" />}
          </Button>
          
          <Button
            variant={isVideoOn ? 'meeting' : 'meeting-danger'}
            size="icon-lg"
            onClick={handleToggleVideo}
            className="rounded-full"
          >
            {isVideoOn ? <Video size={22} className="text-meeting-foreground" /> : <VideoOff size={22} className="text-meeting-foreground" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? 'meeting-active' : 'meeting'}
            size="icon-lg"
            onClick={handleToggleScreenShare}
            className="rounded-full"
          >
            {isScreenSharing ? <MonitorOff size={22} className="text-meeting-foreground" /> : <Monitor size={22} className="text-meeting-foreground" />}
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
