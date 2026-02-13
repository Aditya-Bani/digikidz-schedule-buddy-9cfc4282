import { useState } from 'react';
import { useActivityReports, useAccessCodes, ActivityReport } from '@/hooks/useActivityReports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft, BookOpen, ChevronRight, FolderOpen, User } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import logodk from '@/assets/logodk.png';

export default function ParentPortalPage() {
  const [code, setCode] = useState('');
  const [studentName, setStudentName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { lookupByCode } = useAccessCodes();

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setError('');
    const result = await lookupByCode(code.trim());
    if (result) {
      setStudentName(result.studentName);
    } else {
      setError('Kode akses tidak ditemukan. Silakan hubungi coach.');
    }
  };

  if (studentName) {
    return <ParentReportView studentName={studentName} onBack={() => setStudentName(null)} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img src={logodk} alt="DIGIKIDZ" className="h-16 mx-auto" />
          <div>
            <CardTitle className="text-xl">Parent Portal</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan kode akses untuk melihat Activity Report anak Anda
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="Masukkan kode akses"
              className="font-mono tracking-widest text-center text-lg"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button onClick={handleSubmitCode} className="w-full" size="lg">
            <KeyRound className="w-4 h-4 mr-2" />
            Lihat Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function WeekCard({ report }: { report: ActivityReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-w-[200px] max-w-[200px] shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left space-y-1"
      >
        <p className="font-semibold text-sm text-foreground">Week {report.lessonWeek}</p>
        <p className="text-xs text-muted-foreground truncate">{report.lessonName}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </button>
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-foreground">Week {report.lessonWeek}: {report.lessonName}</h3>
              <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>

            <div className="space-y-2">
              <InfoRow label="Name" value={report.studentName} />
              <InfoRow label="Date" value={new Date(report.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
              <InfoRow label="Level" value={report.level} />
              <InfoRow label="Lesson" value={`Minggu ${report.lessonWeek}: ${report.lessonName}`} />
              <InfoRow label="Tools" value={report.tools || '-'} />
            </div>

            {report.goalsMateri && (
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Goals Materi</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
                  {report.goalsMateri.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}>{line.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </div>
            )}

            {report.activityReportText && (
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Activity Report</h4>
                <p className="text-sm text-foreground whitespace-pre-line">{report.activityReportText}</p>
              </div>
            )}

            {report.coachComment && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Komentar Coach:</p>
                <p className="text-sm">{report.coachComment}</p>
              </div>
            )}

            {report.mediaUrls.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {report.mediaUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Kegiatan ${i + 1}`} className="h-24 w-24 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">Report by : {report.coach}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeekRow({ label, reports }: { label: string; reports: ActivityReport[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {reports.length > 0 ? (
            reports.map((r) => <WeekCard key={r.id} report={r} />)
          ) : (
            <p className="text-xs text-muted-foreground italic py-4">Belum ada report</p>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function ParentReportView({ studentName, onBack }: { studentName: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName);

  // Group reports by level: W1-16 = Level 1, W17-32 = Level 2, etc.
  const sortedReports = [...reports].sort((a, b) => a.lessonWeek - b.lessonWeek);
  const maxWeek = sortedReports.length > 0 ? Math.max(...sortedReports.map((r) => r.lessonWeek)) : 0;
  const totalLevels = Math.max(1, Math.ceil(maxWeek / 16));
  const levels = Array.from({ length: totalLevels }, (_, i) => {
    const start = i * 16 + 1;
    const end = (i + 1) * 16;
    const halfA = sortedReports.filter((r) => r.lessonWeek >= start && r.lessonWeek <= start + 7);
    const halfB = sortedReports.filter((r) => r.lessonWeek >= start + 8 && r.lessonWeek <= end);
    return { level: i + 1, start, end, halfA, halfB };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logodk} alt="DIGIKIDZ" className="h-10" />
          <div>
            <h1 className="font-bold text-foreground">{studentName}</h1>
            <p className="text-xs text-muted-foreground">Activity Report</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Memuat laporan...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">Belum ada laporan untuk {studentName}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {levels.map((lvl) => (
              <Card key={lvl.level}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    {studentName} — Level {lvl.level}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <WeekRow label={`Week ${lvl.start} – ${lvl.start + 7}`} reports={lvl.halfA} />
                  <WeekRow label={`Week ${lvl.start + 8} – ${lvl.end}`} reports={lvl.halfB} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-bold text-foreground w-20 shrink-0">{label}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
