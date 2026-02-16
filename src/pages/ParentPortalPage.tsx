import { useState } from 'react';
import { useActivityReports, useAccessCodes, ActivityReport } from '@/hooks/useActivityReports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft, BookOpen, User, Calendar, Award, Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import logodk from '@/assets/logodk.png';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="flex justify-center">
            <img src={logodk} alt="DIGIKIDZ" className="h-16" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Parent Portal
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Masukkan kode akses untuk melihat Activity Report anak Anda
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="KODE AKSES"
                className="pl-11 h-14 font-mono tracking-widest text-center text-xl font-semibold border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 text-center">{error}</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSubmitCode} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium" 
          >
            <KeyRound className="w-5 h-5 mr-2" />
            Lihat Report
          </Button>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kode akses dapat diperoleh dari coach Anda
            </p>
          </div>
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
        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left space-y-2"
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Week {report.lessonWeek}
          </p>
          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">
          {report.lessonName}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </button>
      
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                  <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    Week {report.lessonWeek}
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{report.lessonName}</h3>
                </div>
                <button 
                  onClick={() => setExpanded(false)} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Name" value={report.studentName} icon={<User className="w-4 h-4" />} />
                <InfoRow 
                  label="Date" 
                  value={new Date(report.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} 
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoRow label="Level" value={report.level} icon={<Award className="w-4 h-4" />} />
                <InfoRow label="Lesson" value={`Minggu ${report.lessonWeek}: ${report.lessonName}`} icon={<BookOpen className="w-4 h-4" />} />
              </div>
              
              {report.tools && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Tools</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{report.tools}</p>
                </div>
              )}

              {report.goalsMateri && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Goals Materi
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 pl-2">
                    {report.goalsMateri.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {line.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {report.activityReportText && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Activity Report
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed pl-2">
                    {report.activityReportText}
                  </p>
                </div>
              )}

              {report.coachComment && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                    Komentar Coach
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{report.coachComment}</p>
                </div>
              )}

              {report.mediaUrls.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Dokumentasi Kegiatan
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.mediaUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative">
                        <img 
                          src={url} 
                          alt={`Kegiatan ${i + 1}`} 
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-all" 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Report by: <span className="font-semibold text-gray-900 dark:text-gray-100">{report.coach}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeekRow({ label, reports }: { label: string; reports: ActivityReport[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {label}
      </p>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {reports.length > 0 ? (
            reports.map((r) => <WeekCard key={r.id} report={r} />)
          ) : (
            <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full">
              <BookOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">Belum ada report</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function ParentReportView({ studentName, onBack }: { studentName: string; onBack: () => void }) {
  const { reports, loading } = useActivityReports(studentName);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={logodk} alt="DIGIKIDZ" className="h-10" />
            <div>
              <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {studentName}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Activity Report</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat laporan...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="mx-auto w-fit p-6 bg-gray-100 dark:bg-gray-800 rounded-full">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Belum Ada Laporan</p>
              <p className="text-gray-600 dark:text-gray-400">Belum ada laporan untuk {studentName}.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {levels.map((lvl) => (
              <Card key={lvl.level} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">
                        {studentName} — Level {lvl.level}
                      </span>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                        Week {lvl.start} – {lvl.end}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
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

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
      {icon && <div className="text-blue-600 dark:text-blue-400 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1">
          {label}
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium block break-words">{value}</span>
      </div>
    </div>
  );
}