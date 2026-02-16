import { useState } from 'react';
import { Header } from '@/components/Header';
import { useActivityReports, useAccessCodes, uploadReportMedia, ActivityReport } from '@/hooks/useActivityReports';
import { COACHES, LEVELS, Coach } from '@/types/schedule';
import { Search, AlertCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Upload, FileText, Key, Pencil, FolderOpen, User, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
      toast({ 
        title: '⚠️ Field Wajib Kosong', 
        description: 'Harap isi semua field yang ditandai dengan (*).', 
        variant: 'destructive' 
      });
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
    <div className="space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">Informasi Dasar</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Nama Murid <span className="text-destructive">*</span>
            </Label>
            <Input 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
              placeholder="Nama murid" 
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Level/Jenjang <span className="text-destructive">*</span>
            </Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="bg-background h-11">
                <SelectValue placeholder="Pilih level" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Coach <span className="text-destructive">*</span>
            </Label>
            <Select value={coach} onValueChange={setCoach}>
              <SelectTrigger className="bg-background h-11">
                <SelectValue placeholder="Pilih coach" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Minggu ke- <span className="text-destructive">*</span>
            </Label>
            <Input 
              type="number" 
              min={1} 
              value={lessonWeek} 
              onChange={(e) => setLessonWeek(e.target.value)} 
              placeholder="1"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Nama Materi (Lesson) <span className="text-destructive">*</span>
            </Label>
            <Input 
              value={lessonName} 
              onChange={(e) => setLessonName(e.target.value)} 
              placeholder="Nama materi"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Lesson Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">Detail Pembelajaran</h3>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Tools</Label>
          <Input 
            value={tools} 
            onChange={(e) => setTools(e.target.value)} 
            placeholder="Alat/software yang digunakan"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Goals Materi</Label>
          <Textarea 
            value={goalsMateri} 
            onChange={(e) => setGoalsMateri(e.target.value)} 
            placeholder="Tulis goals materi (satu per baris)..." 
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Activity Report</Label>
          <Textarea 
            value={activityReportText} 
            onChange={(e) => setActivityReportText(e.target.value)} 
            placeholder="Tulis laporan aktivitas murid..." 
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Komentar Coach</Label>
          <Textarea 
            value={coachComment} 
            onChange={(e) => setCoachComment(e.target.value)} 
            placeholder="Catatan dan feedback untuk orang tua..." 
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      {/* Media Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">Media</h3>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Foto/Video Kegiatan</Label>
          <div className="flex items-center gap-3">
            <Input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
              className="h-11"
            />
          </div>
          {mediaFiles.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-primary font-medium">
                {mediaFiles.length} file dipilih
              </p>
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={uploading} 
        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
      >
        {uploading ? (
          <>
            <Upload className="w-5 h-5 mr-2 animate-spin" />
            Mengunggah...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            {submitLabel}
          </>
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
    toast({ 
      title: '✅ Berhasil!', 
      description: `Laporan untuk ${data.studentName} berhasil ditambahkan.` 
    });
  };

  const handleUpdateReport = async (data: Omit<ActivityReport, 'id' | 'createdAt'>, files: File[]) => {
    if (!editingReport) return;
    const newMediaUrls: string[] = [...data.mediaUrls];
    for (const file of files) {
      const url = await uploadReportMedia(file);
      if (url) newMediaUrls.push(url);
    }
    await updateReport(editingReport.id, { ...data, mediaUrls: newMediaUrls });
    toast({ 
      title: '✅ Berhasil!', 
      description: `Laporan untuk ${data.studentName} berhasil diperbarui.` 
    });
    setEditingReport(null);
  };

  const handleGenerateCode = async () => {
    if (!newCodeName.trim()) {
      toast({ 
        title: '⚠️ Error', 
        description: 'Masukkan nama murid.', 
        variant: 'destructive' 
      });
      return;
    }
    const code = await generateCode(newCodeName.trim());
    if (code) {
      toast({ 
        title: '🔑 Kode Dibuat!', 
        description: `Kode akses untuk ${newCodeName}: ${code}` 
      });
      setNewCodeName('');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ 
      title: '📋 Disalin!', 
      description: 'Kode akses disalin ke clipboard.' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            Admin - Activity Report
          </h1>
          <p className="text-sm text-muted-foreground ml-14">
            Kelola laporan aktivitas dan kode akses orang tua
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
            <TabsTrigger value="create" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Report</span>
              <span className="sm:hidden">Buat</span>
            </TabsTrigger>
            <TabsTrigger value="codes" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Kode Akses</span>
              <span className="sm:hidden">Kode</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Riwayat</span>
              <span className="sm:hidden">Riwayat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Buat Activity Report Baru
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ReportForm onSubmit={handleCreateReport} submitLabel="Simpan Report" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes" className="mt-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Kode Akses Orang Tua
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-3">
                  <Input 
                    value={newCodeName} 
                    onChange={(e) => setNewCodeName(e.target.value)} 
                    placeholder="Nama murid" 
                    className="flex-1 h-11" 
                  />
                  <Button 
                    onClick={handleGenerateCode}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={searchCode} 
                    onChange={(e) => setSearchCode(e.target.value)} 
                    placeholder="Cari nama murid..." 
                    className="pl-10 h-11" 
                  />
                </div>
                <div className="space-y-3">
                  {filteredCodes.map((c) => (
                    <div 
                      key={c.id} 
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-card hover:bg-muted/30 transition-colors shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{c.studentName}</p>
                        <p className="text-xs text-muted-foreground font-mono tracking-widest mt-1 bg-muted/50 px-2 py-1 rounded inline-block">
                          {c.accessCode}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyCode(c.accessCode)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteCode(c.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredCodes.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                      <Key className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">Tidak ada kode akses ditemukan.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={searchStudent} 
                  onChange={(e) => setSearchStudent(e.target.value)} 
                  placeholder="Cari nama murid..." 
                  className="pl-10 h-11" 
                />
              </div>
              <Select value={filterCoach} onValueChange={setFilterCoach}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background h-11 shadow-sm">
                  <SelectValue placeholder="Semua Coach" />
                </SelectTrigger>
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
                return (
                  <Card className="shadow-lg border-border/50">
                    <CardContent className="text-center py-20">
                      <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">Tidak ada laporan ditemukan.</p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => setOpenFolder(openFolder === name ? null : name)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md',
                        openFolder === name 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border bg-card hover:bg-muted/50'
                      )}
                    >
                      <FolderOpen className={cn(
                        'h-6 w-6 shrink-0',
                        openFolder === name ? 'text-primary' : 'text-amber-500'
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {grouped[name].length} report
                        </p>
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
                <Card key={r.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground">
                          Minggu {r.lessonWeek}: W{r.lessonWeek} - {r.lessonName}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{r.coach}</span>
                          <span>•</span>
                          <span>{r.level}</span>
                        </div>
                        {r.tools && (
                          <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded inline-block">
                            Tools: {r.tools}
                          </p>
                        )}
                        {r.coachComment && (
                          <p className="text-sm mt-2 italic text-muted-foreground line-clamp-2">
                            "{r.coachComment}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingReport(r)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteReport(r.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {r.mediaUrls.length > 0 && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {r.mediaUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative">
                            <img 
                              src={url} 
                              alt={`Media ${i + 1}`} 
                              className="h-20 w-20 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-all shadow-sm" 
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );

              return (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <FolderOpen className="h-6 w-6 text-primary" />
                      {openFolder}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setOpenFolder(null)}
                      className="hover:bg-muted"
                    >
                      Tutup
                    </Button>
                  </div>
                  {levels.map((lvl) => (
                    <Card key={lvl.level} className="shadow-lg border-border/50">
                      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                        <CardTitle className="text-lg">
                          Level {lvl.level} 
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            (Week {lvl.start} – {lvl.end})
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        {lvl.halfA.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Week {lvl.start} – {lvl.start + 7}
                            </p>
                            <div className="space-y-3">
                              {lvl.halfA.map((r) => <ReportCard key={r.id} r={r} />)}
                            </div>
                          </div>
                        )}
                        {lvl.halfB.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Week {lvl.start + 8} – {lvl.end}
                            </p>
                            <div className="space-y-3">
                              {lvl.halfB.map((r) => <ReportCard key={r.id} r={r} />)}
                            </div>
                          </div>
                        )}
                        {lvl.halfA.length === 0 && lvl.halfB.length === 0 && (
                          <div className="text-center py-8 bg-muted/30 rounded-xl">
                            <p className="text-sm text-muted-foreground italic">
                              Belum ada report untuk level ini.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingReport} onOpenChange={(open) => !open && setEditingReport(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Edit Report
              </DialogTitle>
            </DialogHeader>
            {editingReport && (
              <ReportForm initial={editingReport} onSubmit={handleUpdateReport} submitLabel="Update Report" />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}