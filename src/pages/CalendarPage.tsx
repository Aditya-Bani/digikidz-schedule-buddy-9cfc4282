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

  // Create a set of holiday date strings for quick lookup
  const holidayDateSet = useMemo(() => {
    return new Set(holidays.map((h) => h.date));
  }, [holidays]);

  // Get holidays for a specific date
  const getHolidaysForDate = (date: Date): Holiday[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.filter((h) => h.date === dateStr);
  };

  // Holidays for selected date
  const selectedHolidays = selectedDate ? getHolidaysForDate(selectedDate) : [];

  // Group holidays by month for the list view
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

  // Custom day renderer to highlight holidays
  const holidayDates = useMemo(() => {
    return holidays.map((h) => new Date(h.date + 'T00:00:00'));
  }, [holidays]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Title & Year Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-primary" />
              Kalender Hari Libur Nasional
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Daftar tanggal merah dan hari besar Indonesia
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleYearChange(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-bold text-foreground min-w-[60px] text-center">{year}</span>
            <Button variant="outline" size="icon" onClick={() => handleYearChange(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Memuat data hari libur...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20 text-destructive">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>Gagal memuat data: {error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pilih Tanggal</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  className="p-3 pointer-events-auto"
                  modifiers={{
                    holiday: holidayDates,
                  }}
                  modifiersClassNames={{
                    holiday: 'bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90',
                  }}
                />
              </CardContent>
              {selectedDate && selectedHolidays.length > 0 && (
                <CardContent className="pt-0">
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm font-semibold text-destructive mb-1">
                      🎉 {formatTanggal(selectedHolidays[0].date)}
                    </p>
                    {selectedHolidays.map((h, i) => (
                      <p key={i} className="text-sm text-foreground">{h.localName}</p>
                    ))}
                  </div>
                </CardContent>
              )}
              {selectedDate && selectedHolidays.length === 0 && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground text-center">
                    Tidak ada hari libur pada tanggal ini.
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Holiday List */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Daftar Hari Libur Nasional {year}</span>
                  <Badge variant="secondary" className="text-xs">
                    {holidays.length} hari libur
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(holidaysByMonth)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([monthIdx, monthHolidays]) => (
                      <div key={monthIdx}>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
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
                                  'w-full text-left rounded-lg p-3 border transition-all duration-200 hover:shadow-sm',
                                  isSelected
                                    ? 'bg-destructive/10 border-destructive/30 shadow-sm'
                                    : 'bg-card border-border hover:bg-muted/50'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-sm text-foreground">
                                      {holiday.localName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {formatTanggal(holiday.date)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-destructive border-destructive/30"
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
