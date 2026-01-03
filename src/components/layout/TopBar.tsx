import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { MeetingIcon } from '@/components/icons/MeetingIcon';
import { NewMeetingModal } from '@/components/modals/NewMeetingModal';
import { Sun, Moon, Plus } from 'lucide-react';

export function TopBar() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  const handleToggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  return (
    <>
      <header className="h-14 bg-primary flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <MeetingIcon className="h-8 w-8 text-primary-foreground" />
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setMeetingModalOpen(true)}
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 font-medium gap-2"
          >
            <Plus className="h-5 w-5" />
            New Meeting
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="rounded-full text-primary-foreground hover:bg-primary-foreground/10"
            title={`Theme: ${themeMode}`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <NewMeetingModal 
        open={meetingModalOpen} 
        onOpenChange={setMeetingModalOpen} 
      />
    </>
  );
}
