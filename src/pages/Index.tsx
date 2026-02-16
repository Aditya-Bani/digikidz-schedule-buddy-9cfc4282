import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES, LEVELS } from '@/types/schedule';
import { Plus, Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Index = () => {
  const { schedule, addEntry, updateEntry, deleteEntry, getEntriesForCell } = useSchedule();
  const { toast } = useToast();

  const [filterCoach, setFilterCoach] = useState<Coach | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredGetEntriesForCell = useCallback(
    (day: DayOfWeek, time: TimeSlot) => {
      return getEntriesForCell(day, time).filter((entry) => {
        const matchCoach = filterCoach === 'all' || entry.coach === filterCoach;
        const matchLevel =
          filterLevel === 'all' ||
          (filterLevel === 'Little Creator' && entry.level.startsWith('Little Creator')) ||
          (filterLevel === 'Junior' && entry.level.startsWith('Junior')) ||
          (filterLevel === 'Teenager' && entry.level.startsWith('Teenager')) ||
          (filterLevel === 'Trial Class' && entry.level === 'Trial Class');
        return matchCoach && matchLevel;
      });
    },
    [getEntriesForCell, filterCoach, filterLevel]
  );

  const hasActiveFilter = filterCoach !== 'all' || filterLevel !== 'all';

  const clearFilters = () => {
    setFilterCoach('all');
    setFilterLevel('all');
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [defaultDay, setDefaultDay] = useState<DayOfWeek>('senin');
  const [defaultTime, setDefaultTime] = useState<TimeSlot>('08:00');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<ScheduleEntry | null>(null);

  const handleAddClick = (day: DayOfWeek, time: TimeSlot) => {
    setEditingEntry(null);
    setDefaultDay(day);
    setDefaultTime(time);
    setDialogOpen(true);
  };

  const handleEditClick = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const entry = schedule.find((e) => e.id === id);
    if (entry) {
      setDeletingEntry(entry);
      setDeleteDialogOpen(true);
    }
  };

  const handleSave = (data: Omit<ScheduleEntry, 'id'>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, data);
      toast({
        title: 'Berhasil',
        description: `Jadwal ${data.studentName} berhasil diperbarui.`,
      });
    } else {
      addEntry(data);
      toast({
        title: 'Berhasil',
        description: `Jadwal ${data.studentName} berhasil ditambahkan.`,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
      toast({
        title: 'Dihapus',
        description: `Jadwal ${deletingEntry.studentName} berhasil dihapus.`,
        variant: 'destructive',
      });
      setDeletingEntry(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8">
          <StatsCards schedule={schedule} />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                Jadwal Mingguan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-10">
                Klik pada sel untuk menambah atau mengedit jadwal murid
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingEntry(null);
                setDefaultDay('senin');
                setDefaultTime('08:00');
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jadwal
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <Select value={filterCoach} onValueChange={(v) => setFilterCoach(v as Coach | 'all')}>
              <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="Semua Coach" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg z-50">
                <SelectItem value="all">Semua Coach</SelectItem>
                {COACHES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[200px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="Semua Level" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg z-50">
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="Little Creator">Little Creator</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Teenager">Teenager</SelectItem>
                <SelectItem value="Trial Class">Trial Class</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  Filter aktif
                </span>
              </>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ScheduleGrid
            getEntriesForCell={filteredGetEntriesForCell}
            onAddEntry={handleAddClick}
            onEditEntry={handleEditClick}
            onDeleteEntry={handleDeleteClick}
          />
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Legenda
          </h3>
          <div className="flex flex-wrap gap-8 items-center justify-center">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Coach</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[hsl(var(--coach-bani)/0.2)] border-l-4 border-[hsl(var(--coach-bani))]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mr. Bani</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[hsl(var(--coach-argy)/0.2)] border-l-4 border-[hsl(var(--coach-argy))]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mr. Argy</span>
                </div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Level</p>
              <div className="flex flex-wrap gap-3">
                <span className="level-badge level-little-creator">Little Creator</span>
                <span className="level-badge level-junior">Junior</span>
                <span className="level-badge level-teenager">Teenager</span>
                <span className="level-badge level-trial">Trial Class</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        defaultDay={defaultDay}
        defaultTime={defaultTime}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        studentName={deletingEntry?.studentName}
      />
    </div>
  );
};

export default Index;