import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityReport {
  id: string;
  studentName: string;
  date: string;
  level: string;
  lessonWeek: number;
  lessonName: string;
  tools: string;
  coach: string;
  coachComment: string;
  mediaUrls: string[];
  createdAt: string;
}

interface DbReport {
  id: string;
  student_name: string;
  date: string;
  level: string;
  lesson_week: number;
  lesson_name: string;
  tools: string | null;
  coach: string;
  coach_comment: string | null;
  media_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

function dbToApp(row: DbReport): ActivityReport {
  return {
    id: row.id,
    studentName: row.student_name,
    date: row.date,
    level: row.level,
    lessonWeek: row.lesson_week,
    lessonName: row.lesson_name,
    tools: row.tools || '',
    coach: row.coach,
    coachComment: row.coach_comment || '',
    mediaUrls: row.media_urls || [],
    createdAt: row.created_at,
  };
}

export function useActivityReports(studentName?: string) {
  const [reports, setReports] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    let query = supabase
      .from('activity_reports')
      .select('*')
      .order('date', { ascending: false });

    if (studentName) {
      query = query.eq('student_name', studentName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      toast({ title: 'Error', description: 'Gagal memuat laporan.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setReports((data as DbReport[]).map(dbToApp));
    setLoading(false);
  }, [studentName, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const addReport = useCallback(async (report: Omit<ActivityReport, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('activity_reports')
      .insert({
        student_name: report.studentName,
        date: report.date,
        level: report.level,
        lesson_week: report.lessonWeek,
        lesson_name: report.lessonName,
        tools: report.tools || null,
        coach: report.coach,
        coach_comment: report.coachComment || null,
        media_urls: report.mediaUrls,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding report:', error);
      toast({ title: 'Error', description: 'Gagal menambahkan laporan.', variant: 'destructive' });
      return;
    }

    setReports((prev) => [dbToApp(data as DbReport), ...prev]);
    return data;
  }, [toast]);

  const deleteReport = useCallback(async (id: string) => {
    const { error } = await supabase.from('activity_reports').delete().eq('id', id);
    if (error) {
      console.error('Error deleting report:', error);
      toast({ title: 'Error', description: 'Gagal menghapus laporan.', variant: 'destructive' });
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, [toast]);

  return { reports, loading, addReport, deleteReport, refetch: fetchReports };
}

export function useAccessCodes() {
  const [codes, setCodes] = useState<{ id: string; studentName: string; accessCode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCodes = useCallback(async () => {
    const { data, error } = await supabase
      .from('student_access_codes')
      .select('*')
      .order('student_name');

    if (error) {
      console.error('Error fetching codes:', error);
      setLoading(false);
      return;
    }

    setCodes(
      (data || []).map((r: any) => ({
        id: r.id,
        studentName: r.student_name,
        accessCode: r.access_code,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCode = useCallback(async (studentName: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('student_access_codes')
      .insert({ student_name: studentName, access_code: code })
      .select()
      .single();

    if (error) {
      console.error('Error generating code:', error);
      toast({ title: 'Error', description: 'Gagal membuat kode akses.', variant: 'destructive' });
      return;
    }

    setCodes((prev) => [...prev, { id: data.id, studentName: data.student_name, accessCode: data.access_code }]);
    return data.access_code;
  }, [toast]);

  const deleteCode = useCallback(async (id: string) => {
    const { error } = await supabase.from('student_access_codes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Gagal menghapus kode akses.', variant: 'destructive' });
      return;
    }
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }, [toast]);

  const lookupByCode = useCallback(async (code: string) => {
    const { data, error } = await supabase
      .from('student_access_codes')
      .select('*')
      .eq('access_code', code.toUpperCase())
      .maybeSingle();

    if (error || !data) return null;
    return { studentName: data.student_name, accessCode: data.access_code };
  }, []);

  return { codes, loading, generateCode, deleteCode, lookupByCode };
}

export async function uploadReportMedia(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from('report-media').upload(path, file);
  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from('report-media').getPublicUrl(path);
  return data.publicUrl;
}
