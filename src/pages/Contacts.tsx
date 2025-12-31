import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/UserAvatar';
import { NewContactModal } from '@/components/modals/NewContactModal';
import { mockUsers } from '@/data/mockData';
import { Search, UserPlus, MessageSquare, Video, Phone, MoreVertical, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const firstLetter = user.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {} as Record<string, typeof mockUsers>);

  const statusFilters = [
    { value: null, label: 'All' },
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'busy', label: 'Busy' },
    { value: 'offline', label: 'Offline' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              {mockUsers.length} contacts • {mockUsers.filter(u => u.status === 'online').length} online
            </p>
          </div>
          <Button onClick={() => setContactModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border p-0.5">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={statusFilter === filter.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-6">
          {Object.entries(groupedUsers)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, users]) => (
              <div key={letter}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                  {letter}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <UserAvatar user={user} size="lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{user.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  'text-xs capitalize',
                                  user.status === 'online' && 'text-success',
                                  user.status === 'away' && 'text-warning',
                                  user.status === 'busy' && 'text-destructive',
                                  user.status === 'offline' && 'text-muted-foreground'
                                )}
                              >
                                {user.status}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{user.department}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="mr-2 h-3.5 w-3.5" />
                            Chat
                          </Button>
                          <Button variant="outline" size="icon-sm">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon-sm">
                            <Video className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <NewContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </AppLayout>
  );
}
