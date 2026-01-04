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
  Minimize2,
  Settings,
  Send,
  MonitorOff,
  LayoutGrid,
  X,
  Volume2,
  Palette,
  Layout,
  Circle,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Component to display a video stream
const LocalVideoMirror = ({ stream, className }: { stream: MediaStream; className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);
  
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className}
    />
  );
};

export default function MeetingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStageMode, setIsStageMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stagedUser, setStagedUser] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Sarah Mitchell', content: 'Hi everyone!', time: '10:30 AM' },
    { id: '2', sender: 'Michael Chen', content: 'Ready to start?', time: '10:31 AM' },
  ]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSaveRecordingDialog, setShowSaveRecordingDialog] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [videoKey, setVideoKey] = useState(0);

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
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Toggle microphone
  const handleToggleMute = useCallback(async () => {
    try {
      if (isMuted) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStreamRef.current) {
          stream.getAudioTracks().forEach(track => {
            localStreamRef.current?.addTrack(track);
          });
        } else {
          localStreamRef.current = stream;
        }
        toast.success('Microphone enabled');
      } else {
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        localStreamRef.current = stream;
        setVideoKey(prev => prev + 1); // Force video element re-render
        toast.success('Camera enabled');
      } else {
        localStreamRef.current?.getVideoTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
        toast.info('Camera disabled');
      }
      setIsVideoOn(!isVideoOn);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, [isVideoOn]);

  // Attach video stream when video element mounts or stream changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && isVideoOn) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(console.error);
    }
  }, [isVideoOn, videoKey]);

  // Attach screen share stream when it becomes available
  useEffect(() => {
    if (screenShareRef.current && screenStreamRef.current && isScreenSharing) {
      screenShareRef.current.srcObject = screenStreamRef.current;
      screenShareRef.current.play().catch(console.error);
    }
  }, [isScreenSharing]);

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
        
        // Set screen share source after a small delay to ensure ref is ready
        setTimeout(() => {
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = stream;
            screenShareRef.current.play().catch(console.error);
          }
        }, 50);
        
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
    // If recording, show save dialog
    if (isRecording) {
      setShowSaveRecordingDialog(true);
      return;
    }
    
    // Cleanup streams before leaving
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  // Handle recording toggle
  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      toast.success('Recording started');
    } else {
      setShowSaveRecordingDialog(true);
    }
  };

  // Stop recording without saving
  const handleStopRecordingWithoutSave = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
    setShowSaveRecordingDialog(false);
    toast.info('Recording discarded');
  };

  // Save recording and leave/continue
  const handleSaveRecording = (andLeave: boolean = false) => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
    setShowSaveRecordingDialog(false);
    toast.success('Recording saved successfully!');
    
    if (andLeave) {
      // Cleanup streams before leaving
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      navigate('/recordings');
    }
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle stage/grid view
  const handleToggleStageMode = () => {
    if (!isStageMode) {
      setStagedUser('you'); // Default to staging yourself
    }
    setIsStageMode(!isStageMode);
  };

  // Toggle fullscreen
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast.error('Could not toggle fullscreen');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle settings panel
  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    if (!isSettingsOpen) {
      setIsChatOpen(false);
      setIsParticipantsOpen(false);
    }
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
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-red-500/20 rounded-full border border-red-500/30">
                <Circle size={10} className="text-red-500 fill-red-500 animate-pulse" />
                <span className="text-red-400 text-sm font-medium">
                  REC {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isStageMode ? 'meeting-active' : 'meeting'} 
              size="icon-sm"
              onClick={handleToggleStageMode}
              title={isStageMode ? 'Switch to Grid View' : 'Switch to Stage View'}
            >
              {isStageMode ? <LayoutGrid size={18} className="text-meeting-foreground" /> : <Grid3X3 size={18} className="text-meeting-foreground" />}
            </Button>
            <Button 
              variant={isFullscreen ? 'meeting-active' : 'meeting'} 
              size="icon-sm"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} className="text-meeting-foreground" /> : <Maximize2 size={18} className="text-meeting-foreground" />}
            </Button>
            <Button 
              variant={isSettingsOpen ? 'meeting-active' : 'meeting'} 
              size="icon-sm"
              onClick={handleToggleSettings}
              title="Meeting Settings"
            >
              <Settings size={18} className="text-meeting-foreground" />
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex p-4 gap-4 min-h-0 overflow-hidden">
          {/* Hidden local video element - always mounted to maintain stream */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          
          {/* Left scrollable participants when screen sharing */}
          {isScreenSharing && (
            <ScrollArea className="w-48 flex-shrink-0 h-full">
              <div className="space-y-3 pr-2">
                {/* Local User */}
                <div className="aspect-video relative rounded-lg overflow-hidden bg-meeting-controls ring-2 ring-primary">
                  {isVideoOn && localStreamRef.current ? (
                    <LocalVideoMirror stream={localStreamRef.current} className="w-full h-full object-cover" />
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
            </ScrollArea>
          )}

          {/* Screen Share - main area when active */}
          {isScreenSharing ? (
            <div className="flex-1 relative rounded-xl overflow-hidden bg-black ring-2 ring-primary min-h-0">
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
          ) : isStageMode ? (
            /* Stage mode - one user featured, others in sidebar */
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Left scrollable participants */}
              <ScrollArea className="w-48 flex-shrink-0 h-full">
                <div className="space-y-3 pr-2">
                  {/* Local User - clickable to stage */}
                  <div 
                    className={cn(
                      "aspect-video relative rounded-lg overflow-hidden bg-meeting-controls cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                      stagedUser === 'you' && "ring-2 ring-primary"
                    )}
                    onClick={() => setStagedUser('you')}
                  >
                    {isVideoOn && localStreamRef.current ? (
                      <LocalVideoMirror stream={localStreamRef.current} className="w-full h-full object-cover" />
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
                  
                  {/* Other Participants - clickable to stage */}
                  {participants.slice(1).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={cn(
                        "aspect-video relative rounded-lg overflow-hidden bg-meeting-controls cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                        stagedUser === participant.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setStagedUser(participant.id)}
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
              </ScrollArea>

              {/* Main staged user */}
              <div className="flex-1 relative rounded-xl overflow-hidden bg-meeting-controls ring-2 ring-primary min-h-0">
                {stagedUser === 'you' ? (
                  <>
                    {isVideoOn && localStreamRef.current ? (
                      <LocalVideoMirror stream={localStreamRef.current} className="w-full h-full object-cover" />
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
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UserAvatar 
                        user={participants.find(p => p.id === stagedUser) || participants[1]} 
                        size="xl" 
                        showStatus={false} 
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-meeting-foreground text-sm font-medium">
                        {participants.find(p => p.id === stagedUser)?.name || participants[1].name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Regular grid when not screen sharing */
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Local User Video */}
              <div className="relative rounded-xl overflow-hidden bg-meeting-controls ring-2 ring-primary">
                {isVideoOn && localStreamRef.current ? (
                  <LocalVideoMirror stream={localStreamRef.current} className="w-full h-full object-cover" />
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
          
          {/* Record Button */}
          <Button
            variant={isRecording ? 'meeting-danger' : 'meeting'}
            size="icon-lg"
            onClick={handleToggleRecording}
            className="rounded-full relative"
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? (
              <Square size={18} className="text-meeting-foreground fill-meeting-foreground" />
            ) : (
              <Circle size={22} className="text-red-400" />
            )}
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
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

      {/* Side Panel - Chat, Participants, or Settings */}
      {(isChatOpen || isParticipantsOpen || isSettingsOpen) && (
        <div className="w-80 meeting-glass border-l border-border/20 flex flex-col animate-slide-up">
          <div className="h-14 px-4 flex items-center justify-between border-b border-border/20">
            <h3 className="text-meeting-foreground font-medium">
              {isChatOpen ? 'In-call messages' : isParticipantsOpen ? 'Participants' : 'Settings'}
            </h3>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => {
                setIsChatOpen(false);
                setIsParticipantsOpen(false);
                setIsSettingsOpen(false);
              }}
              className="text-meeting-foreground-muted hover:text-meeting-foreground"
            >
              <X size={16} />
            </Button>
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
          ) : isParticipantsOpen ? (
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
          ) : (
            /* Settings Panel */
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Layout Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-meeting-foreground-muted">
                    <Layout size={16} />
                    <span className="text-xs uppercase font-medium tracking-wider">Layout</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={!isStageMode ? 'meeting-active' : 'meeting'}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsStageMode(false)}
                    >
                      <LayoutGrid size={16} />
                      Grid View
                    </Button>
                    <Button
                      variant={isStageMode ? 'meeting-active' : 'meeting'}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => { setIsStageMode(true); setStagedUser('you'); }}
                    >
                      <Grid3X3 size={16} />
                      Stage View
                    </Button>
                  </div>
                </div>

                {/* Audio Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-meeting-foreground-muted">
                    <Volume2 size={16} />
                    <span className="text-xs uppercase font-medium tracking-wider">Audio</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={!isMuted ? 'meeting-active' : 'meeting'}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={handleToggleMute}
                    >
                      {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    </Button>
                  </div>
                </div>

                {/* Video Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-meeting-foreground-muted">
                    <Video size={16} />
                    <span className="text-xs uppercase font-medium tracking-wider">Video</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={isVideoOn ? 'meeting-active' : 'meeting'}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={handleToggleVideo}
                    >
                      {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
                      {isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                    </Button>
                  </div>
                </div>

                {/* Display Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-meeting-foreground-muted">
                    <Palette size={16} />
                    <span className="text-xs uppercase font-medium tracking-wider">Display</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={isFullscreen ? 'meeting-active' : 'meeting'}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={handleToggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    </Button>
                  </div>
                </div>

                {/* Quick Access */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-meeting-foreground-muted">
                    <Users size={16} />
                    <span className="text-xs uppercase font-medium tracking-wider">Quick Access</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="meeting"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => { setIsSettingsOpen(false); setIsChatOpen(true); }}
                    >
                      <MessageSquare size={16} />
                      Open Chat
                    </Button>
                    <Button
                      variant="meeting"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => { setIsSettingsOpen(false); setIsParticipantsOpen(true); }}
                    >
                      <Users size={16} />
                      View Participants
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Save Recording Dialog */}
      <AlertDialog open={showSaveRecordingDialog} onOpenChange={setShowSaveRecordingDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Circle size={16} className="text-red-500 fill-red-500" />
              Save Recording?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You have an active recording ({formatDuration(recordingDuration)}).</p>
              <p>Would you like to save it before continuing?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleStopRecordingWithoutSave}>
              Discard Recording
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleSaveRecording(false)}
              className="bg-primary text-primary-foreground"
            >
              Save & Continue
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => handleSaveRecording(true)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Save & View Recordings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
