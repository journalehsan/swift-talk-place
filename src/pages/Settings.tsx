import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Video,
  Mic,
  Monitor,
  Save,
  Camera,
  Play,
  Square,
  Volume2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Color scheme options
const colorSchemes = [
  { color: '#2563eb', name: 'Blue' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#059669', name: 'Green' },
  { color: '#7c3aed', name: 'Purple' },
  { color: '#dc2626', name: 'Red' },
  { color: '#ffcc00', name: 'Yellow' },
];

// Timezone options
const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Tehran', label: 'Tehran (UTC+3:30)' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)' },
  { value: 'Asia/Shanghai', label: 'China (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+11)' },
];

interface MediaDevice {
  deviceId: string;
  label: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    sound: true,
    mentions: true,
  });
  
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  
  // Device states
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDevice[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  
  // Webcam preview
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  // Audio test states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Enumerate devices on mount
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
          .then(stream => stream.getTracks().forEach(track => track.stop()))
          .catch(() => {});
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(d => d.kind === 'audioinput')
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` }));
        
        const audioOutputs = devices
          .filter(d => d.kind === 'audiooutput')
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 5)}` }));
        
        const videoInputs = devices
          .filter(d => d.kind === 'videoinput')
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` }));
        
        setAudioInputDevices(audioInputs);
        setAudioOutputDevices(audioOutputs);
        setVideoDevices(videoInputs);
        
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
        if (audioOutputs.length > 0) setSelectedSpeaker(audioOutputs[0].deviceId);
        if (videoInputs.length > 0) setSelectedCamera(videoInputs[0].deviceId);
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };
    
    enumerateDevices();
  }, []);

  // Start webcam preview
  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoStream(stream);
      setIsPreviewActive(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  // Stop webcam preview
  const stopCameraPreview = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewActive(false);
  };

  // Start audio recording (8 seconds)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined }
      });
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingProgress(0);
      setAudioBlob(null);
      
      // Progress animation
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 8000) * 100, 100);
        setRecordingProgress(progress);
        
        if (elapsed >= 8000) {
          clearInterval(interval);
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  // Stop recording early
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      
      // Try to set output device if supported
      if (selectedSpeaker && 'setSinkId' in audioRef.current) {
        (audioRef.current as any).setSinkId(selectedSpeaker).catch(console.error);
      }
      
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Stop playback
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraPreview();
      stopRecording();
      stopPlayback();
    };
  }, []);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Devices</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  {user && <UserAvatar user={user} size="xl" showStatus={false} />}
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.name.split(' ')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.name.split(' ')[1]} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={user?.department} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Message</Label>
                  <Input id="status" placeholder="What are you working on?" />
                </div>

                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'email', label: 'Email notifications', description: 'Receive notifications via email' },
                  { key: 'desktop', label: 'Desktop notifications', description: 'Show desktop push notifications' },
                  { key: 'sound', label: 'Sound notifications', description: 'Play sound for new messages' },
                  { key: 'mentions', label: 'Mention notifications', description: 'Get notified when someone mentions you' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}

                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={themeMode} onValueChange={(value: 'light' | 'dark' | 'system') => setThemeMode(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">Sync with System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {themeMode === 'system' && 'Theme will automatically match your system preferences'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <div className="flex gap-3 flex-wrap">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.color}
                        className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                          selectedColor === scheme.color ? 'ring-primary' : 'ring-transparent hover:ring-muted-foreground'
                        }`}
                        style={{ backgroundColor: scheme.color }}
                        onClick={() => setSelectedColor(scheme.color)}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger className="w-full">
                      <Globe className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Audio & Video Settings</CardTitle>
                <CardDescription>Configure your camera and microphone for meetings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Microphone */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Microphone
                  </Label>
                  <Select value={selectedMic} onValueChange={setSelectedMic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioInputDevices.length > 0 ? (
                        audioInputDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No microphones found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speaker */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Speaker
                  </Label>
                  <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioOutputDevices.length > 0 ? (
                        audioOutputDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No speakers found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Audio Test Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                  <Label className="text-sm font-medium">Test Microphone & Speaker</Label>
                  <p className="text-xs text-muted-foreground">
                    Record for 8 seconds and play it back to test your audio devices
                  </p>
                  
                  {isRecording && (
                    <div className="space-y-2">
                      <Progress value={recordingProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Recording... {Math.round(recordingProgress / 12.5)}s / 8s
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={startRecording}
                        disabled={isPlaying}
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Record Test
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={stopRecording}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    )}
                    
                    {audioBlob && !isRecording && (
                      !isPlaying ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={playRecording}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Play Recording
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={stopPlayback}
                        >
                          <Square className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Camera */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Camera
                  </Label>
                  <Select 
                    value={selectedCamera} 
                    onValueChange={(value) => {
                      setSelectedCamera(value);
                      if (isPreviewActive) {
                        stopCameraPreview();
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoDevices.length > 0 ? (
                        videoDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No cameras found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Camera Preview */}
                <div className="space-y-3">
                  <div className="aspect-video rounded-lg bg-muted overflow-hidden relative">
                    {isPreviewActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Camera preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={isPreviewActive ? stopCameraPreview : startCameraPreview}
                    disabled={videoDevices.length === 0}
                  >
                    {isPreviewActive ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Stop Preview
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Preview
                      </>
                    )}
                  </Button>
                </div>

                {/* Screen Sharing Quality */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Screen Sharing Quality
                  </Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (360p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="high">High (1080p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active sessions</p>
                    <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>

                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
