'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface TimeSlot {
  hour: number;
  label: string;
}

interface AvailabilitySlot {
  date: string;
  timeSlots: number[];
}

interface AvailabilityCalendarProps {
  selectedAvailability: AvailabilitySlot[];
  onAvailabilityChange: (availability: AvailabilitySlot[]) => void;
  mode?: 'select' | 'respond' | 'confirm';
  existingAvailability?: AvailabilitySlot[];
  className?: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { hour: 9, label: '9:00 AM' },
  { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' },
  { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '1:00 PM' },
  { hour: 14, label: '2:00 PM' },
  { hour: 15, label: '3:00 PM' },
  { hour: 16, label: '4:00 PM' },
  { hour: 17, label: '5:00 PM' },
  { hour: 18, label: '6:00 PM' },
  { hour: 19, label: '7:00 PM' }
];

export default function AvailabilityCalendar({
  selectedAvailability,
  onAvailabilityChange,
  mode = 'select',
  existingAvailability = [],
  className = ''
}: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Get the start of the current week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Generate 7 days starting from Monday
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isTimeSlotSelected = (date: string, hour: number) => {
    const dayAvailability = selectedAvailability.find(a => a.date === date);
    return dayAvailability?.timeSlots.includes(hour) || false;
  };

  const isTimeSlotAvailable = (date: string, hour: number) => {
    if (mode === 'select') return true;
    const dayAvailability = existingAvailability.find(a => a.date === date);
    return dayAvailability?.timeSlots.includes(hour) || false;
  };

  const toggleTimeSlot = (date: string, hour: number) => {
    if (mode === 'respond' && !isTimeSlotAvailable(date, hour)) return;
    
    const newAvailability = [...selectedAvailability];
    const dayIndex = newAvailability.findIndex(a => a.date === date);
    
    if (dayIndex >= 0) {
      const timeSlots = [...newAvailability[dayIndex].timeSlots];
      const slotIndex = timeSlots.indexOf(hour);
      
      if (slotIndex >= 0) {
        timeSlots.splice(slotIndex, 1);
      } else {
        timeSlots.push(hour);
        timeSlots.sort();
      }
      
      if (timeSlots.length === 0) {
        newAvailability.splice(dayIndex, 1);
      } else {
        newAvailability[dayIndex].timeSlots = timeSlots;
      }
    } else {
      newAvailability.push({ date, timeSlots: [hour] });
    }
    
    onAvailabilityChange(newAvailability);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  return (
    <div className={`bg-white border border-vintage-gold/30 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vintage-accent" />
          <h3 className="text-lg font-heading font-bold text-vintage-dark">
            {mode === 'select' && 'Select Your Availability'}
            {mode === 'respond' && 'Choose Available Times'}
            {mode === 'confirm' && 'Confirm Meeting Time'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateWeek('prev')}
            className="px-3 py-1 text-sm bg-vintage-cream hover:bg-vintage-gold/20 rounded transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm font-bold text-vintage-dark px-3">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() => navigateWeek('next')}
            className="px-3 py-1 text-sm bg-vintage-cream hover:bg-vintage-gold/20 rounded transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {/* Header row */}
        <div className="text-center text-sm font-bold text-vintage-dark py-2">
          <Clock className="w-4 h-4 mx-auto" />
        </div>
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-bold text-vintage-dark py-2">
            <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-xs text-vintage-dark/60">
              {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {TIME_SLOTS.map((timeSlot) => (
          <div key={timeSlot.hour} className="contents">
            <div className="text-xs text-vintage-dark/80 py-2 text-center font-medium">
              {timeSlot.label}
            </div>
            {weekDays.map((day, dayIndex) => {
              const dateStr = formatDate(day);
              const isSelected = isTimeSlotSelected(dateStr, timeSlot.hour);
              const isAvailable = isTimeSlotAvailable(dateStr, timeSlot.hour);
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <button
                  key={`${dayIndex}-${timeSlot.hour}`}
                  type="button"
                  onClick={() => !isPast && toggleTimeSlot(dateStr, timeSlot.hour)}
                  disabled={isPast || (mode === 'respond' && !isAvailable)}
                  className={`
                    h-8 text-xs rounded transition-all
                    ${isPast 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : mode === 'respond' && !isAvailable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-vintage-green text-white hover:bg-vintage-dark'
                          : 'bg-vintage-cream hover:bg-vintage-gold/30 text-vintage-dark'
                    }
                  `}
                >
                  {isSelected ? '✓' : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected summary */}
      {selectedAvailability.length > 0 && (
        <div className="mt-6 p-4 bg-vintage-cream/50 rounded-lg">
          <h4 className="text-sm font-bold text-vintage-dark mb-2">Selected Times:</h4>
          <div className="text-sm text-vintage-dark/80 space-y-1">
            {selectedAvailability.map((day) => (
              <div key={day.date}>
                <strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}:</strong>{' '}
                {day.timeSlots.map(hour => TIME_SLOTS.find(t => t.hour === hour)?.label).join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}