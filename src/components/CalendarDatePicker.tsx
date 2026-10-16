import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, Sparkles } from 'lucide-react';
import { calculateAge, getAgeCategory, formatDateDMY } from '../utils/church-logic.ts';

interface CalendarDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  value,
  onChange,
  label = 'Tanggal Lahir',
  required = true,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Parse initial date
  const parsedDate = value ? new Date(value) : new Date(1995, 0, 1);
  const initialYear = !isNaN(parsedDate.getFullYear()) ? parsedDate.getFullYear() : 1995;
  const initialMonth = !isNaN(parsedDate.getMonth()) ? parsedDate.getMonth() : 0;
  const initialDay = !isNaN(parsedDate.getDate()) ? parsedDate.getDate() : 1;

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y)) setCurrentYear(y);
        if (!isNaN(m)) setCurrentMonth(m);
      }
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute calendar days for currentMonth & currentYear
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const isoString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => Math.max(minYear, prev - 1));
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => Math.min(maxYear, prev + 1));
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpYear = (delta: number) => {
    setCurrentYear((prev) => Math.min(maxYear, Math.max(minYear, prev + delta)));
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentYear(y);
    setCurrentMonth(today.getMonth());
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const triggerNativePicker = () => {
    if (nativeInputRef.current) {
      try {
        if ('showPicker' in nativeInputRef.current) {
          (nativeInputRef.current as any).showPicker();
        } else {
          (nativeInputRef.current as HTMLInputElement).focus();
        }
      } catch (err) {
        setIsOpen(true);
      }
    }
  };

  // Year choices array
  const yearOptions: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  // Selected date parsed
  const selectedYear = value ? parseInt(value.split('-')[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1], 10) - 1 : null;
  const selectedDay = value ? parseInt(value.split('-')[2], 10) : null;

  const calculatedAge = value ? calculateAge(value) : null;
  const ageCategory = value ? getAgeCategory(calculatedAge || 0) : null;

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block font-semibold text-slate-300 text-xs">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
        {calculatedAge !== null && (
          <span className="text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {calculatedAge} Thn · {ageCategory}
          </span>
        )}
      </div>

      {/* Trigger Button that opens calendar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex-1 flex items-center justify-between px-3 py-2 bg-[#050811] border rounded-lg text-xs transition-colors ${
            isOpen
              ? 'border-amber-400 ring-1 ring-amber-400 text-amber-300'
              : 'border-slate-700 text-white hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-sm tracking-wide">
              {value ? formatDateDMY(value) : 'Pilih dari Kalender...'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40">
            Sistem Kalender Otomatis
          </span>
        </button>

        {/* Fallback hidden native input for system picker */}
        <input
          ref={nativeInputRef}
          type="date"
          value={value || ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={triggerNativePicker}
          title="Buka Kalender Native OS"
          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs transition-colors shrink-0"
        >
          OS 📅
        </button>
      </div>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-80 p-4 bg-[#0a1124] border-2 border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md">
          {/* Calendar Header with Year & Month Selection */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleJumpYear(-5)}
                title="Mundur 5 Tahun"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Bulan Sebelumnya"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Month Selector */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                className="bg-[#050811] text-amber-300 text-xs font-semibold px-2 py-1 rounded border border-slate-700 outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="bg-[#050811] text-amber-300 text-xs font-mono font-bold px-2 py-1 rounded border border-slate-700 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                title="Bulan Berikutnya"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleJumpYear(5)}
                title="Maju 5 Tahun"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d, i) => (
              <span
                key={d}
                className={`text-[10px] font-bold ${
                  i === 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for start offset */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Days 1 to N */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                selectedYear === currentYear &&
                selectedMonth === currentMonth &&
                selectedDay === day;

              const isSunday = (firstDayIndex + idx) % 7 === 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 text-xs font-mono rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30 ring-2 ring-amber-300'
                      : isSunday
                      ? 'text-rose-400 hover:bg-slate-800'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleToday}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
