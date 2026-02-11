import { useState } from 'react';
import { Header } from '@/components/Header';
import { useActivityReports, useAccessCodes, uploadReportMedia, ActivityReport } from '@/hooks/useActivityReports';
import { COACHES, LEVELS, Coach } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Upload, FileText, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsAdminPage() {
  const { reports, addReport, deleteReport } = useActivityReports();
  const { codes, generateCode, deleteCode } = useAccessCodes();
  const { toast } = useToast();

  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [level, setLevel] = useState('');
  const [lessonWeek, setLessonWeek] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [tools, setTools] = useState('');
  const [coach, setCoach] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');

  const handleSubmitReport = async () => {
    if (!studentName || !date || !level || !lessonWeek || !lessonName || !coach) {
      toast({ title: 'Error', description: 'Harap isi semua field wajib.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const mediaUrls: string[] = [];

    for (const file of mediaFiles) {
      const url = await uploadReportMedia(file);
      if (url) mediaUrls.push(url);
    }

    await addReport({
      studentName,
      date,
      level,
      lessonWeek: parseInt(lessonWeek),
      lessonName,
      tools,
      coach,
      coachComment,
      mediaUrls,
    });

    toast({ title: 'Berhasil!', description: `Laporan untuk ${studentName} berhasil ditambahkan.` });

    // Reset form
    setStudentName('');
    setDate('');
    setLevel('');
    setLessonWeek('');
    setLessonName('');
    setTools('');
    setCoach('');
    setCoachComment('');
    setMediaFiles([]);
    setUploading(false);
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
            <TabsTrigger value="create" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Buat Report
            </TabsTrigger>
            <TabsTrigger value="codes" className="gap-1.5">
              <Key className="w-4 h-4" />
              Kode Akses
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Riwayat
            </TabsTrigger>
          </TabsList>

          {/* Create Report Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buat Activity Report Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Pilih level" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Coach *</Label>
                    <Select value={coach} onValueChange={setCoach}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Pilih coach" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {COACHES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
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
                  <Label>Komentar Coach</Label>
                  <Textarea value={coachComment} onChange={(e) => setCoachComment(e.target.value)} placeholder="Catatan dan feedback untuk orang tua..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Foto/Video Kegiatan</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                  />
                  {mediaFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground">{mediaFiles.length} file dipilih</p>
                  )}
                </div>
                <Button onClick={handleSubmitReport} disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Simpan Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Codes Tab */}
          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kode Akses Orang Tua</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    placeholder="Nama murid"
                    className="flex-1"
                  />
                  <Button onClick={handleGenerateCode}>
                    <Plus className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <div className="space-y-2">
                  {codes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{c.studentName}</p>
                        <p className="text-xs text-muted-foreground font-mono tracking-widest">{c.accessCode}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyCode(c.accessCode)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCode(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {codes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada kode akses.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{r.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' • '}{r.coach} • {r.level}
                        </p>
                        <p className="text-sm">Minggu {r.lessonWeek}: {r.lessonName}</p>
                        {r.tools && <p className="text-xs text-muted-foreground">Tools: {r.tools}</p>}
                        {r.coachComment && <p className="text-sm mt-1 italic text-muted-foreground">"{r.coachComment}"</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteReport(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
              ))}
              {reports.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada laporan.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
