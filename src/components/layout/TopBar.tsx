import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { MeetingIcon } from '@/components/icons/MeetingIcon';
import { NewMeetingModal } from '@/components/modals/NewMeetingModal';
import { Sun, Moon } from 'lucide-react';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex-1" />
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setMeetingModalOpen(true)}
            className="bg-[#ffcc00] hover:bg-[#e6b800] text-black font-medium gap-2"
          >
            <MeetingIcon className="h-5 w-5" />
            New Meeting
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
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
