import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES, LEVELS, StudentLevel } from '@/types/schedule';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        title: 'Berhasil!',
        description: `Jadwal ${data.studentName} berhasil diperbarui.`,
      });
    } else {
      addEntry(data);
      toast({
        title: 'Berhasil!',
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <StatsCards schedule={schedule} />

        {/* Action Bar */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Jadwal Mingguan</h2>
              <p className="text-sm text-muted-foreground">
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
              className="shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jadwal
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCoach} onValueChange={(v) => setFilterCoach(v as Coach | 'all')}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Semua Coach" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Semua Coach</SelectItem>
                {COACHES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Semua Level" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="Little Creator">Little Creator</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Teenager">Teenager</SelectItem>
                <SelectItem value="Trial Class">Trial Class</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <ScheduleGrid
            getEntriesForCell={filteredGetEntriesForCell}
            onAddEntry={handleAddClick}
            onEditEntry={handleEditClick}
            onDeleteEntry={handleDeleteClick}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--coach-bani)/0.3)] border-l-4 border-[hsl(var(--coach-bani))]" />
            <span className="text-sm text-muted-foreground">Mr. Bani</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--coach-argy)/0.3)] border-l-4 border-[hsl(var(--coach-argy))]" />
            <span className="text-sm text-muted-foreground">Mr. Argy</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="level-badge level-little-creator">Little Creator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="level-badge level-junior">Junior</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="level-badge level-teenager">Teenager</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="level-badge level-trial">Trial Class</span>
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
