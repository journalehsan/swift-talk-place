import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video,
  Play,
  Download,
  Trash2,
  Search,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Filter,
  X,
  ArrowUpDown,
  CalendarDays,
  Timer,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock recordings data
const mockRecordings = [
  {
    id: '1',
    title: 'Daily Standup - Product Team',
    date: '2024-01-15',
    time: '10:30 AM',
    duration: '28:45',
    participants: ['Sarah Mitchell', 'Michael Chen', 'Emily Rodriguez', 'David Kim'],
    size: '156 MB',
    thumbnail: null,
    category: 'standup',
  },
  {
    id: '2',
    title: 'Client Presentation - Q1 Review',
    date: '2024-01-14',
    time: '2:00 PM',
    duration: '1:15:22',
    participants: ['John Smith', 'Sarah Mitchell', 'External Client'],
    size: '420 MB',
    thumbnail: null,
    category: 'presentation',
  },
  {
    id: '3',
    title: 'Weekly All-Hands Meeting',
    date: '2024-01-12',
    time: '9:00 AM',
    duration: '45:10',
    participants: ['CEO', 'All Team Members'],
    size: '245 MB',
    thumbnail: null,
    category: 'all-hands',
  },
  {
    id: '4',
    title: 'Design Review Session',
    date: '2024-01-10',
    time: '3:30 PM',
    duration: '52:30',
    participants: ['Emily Rodriguez', 'David Kim', 'UX Team'],
    size: '312 MB',
    thumbnail: null,
    category: 'review',
  },
  {
    id: '5',
    title: 'Sprint Planning - Iteration 42',
    date: '2024-01-08',
    time: '11:00 AM',
    duration: '1:30:00',
    participants: ['Development Team', 'Product Owner'],
    size: '520 MB',
    thumbnail: null,
    category: 'planning',
  },
];

type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc' | 'size-desc' | 'size-asc';
type DurationFilter = 'all' | 'short' | 'medium' | 'long';
type DateFilter = 'all' | 'today' | 'week' | 'month';

const categories = [
  { id: 'standup', label: 'Daily Standup' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'all-hands', label: 'All-Hands' },
  { id: 'review', label: 'Review Session' },
  { id: 'planning', label: 'Planning' },
];

export default function Recordings() {
  const [recordings, setRecordings] = useState(mockRecordings);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  // Parse duration to minutes
  const parseDuration = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
    }
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
  };

  // Parse size to MB
  const parseSize = (size: string): number => {
    return parseInt(size.replace(' MB', ''));
  };

  // Apply filters
  const filteredRecordings = recordings
    .filter(rec => {
      // Search filter
      const matchesSearch = 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(rec.category);
      
      // Duration filter
      const duration = parseDuration(rec.duration);
      let matchesDuration = true;
      if (durationFilter === 'short') matchesDuration = duration < 30;
      else if (durationFilter === 'medium') matchesDuration = duration >= 30 && duration < 60;
      else if (durationFilter === 'long') matchesDuration = duration >= 60;
      
      // Date filter
      const recordingDate = new Date(rec.date);
      const now = new Date();
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = recordingDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = recordingDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = recordingDate >= monthAgo;
      }
      
      return matchesSearch && matchesCategory && matchesDuration && matchesDate;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'duration-asc':
          return parseDuration(a.duration) - parseDuration(b.duration);
        case 'duration-desc':
          return parseDuration(b.duration) - parseDuration(a.duration);
        case 'size-asc':
          return parseSize(a.size) - parseSize(b.size);
        case 'size-desc':
          return parseSize(b.size) - parseSize(a.size);
        default:
          return 0;
      }
    });

  const activeFiltersCount = 
    (selectedCategories.length > 0 ? 1 : 0) + 
    (durationFilter !== 'all' ? 1 : 0) + 
    (dateFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategories([]);
    setDurationFilter('all');
    setDateFilter('all');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDelete = (id: string) => {
    setSelectedRecording(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecording) {
      setRecordings(prev => prev.filter(r => r.id !== selectedRecording));
      toast.success('Recording deleted successfully');
    }
    setDeleteDialogOpen(false);
    setSelectedRecording(null);
  };

  const handlePlay = (id: string) => {
    toast.info('Playing recording... (Demo mode)');
  };

  const handleDownload = (id: string) => {
    toast.info('Downloading recording... (Demo mode)');
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Recordings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                View and manage your meeting recordings
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {recordings.length} recordings • {(recordings.reduce((acc, r) => {
                const mb = parseInt(r.size);
                return acc + mb;
              }, 0) / 1024).toFixed(1)} GB used
            </Badge>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Popover */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter size={16} className="mr-2" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-auto py-1 px-2 text-xs text-muted-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Categories */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </Label>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label 
                            htmlFor={category.id} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Duration */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Timer size={14} />
                      Duration
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'all', label: 'All' },
                        { value: 'short', label: '< 30 min' },
                        { value: 'medium', label: '30-60 min' },
                        { value: 'long', label: '> 60 min' },
                      ].map(option => (
                        <Button
                          key={option.value}
                          variant={durationFilter === option.value ? 'default' : 'outline'}
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setDurationFilter(option.value as DurationFilter)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <CalendarDays size={14} />
                      Date Range
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'all', label: 'All Time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                      ].map(option => (
                        <Button
                          key={option.value}
                          variant={dateFilter === option.value ? 'default' : 'outline'}
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setDateFilter(option.value as DateFilter)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/50">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => setFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown size={16} className="mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'date-desc'}
                  onCheckedChange={() => setSortOption('date-desc')}
                >
                  Date (Newest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'date-asc'}
                  onCheckedChange={() => setSortOption('date-asc')}
                >
                  Date (Oldest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'duration-desc'}
                  onCheckedChange={() => setSortOption('duration-desc')}
                >
                  Duration (Longest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'duration-asc'}
                  onCheckedChange={() => setSortOption('duration-asc')}
                >
                  Duration (Shortest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'size-desc'}
                  onCheckedChange={() => setSortOption('size-desc')}
                >
                  Size (Largest first)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={sortOption === 'size-asc'}
                  onCheckedChange={() => setSortOption('size-asc')}
                >
                  Size (Smallest first)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {selectedCategories.map(catId => {
                const cat = categories.find(c => c.id === catId);
                return (
                  <Badge key={catId} variant="secondary" className="text-xs gap-1">
                    {cat?.label}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-destructive" 
                      onClick={() => toggleCategory(catId)}
                    />
                  </Badge>
                );
              })}
              {durationFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Duration: {durationFilter === 'short' ? '< 30 min' : durationFilter === 'medium' ? '30-60 min' : '> 60 min'}
                  <X 
                    size={12} 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => setDurationFilter('all')}
                  />
                </Badge>
              )}
              {dateFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Date: {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}
                  <X 
                    size={12} 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => setDateFilter('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Recordings List */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {filteredRecordings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Video size={48} className="text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No recordings found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'Try a different search term' : 'Your recorded meetings will appear here'}
                </p>
              </div>
            ) : (
              filteredRecordings.map((recording) => (
                <Card
                  key={recording.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-40 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 relative group cursor-pointer"
                      onClick={() => handlePlay(recording.id)}
                    >
                      <Video size={32} className="text-muted-foreground" />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={32} className="text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate mb-2">
                        {recording.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{recording.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{recording.time} • {recording.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span>{recording.participants.length} participants</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {recording.participants.slice(0, 3).map((p, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                        {recording.participants.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recording.participants.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Size and Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-muted-foreground">{recording.size}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlay(recording.id)}
                        title="Play"
                      >
                        <Play size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(recording.id)}
                        title="Download"
                      >
                        <Download size={18} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePlay(recording.id)}>
                            <Play size={16} className="mr-2" />
                            Play
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(recording.id)}>
                            <Download size={16} className="mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(recording.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recording? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
