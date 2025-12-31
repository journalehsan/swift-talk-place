import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMeetings, mockCalendarEvents } from '@/data/mockData';
import { ChevronLeft, ChevronRight, Plus, Video, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPrevious = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter(event => isSameDay(event.start, day));
  };

  const todayEvents = mockMeetings.filter(meeting => 
    isSameDay(meeting.startTime, selectedDate)
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">Manage your schedule and meetings</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-xl">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={goToPrevious}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={goToNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <div className="flex rounded-lg border border-border p-0.5">
                    {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                      <Button
                        key={mode}
                        variant={viewMode === mode ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode(mode)}
                        className="capitalize"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const events = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'min-h-24 p-2 rounded-lg text-left transition-colors border border-transparent',
                        isCurrentMonth ? 'bg-background hover:bg-muted' : 'bg-muted/30 text-muted-foreground',
                        isSelected && 'border-primary bg-primary/5',
                        isToday && 'ring-2 ring-primary ring-inset'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
                          isToday && 'bg-primary text-primary-foreground font-medium'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-1">
                        {events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded truncate',
                              event.type === 'meeting' && 'bg-primary/20 text-primary',
                              event.type === 'task' && 'bg-warning/20 text-warning-foreground'
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1.5">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No meetings scheduled</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 h-3 w-3" />
                    Add Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{meeting.title}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(meeting.startTime, 'h:mm a')} - {format(meeting.endTime, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Join Meeting
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
