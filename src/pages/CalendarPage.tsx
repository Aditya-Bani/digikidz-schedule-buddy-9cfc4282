import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useHolidays, Holiday } from '@/hooks/useHolidays';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  return `${hari[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(year, 0, 1));

  const { holidays, loading, error } = useHolidays(year);

  const getHolidaysForDate = (date: Date): Holiday[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.filter((h) => h.date === dateStr);
  };

  const selectedHolidays = selectedDate ? getHolidaysForDate(selectedDate) : [];

  const holidaysByMonth = useMemo(() => {
    const grouped: Record<number, Holiday[]> = {};
    holidays.forEach((h) => {
      const month = new Date(h.date + 'T00:00:00').getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(h);
    });
    return grouped;
  }, [holidays]);

  const handleYearChange = (delta: number) => {
    const newYear = year + delta;
    setYear(newYear);
    setCalendarMonth(new Date(newYear, calendarMonth.getMonth(), 1));
    setSelectedDate(undefined);
  };

  const holidayDates = useMemo(() => {
    return holidays.map((h) => new Date(h.date + 'T00:00:00'));
  }, [holidays]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Title & Year Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Kalender Hari Libur Nasional
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-11">
              Daftar tanggal merah dan hari besar Indonesia
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleYearChange(-1)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
              {year}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleYearChange(1)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="mt-4 text-gray-600 dark:text-gray-400">Memuat data hari libur...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="flex items-center justify-center py-12 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Gagal memuat data: {error}</span>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1 border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pilih Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  className="p-3"
                  modifiers={{
                    holiday: holidayDates,
                  }}
                  modifiersClassNames={{
                    holiday: 'bg-red-600 text-white font-semibold hover:bg-red-700 rounded-lg',
                  }}
                />
              </CardContent>
              {selectedDate && selectedHolidays.length > 0 && (
                <CardContent className="pt-0 pb-4">
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                      {formatTanggal(selectedHolidays[0].date)}
                    </p>
                    {selectedHolidays.map((h, i) => (
                      <p key={i} className="text-sm text-gray-800 dark:text-gray-200">{h.localName}</p>
                    ))}
                  </div>
                </CardContent>
              )}
              {selectedDate && selectedHolidays.length === 0 && (
                <CardContent className="pt-0 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Tidak ada hari libur pada tanggal ini
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Holiday List */}
            <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <span>Daftar Hari Libur Nasional {year}</span>
                  <Badge className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                    {holidays.length} hari libur
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(holidaysByMonth)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([monthIdx, monthHolidays]) => (
                      <div key={monthIdx}>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                          {BULAN[Number(monthIdx)]}
                        </h3>
                        <div className="space-y-2">
                          {monthHolidays.map((holiday, i) => {
                            const date = new Date(holiday.date + 'T00:00:00');
                            const isSelected =
                              selectedDate &&
                              selectedDate.toDateString() === date.toDateString();
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                                }}
                                className={cn(
                                  'w-full text-left rounded-lg p-4 border transition-all',
                                  isSelected
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                      {holiday.localName}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {formatTanggal(holiday.date)}
                                    </p>
                                  </div>
                                  <Badge
                                    className={cn(
                                      "text-xs px-3 py-1 border-0",
                                      isSelected 
                                        ? "bg-red-600 text-white" 
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                    )}
                                  >
                                    Libur
                                  </Badge>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}