import { useState, useCallback, useEffect } from 'react';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, StudentLevel } from '@/types/schedule';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DbScheduleEntry {
  id: string;
  student_name: string;
  coach: string;
  level: string;
  day: string;
  time: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function dbToApp(row: DbScheduleEntry): ScheduleEntry {
  return {
    id: row.id,
    studentName: row.student_name,
    coach: row.coach as Coach,
    level: row.level as StudentLevel,
    day: row.day as DayOfWeek,
    time: row.time as TimeSlot,
    notes: row.notes || undefined,
  };
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all entries from DB
  const fetchSchedule = useCallback(async () => {
    const { data, error } = await supabase
      .from('schedule_entries')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat jadwal dari database.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((data as DbScheduleEntry[]).map(dbToApp));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const addEntry = useCallback(async (entry: Omit<ScheduleEntry, 'id'>) => {
    const { data, error } = await supabase
      .from('schedule_entries')
      .insert({
        student_name: entry.studentName,
        coach: entry.coach,
        level: entry.level,
        day: entry.day,
        time: entry.time,
        notes: entry.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding entry:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan jadwal.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) => [...prev, dbToApp(data as DbScheduleEntry)]);
  }, [toast]);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<ScheduleEntry, 'id'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.studentName !== undefined) dbUpdates.student_name = updates.studentName;
    if (updates.coach !== undefined) dbUpdates.coach = updates.coach;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.day !== undefined) dbUpdates.day = updates.day;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

    const { error } = await supabase
      .from('schedule_entries')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating entry:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui jadwal.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  }, [toast]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus jadwal.',
        variant: 'destructive',
      });
      return;
    }

    setSchedule((prev) => prev.filter((entry) => entry.id !== id));
  }, [toast]);

  const getEntriesForCell = useCallback(
    (day: DayOfWeek, time: TimeSlot) => {
      return schedule.filter((entry) => entry.day === day && entry.time === time);
    },
    [schedule]
  );

  return {
    schedule,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForCell,
  };
}
