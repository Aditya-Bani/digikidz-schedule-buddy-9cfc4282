import { useState } from 'react';
import { useActivityReports, useAccessCodes } from '@/hooks/useActivityReports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft, BookOpen } from 'lucide-react';
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

function ParentReportView({ studentName, onBack }: { studentName: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName);

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

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Memuat laporan...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">Belum ada laporan untuk {studentName}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {r.level}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold">Minggu {r.lessonWeek}: {r.lessonName}</p>
                    {r.tools && <p className="text-sm text-muted-foreground">Tools: {r.tools}</p>}
                    <p className="text-sm text-muted-foreground">Coach: {r.coach}</p>
                  </div>

                  {r.coachComment && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Komentar Coach:</p>
                      <p className="text-sm">{r.coachComment}</p>
                    </div>
                  )}

                  {r.mediaUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {r.mediaUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Kegiatan ${i + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
