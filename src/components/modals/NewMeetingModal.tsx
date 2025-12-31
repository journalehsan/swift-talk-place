import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/UserAvatar';
import { mockUsers } from '@/data/mockData';
import { Video, Link, Calendar, Clock, Users, X, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface NewMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

interface ParticipantWithAvailability extends User {
  isAvailable: boolean;
}

export function NewMeetingModal({ open, onOpenChange, selectedDate }: NewMeetingModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedule' | 'instant'>('schedule');
  
  // Schedule meeting state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantWithAvailability[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Instant meeting state
  const [instantMeetingLink, setInstantMeetingLink] = useState('');
  const [instantMeetingGenerated, setInstantMeetingGenerated] = useState(false);

  const availableUsers = mockUsers.filter(
    user => 
      !selectedParticipants.some(p => p.id === user.id) &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock function to check user availability
  const checkUserAvailability = (user: User): boolean => {
    // Simulate checking availability - in real app this would check against user's calendar
    // For demo, users with 'busy' status are not available
    return user.status !== 'busy';
  };

  const addParticipant = (user: User) => {
    const isAvailable = checkUserAvailability(user);
    setSelectedParticipants([...selectedParticipants, { ...user, isAvailable }]);
    setSearchQuery('');
  };

  const removeParticipant = (userId: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== userId));
  };

  const handleScheduleMeeting = () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a meeting title.',
        variant: 'destructive',
      });
      return;
    }

    const hasConflicts = selectedParticipants.some(p => !p.isAvailable);
    if (hasConflicts) {
      toast({
        title: 'Scheduling conflict',
        description: 'Some participants are not available at this time. Please adjust the time or remove conflicting participants.',
        variant: 'destructive',
      });
      return;
    }

    // Here you would send the meeting data to the API
    toast({
      title: 'Meeting scheduled',
      description: `"${title}" has been scheduled successfully.`,
    });
    
    resetForm();
    onOpenChange(false);
  };

  const generateInstantMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 10);
    setInstantMeetingLink(`https://lync.app/meeting/${meetingId}`);
    setInstantMeetingGenerated(true);
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(instantMeetingLink);
    toast({
      title: 'Link copied',
      description: 'Meeting link has been copied to clipboard.',
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setDuration('30');
    setSelectedParticipants([]);
    setSearchQuery('');
    setInstantMeetingLink('');
    setInstantMeetingGenerated(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Re-check availability when date/time changes
  const handleTimeChange = (newTime: string) => {
    setStartTime(newTime);
    // Re-evaluate availability for all participants
    setSelectedParticipants(prev => 
      prev.map(p => ({ ...p, isAvailable: checkUserAvailability(p) }))
    );
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    // Re-evaluate availability for all participants
    setSelectedParticipants(prev => 
      prev.map(p => ({ ...p, isAvailable: checkUserAvailability(p) }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            New Meeting
          </DialogTitle>
          <DialogDescription>
            Schedule a meeting or create an instant meeting link
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'schedule' | 'instant')} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="instant" className="gap-2">
              <Link className="h-4 w-4" />
              Instant Meeting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                placeholder="Enter meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add meeting description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </Label>
              
              {/* Selected Participants */}
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-muted/30">
                  {selectedParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-full text-sm transition-colors',
                        participant.isAvailable 
                          ? 'bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300' 
                          : 'bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300'
                      )}
                    >
                      <UserAvatar user={participant} size="sm" showStatus={false} />
                      <span className="font-medium">{participant.name}</span>
                      {participant.isAvailable ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.id)}
                        className="hover:bg-background/50 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Participant hint */}
              {selectedParticipants.some(p => !p.isAvailable) && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Red participants are busy at this time. Please change the time or remove them.
                </p>
              )}

              {/* Search Users */}
              <div className="relative">
                <Input
                  placeholder="Search users to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && availableUsers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-auto">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addParticipant(user)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors"
                      >
                        <UserAvatar user={user} size="sm" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instant" className="space-y-4 mt-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              
              {!instantMeetingGenerated ? (
                <>
                  <h3 className="font-semibold text-lg mb-2">Create Instant Meeting</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Generate a meeting link that you can share with anyone to join immediately
                  </p>
                  <Button onClick={generateInstantMeeting} size="lg">
                    <Link className="mr-2 h-4 w-4" />
                    Generate Meeting Link
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-2">Your Meeting is Ready!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Share this link with participants
                  </p>
                  
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                    <Input
                      value={instantMeetingLink}
                      readOnly
                      className="bg-transparent border-0 text-center font-mono text-sm"
                    />
                    <Button variant="ghost" size="icon" onClick={copyMeetingLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={copyMeetingLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button onClick={() => window.open('/meeting-room', '_blank')}>
                      <Video className="mr-2 h-4 w-4" />
                      Start Meeting
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {activeTab === 'schedule' && (
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeeting}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
