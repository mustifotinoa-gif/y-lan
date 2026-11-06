import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  Monitor,
  Bug,
  Sparkles,
  ChevronRight,
  Send,
  Lock,
} from 'lucide-react';
import { BugReport, bugReportsService, DEVELOPER_EMAIL } from '../services/bugReports';

interface DeveloperInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportBug?: () => void;
}

export const DeveloperInboxModal: React.FC<DeveloperInboxModalProps> = ({
  isOpen,
  onClose,
  onOpenReportBug,
}) => {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await bugReportsService.getReports();
      setReports(data.reports);
      if (data.reports.length > 0 && !selectedReportId) {
        setSelectedReportId(data.reports[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredReports = reports.filter((r) => {
    if (filter === 'NEW') return r.status === 'NEW';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const selectedReport = reports.find((r) => r.id === selectedReportId) || filteredReports[0] || null;

  const handleMarkStatus = async (id: string, status: 'READ' | 'RESOLVED') => {
    await bugReportsService.updateStatus(id, status);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setActionMsg(status === 'RESOLVED' ? '✅ Rapor ÇÖZÜLDÜ olarak işaretlendi!' : '✉️ Rapor OKUNDU yapıldı.');
    setTimeout(() => setActionMsg(''), 2500);
  };

  const handleDelete = async (id: string) => {
    await bugReportsService.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selectedReportId === id) {
      setSelectedReportId(null);
    }
    setActionMsg('🗑️ Rapor silindi.');
    setTimeout(() => setActionMsg(''), 2500);
  };

  const handleSendTestReport = async () => {
    setIsLoading(true);
    await bugReportsService.submitReport({
      senderName: 'Test Oyuncusu',
      senderEmail: 'test@oyuncu.com',
      category: 'Oyun İçi Bug & Hata',
      description: 'Zaman dondurma gücünü kullanırken botlar dondu fakat coin animasyonu parlamaya devam etti. Test raporudur.',
      gameMode: 'SOLO',
    });
    await loadReports();
    setActionMsg('🧪 Yeni test hata raporu kutunuza düştü!');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const totalCount = reports.length;
  const newCount = reports.filter((r) => r.status === 'NEW').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col h-[90vh] max-h-[800px]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  GELİŞTİRİCİ ÖZEL POSTA KUTUSU
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>{DEVELOPER_EMAIL}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Oyuncuların oyun içinden gönderdiği tüm hata raporları ve öneriler burada toplanır.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadReports}
              disabled={isLoading}
              title="Yenile"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Quick Actions Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filtre:</span>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('NEW')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'NEW'
                  ? 'bg-rose-500 text-white font-black shadow-md'
                  : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
              <span>Yeni ({newCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'RESOLVED'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 text-emerald-400 hover:text-emerald-300'
              }`}
            >
              Çözülenler ({resolvedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {actionMsg && (
              <span className="text-xs font-bold text-emerald-400 animate-fade-in mr-2">
                {actionMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleSendTestReport}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Örnek Test Raporu Gönder</span>
            </button>
          </div>
        </div>

        {/* Main Body: Two-column master/detail layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Reports List */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto bg-slate-950/40">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">Bu filtrede gösterilecek rapor yok.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredReports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  const isNew = report.status === 'NEW';
                  const isResolved = report.status === 'RESOLVED';

                  return (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        if (report.status === 'NEW') {
                          handleMarkStatus(report.id, 'READ');
                        }
                      }}
                      className={`p-3.5 text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {report.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold font-mono animate-pulse">
                              YENİ
                            </span>
                          )}
                          {isResolved && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold font-mono">
                              ÇÖZÜLDÜ
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <h4 className={`text-xs font-bold line-clamp-1 ${isNew ? 'text-white' : 'text-slate-300'}`}>
                        {report.description}
                      </h4>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{report.senderName}</span>
                        </span>
                        <span className="text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Report Detail View */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-slate-900 text-left">
            {selectedReport ? (
              <div className="space-y-4">
                {/* Header card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                      {selectedReport.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(selectedReport.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Gönderen Oyuncu:</span>
                      <strong className="text-white text-xs">{selectedReport.senderName}</strong>
                    </div>

                    {selectedReport.senderEmail && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Oyuncu E-Postası:</span>
                        <a
                          href={`mailto:${selectedReport.senderEmail}?subject=Siber%20Arena%20Hata%20Bildirimi%20Yanıtı`}
                          className="text-cyan-400 hover:underline font-mono text-xs"
                        >
                          {selectedReport.senderEmail}
                        </a>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Cihaz / Tarayıcı:</span>
                      <span className="text-slate-300 text-xs">{selectedReport.deviceInfo || 'Bilinmiyor'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Oyun Modu:</span>
                      <span className="text-emerald-400 font-mono text-xs">{selectedReport.gameMode || 'SOLO'}</span>
                    </div>
                  </div>
                </div>

                {/* Description Text */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bildirilen Hata / Durum Detayı:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Developer Actions */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Geliştirici Aksiyonları ({DEVELOPER_EMAIL}):
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedReport.status !== 'RESOLVED' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(selectedReport.id, 'RESOLVED')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4 fill-slate-950 text-emerald-400" />
                        <span>Çözüldü Olarak İşaretle</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(selectedReport.id, 'READ')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Yeniden Aç</span>
                      </button>
                    )}

                    {/* Open in Gmail / Mail client */}
                    <a
                      href={`mailto:${DEVELOPER_EMAIL}?subject=Siber%20Arena%20Hata%20Raporu%20-%20${encodeURIComponent(selectedReport.category)}&body=${encodeURIComponent(
                        `Gönderen: ${selectedReport.senderName}\nTarih: ${selectedReport.createdAt}\nCihaz: ${selectedReport.deviceInfo}\n\nAçıklama:\n${selectedReport.description}`
                      )}`}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Gmail'e Aktar</span>
                    </a>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedReport.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Raporu Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-auto text-center text-slate-500 space-y-2">
                <Mail className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm">Görüntülemek için soldaki listeden bir rapor seçin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Yalnızca yapımcı ({DEVELOPER_EMAIL}) erişimine özel posta kutusu</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
