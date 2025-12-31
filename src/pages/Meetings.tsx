import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/UserAvatar';
import { mockMeetings } from '@/data/mockData';
import { Video, Plus, Search, Calendar, Clock, Users, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const copyMeetingLink = (meetingId: string) => {
    navigator.clipboard.writeText(`https://lync.app/meeting/${meetingId}`);
    toast({
      title: 'Link copied',
      description: 'Meeting link has been copied to clipboard.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-1">Schedule and join video meetings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/meeting-room">
                <Video className="mr-2 h-4 w-4" />
                Join with Code
              </Link>
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Start Instant Meeting</h3>
                <p className="text-sm text-muted-foreground">Create a meeting now</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Schedule Meeting</h3>
                <p className="text-sm text-muted-foreground">Plan for later</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Join External</h3>
                <p className="text-sm text-muted-foreground">Join from link</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {meeting.title}
                        {meeting.isRecurring && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Recurring</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(meeting.startTime, 'MMM d, h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {meeting.participants.length} participants
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {meeting.participants.slice(0, 3).map((participant) => (
                        <UserAvatar
                          key={participant.id}
                          user={participant}
                          size="sm"
                          showStatus={false}
                        />
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyMeetingLink(meeting.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/meeting-room">Join</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
