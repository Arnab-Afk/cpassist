interface CalendarDay {
  date: string;
  count: number;
}

interface CalendarDayWithDay {
  day: number;
  count: number;
  date: string;
}

interface StreakCalendarProps {
  data: CalendarDay[];
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export default function StreakCalendar({ 
  data, 
  currentStreak, 
  longestStreak, 
  className = "" 
}: StreakCalendarProps) {
  // Helper to get cell background color based on count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count < 2) return "bg-green-100";
    if (count < 4) return "bg-green-300";
    return "bg-green-500";
  };
  
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Generate days for the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Create calendar grid
  const calendarDays: (CalendarDayWithDay | null)[] = [];
  
  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const dayData = data.find(d => d.date === dateStr);
    calendarDays.push({
      day: i,
      count: dayData ? dayData.count : 0,
      date: dateStr
    });
  }
  
  // Calculate weeks
  const weeks: (CalendarDayWithDay | null)[][] = [];
  let week: (CalendarDayWithDay | null)[] = [];
  
  calendarDays.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
      // Fill the rest of the last week with null
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
      week = [];
    }
  });
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className={`border-2 border-border rounded-base p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Your Coding Streak</h3>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-sm text-foreground/70">Current</div>
            <div className="text-xl font-bold">{currentStreak} days</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-foreground/70">Longest</div>
            <div className="text-xl font-bold">{longestStreak} days</div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((day, i) => (
              <div key={i} className="text-xs text-center text-foreground/70">
                {day}
              </div>
            ))}
          </div>
          
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`
                    aspect-square rounded-sm flex items-center justify-center 
                    ${!day ? 'bg-transparent' : getCellColor(day.count)}
                    ${day && day.day === now.getDate() ? 'ring-2 ring-main' : ''}
                  `}
                  title={day ? `${day.date}: ${day.count} problems solved` : ''}
                >
                  {day && (
                    <span className="text-xs">{day.day}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 flex justify-end gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-gray-100 mr-1"></div>
          <span className="text-xs">0</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-green-100 mr-1"></div>
          <span className="text-xs">1</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-green-300 mr-1"></div>
          <span className="text-xs">2-3</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-green-500 mr-1"></div>
          <span className="text-xs">4+</span>
        </div>
      </div>
    </div>
  );
}
