import { useState } from 'react';
import { Header } from '@/components/Header';
import { useActivityReports, useAccessCodes, uploadReportMedia, ActivityReport } from '@/hooks/useActivityReports';
import { COACHES, LEVELS, Coach } from '@/types/schedule';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Upload, FileText, Key, Pencil, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ReportForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<ActivityReport>;
  onSubmit: (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => Promise<void>;
  submitLabel: string;
}) {
  const [studentName, setStudentName] = useState(initial?.studentName || '');
  const [date, setDate] = useState(initial?.date || '');
  const [level, setLevel] = useState(initial?.level || '');
  const [lessonWeek, setLessonWeek] = useState(initial?.lessonWeek?.toString() || '');
  const [lessonName, setLessonName] = useState(initial?.lessonName || '');
  const [tools, setTools] = useState(initial?.tools || '');
  const [coach, setCoach] = useState(initial?.coach || '');
  const [coachComment, setCoachComment] = useState(initial?.coachComment || '');
  const [goalsMateri, setGoalsMateri] = useState(initial?.goalsMateri || '');
  const [activityReportText, setActivityReportText] = useState(initial?.activityReportText || '');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!studentName || !date || !level || !lessonWeek || !lessonName || !coach) {
      toast({ title: 'Error', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    await onSubmit(
      {
        studentName,
        date,
        level,
        lessonWeek: parseInt(lessonWeek),
        lessonName,
        tools,
        coach,
        coachComment,
        goalsMateri,
        activityReportText,
        mediaUrls: initial?.mediaUrls || [],
      },
      mediaFiles
    );
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama Murid *</Label>
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nama murid" />
        </div>
        <div className="space-y-2">
          <Label>Tanggal *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Level/Jenjang *</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih level" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Coach *</Label>
          <Select value={coach} onValueChange={setCoach}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih coach" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Minggu ke- *</Label>
          <Input type="number" min={1} value={lessonWeek} onChange={(e) => setLessonWeek(e.target.value)} placeholder="1" />
        </div>
        <div className="space-y-2">
          <Label>Nama Materi (Lesson) *</Label>
          <Input value={lessonName} onChange={(e) => setLessonName(e.target.value)} placeholder="Nama materi" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tools</Label>
        <Input value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Alat/software yang digunakan" />
      </div>
      <div className="space-y-2">
        <Label>Goals Materi</Label>
        <Textarea value={goalsMateri} onChange={(e) => setGoalsMateri(e.target.value)} placeholder="Tulis goals materi (satu per baris)..." rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Activity Report</Label>
        <Textarea value={activityReportText} onChange={(e) => setActivityReportText(e.target.value)} placeholder="Tulis laporan aktivitas murid..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Komentar Coach</Label>
        <Textarea value={coachComment} onChange={(e) => setCoachComment(e.target.value)} placeholder="Catatan dan feedback untuk orang tua..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Foto/Video Kegiatan</Label>
        <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} />
        {mediaFiles.length > 0 && <p className="text-sm text-muted-foreground">{mediaFiles.length} file dipilih</p>}
      </div>
      <Button onClick={handleSubmit} disabled={uploading} className="w-full">
        {uploading ? (
          <><Upload className="w-4 h-4 mr-2 animate-spin" />Mengunggah...</>
        ) : (
          <><Plus className="w-4 h-4 mr-2" />{submitLabel}</>
        )}
      </Button>
    </div>
  );
}

export default function ReportsAdminPage() {
  const { reports, addReport, updateReport, deleteReport } = useActivityReports();
  const { codes, generateCode, deleteCode } = useAccessCodes();
  const { toast } = useToast();

  const [editingReport, setEditingReport] = useState<ActivityReport | null>(null);
  const [newCodeName, setNewCodeName] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterCoach, setFilterCoach] = useState('all');
  const [searchCode, setSearchCode] = useState('');
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  const filteredCodes = codes.filter((c) =>
    !searchCode || c.studentName.toLowerCase().includes(searchCode.toLowerCase())
  );

  const filteredReports = reports.filter((r) => {
    const matchesSearch = !searchStudent || r.studentName.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesCoach = filterCoach === 'all' || r.coach === filterCoach;
    return matchesSearch && matchesCoach;
  });

  const handleCreateReport = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => {
    const mediaUrls: string[] = [];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) mediaUrls.push(url);
    }
    await addReport({ ...data, mediaUrls });
    toast({ title: 'Berhasil!', description: `Laporan untuk ${data.studentName} berhasil ditambahkan.` });
  };

  const handleUpdateReport = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => {
    if (!editingReport) return;
    const newMediaUrls: string[] = [...data.mediaUrls];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) newMediaUrls.push(url);
    }
    await updateReport(editingReport.id, { ...data, mediaUrls: newMediaUrls });
    toast({ title: 'Berhasil!', description: `Laporan untuk ${data.studentName} berhasil diperbarui.` });
    setEditingReport(null);
  };

  const handleGenerateCode = async () => {
    if (!newCodeName.trim()) {
      toast({ title: 'Error', description: 'Masukkan nama murid.', variant: 'destructive' });
      return;
    }
    const code = await generateCode(newCodeName.trim());
    if (code) {
      toast({ title: 'Kode Dibuat!', description: `Kode akses untuk ${newCodeName}: ${code}` });
      setNewCodeName('');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Disalin!', description: 'Kode akses disalin ke clipboard.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Admin - Activity Report</h1>

        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create" className="gap-1.5"><FileText className="w-4 h-4" />Buat Report</TabsTrigger>
            <TabsTrigger value="codes" className="gap-1.5"><Key className="w-4 h-4" />Kode Akses</TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5"><FileText className="w-4 h-4" />Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader><CardTitle className="text-lg">Buat Activity Report Baru</CardTitle></CardHeader>
              <CardContent>
                <ReportForm onSubmit={handleCreateReport} submitLabel="Simpan Report" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card>
              <CardHeader><CardTitle className="text-lg">Kode Akses Orang Tua</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} placeholder="Nama murid" className="flex-1" />
                  <Button onClick={handleGenerateCode}><Plus className="w-4 h-4 mr-1" />Generate</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="Cari nama murid..." className="pl-9" />
                </div>
                <div className="space-y-2">
                  {filteredCodes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{c.studentName}</p>
                        <p className="text-xs text-muted-foreground font-mono tracking-widest">{c.accessCode}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyCode(c.accessCode)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCode(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                  {filteredCodes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Tidak ada kode akses ditemukan.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} placeholder="Cari nama murid..." className="pl-9" />
              </div>
              <Select value={filterCoach} onValueChange={setFilterCoach}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background"><SelectValue placeholder="Semua Coach" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">Semua Coach</SelectItem>
                  {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const grouped: Record<string, typeof filteredReports> = {};
              filteredReports.forEach((r) => {
                if (!grouped[r.studentName]) grouped[r.studentName] = [];
                grouped[r.studentName].push(r);
              });
              const sortedNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

              if (sortedNames.length === 0) {
                return <p className="text-sm text-muted-foreground text-center py-8">Tidak ada laporan ditemukan.</p>;
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sortedNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => setOpenFolder(openFolder === name ? null : name)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${openFolder === name ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
                    >
                      <FolderOpen className={`h-5 w-5 shrink-0 ${openFolder === name ? 'text-primary' : 'text-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">{grouped[name].length} report</p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}

            {openFolder && (() => {
              const studentReports = filteredReports
                .filter((r) => r.studentName === openFolder)
                .sort((a, b) => a.lessonWeek - b.lessonWeek);
              if (studentReports.length === 0) return null;

              // Group by level: W1-16 = Level 1, W17-32 = Level 2, etc.
              const maxWeek = Math.max(...studentReports.map((r) => r.lessonWeek));
              const totalLevels = Math.ceil(maxWeek / 16);
              const levels = Array.from({ length: totalLevels }, (_, i) => {
                const start = i * 16 + 1;
                const end = (i + 1) * 16;
                const halfA = studentReports.filter((r) => r.lessonWeek >= start && r.lessonWeek <= start + 7);
                const halfB = studentReports.filter((r) => r.lessonWeek >= start + 8 && r.lessonWeek <= end);
                return { level: i + 1, start, end, halfA, halfB };
              });

              const ReportCard = ({ r }: { r: ActivityReport }) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-semibold text-sm">Minggu {r.lessonWeek}: W{r.lessonWeek} - {r.lessonName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' • '}{r.coach} • {r.level}
                        </p>
                        {r.tools && <p className="text-xs text-muted-foreground">Tools: {r.tools}</p>}
                        {r.coachComment && <p className="text-sm mt-1 italic text-muted-foreground truncate">"{r.coachComment}"</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => setEditingReport(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteReport(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                    {r.mediaUrls.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {r.mediaUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Media ${i + 1}`} className="h-16 w-16 object-cover rounded-lg border border-border" />
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );

              return (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      {openFolder}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setOpenFolder(null)}>Tutup</Button>
                  </div>
                  {levels.map((lvl) => (
                    <div key={lvl.level} className="space-y-3">
                      <h4 className="text-md font-bold text-foreground border-b border-border pb-1">
                        Level {lvl.level} <span className="text-sm font-normal text-muted-foreground">(Week {lvl.start} – {lvl.end})</span>
                      </h4>
                      {lvl.halfA.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Week {lvl.start} – {lvl.start + 7}</p>
                          <div className="space-y-2">{lvl.halfA.map((r) => <ReportCard key={r.id} r={r} />)}</div>
                        </div>
                      )}
                      {lvl.halfB.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Week {lvl.start + 8} – {lvl.end}</p>
                          <div className="space-y-2">{lvl.halfB.map((r) => <ReportCard key={r.id} r={r} />)}</div>
                        </div>
                      )}
                      {lvl.halfA.length === 0 && lvl.halfB.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-2">Belum ada report untuk level ini.</p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Report</DialogTitle></DialogHeader>
            {editingReport && (
              <ReportForm initial={editingReport} onSubmit={handleUpdateReport} submitLabel="Update Report" />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
