import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockMeetings, mockConversations, mockUsers } from '@/data/mockData';
import { Video, MessageSquare, Calendar, Users, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();

  const upcomingMeetings = mockMeetings.slice(0, 3);
  const recentChats = mockConversations.slice(0, 3);
  const onlineContacts = mockUsers.filter(u => u.status === 'online' && u.id !== user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening today
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Link>
          </Button>
          <Button asChild>
            <Link to="/meetings/new">
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Video, label: 'Upcoming Meetings', value: upcomingMeetings.length, color: 'text-primary' },
          { icon: MessageSquare, label: 'Unread Messages', value: recentChats.reduce((acc, c) => acc + c.unreadCount, 0), color: 'text-accent' },
          { icon: Users, label: 'Online Contacts', value: onlineContacts.length, color: 'text-success' },
          { icon: Clock, label: 'Next Meeting', value: '30 min', color: 'text-warning' },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your scheduled meetings for today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/meetings">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(meeting.startTime, 'h:mm a')} - {format(meeting.endTime, 'h:mm a')}
                      </p>
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
                      {meeting.participants.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                          +{meeting.participants.length - 3}
                        </div>
                      )}
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Chats</CardTitle>
              <CardDescription>Continue your conversations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/chat">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentChats.map((conversation) => {
                const otherUser = conversation.participants.find(p => p.id !== user?.id);
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                
                return (
                  <Link
                    key={conversation.id}
                    to={`/chat/${conversation.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    {otherUser && <UserAvatar user={otherUser} size="md" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{otherUser?.name}</h4>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Online Now</CardTitle>
          <CardDescription>Start a quick chat or call</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <UserAvatar user={contact} size="lg" />
                <div className="text-center">
                  <p className="font-medium text-sm">{contact.name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground">{contact.department}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
