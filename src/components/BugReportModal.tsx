import React, { useState } from 'react';
import {
  Bug,
  X,
  Send,
  CheckCircle,
  AlertTriangle,
  Mail,
  User,
  Sparkles,
  HelpCircle,
  Monitor,
} from 'lucide-react';
import { bugReportsService, DEVELOPER_EMAIL } from '../services/bugReports';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
  gameMode?: string;
  onOpenInbox?: () => void;
}

const CATEGORIES = [
  { id: 'Oyun İçi Bug & Hata', label: '🐛 Oyun İçi Bug', desc: 'Oynanış, çarpışma veya puanlama hatası' },
  { id: 'Grafik & Görsel Kayma', label: '🎨 Grafik & Görsel', desc: 'Kostüm, yılan boğumu veya arayüz kayması' },
  { id: 'Çok Oyunculu & Bağlantı', label: '🌐 Çok Oyunculu', desc: 'Oda, gecikme veya oyuncu senkronizasyonu' },
  { id: 'Market & Güçler', label: '🛒 Market & Güçler', desc: 'Zaman dondurma, klonlama veya satın alma' },
  { id: 'Hile / Kural İhlali', label: '🛡️ Kural İhlali', desc: 'Şüpheli oyuncu veya hakaret bildirimi' },
  { id: 'Öneri & Fikir', label: '💡 Öneri & İstek', desc: 'Yeni güç, kostüm veya özellik önerisi' },
];

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  playerName = 'Mustafa Kemal',
  gameMode = 'SOLO',
  onOpenInbox,
}) => {
  const [senderName, setSenderName] = useState(playerName);
  const [senderEmail, setSenderEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Lütfen karşılaştığınız hatayı veya durumu kısaca açıklayın.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await bugReportsService.submitReport({
        senderName: senderName.trim() || 'Oyuncu',
        senderEmail: senderEmail.trim(),
        category,
        description: description.trim(),
        gameMode,
      });

      if (res.success) {
        setIsSuccess(true);
        setDescription('');
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        setErrorMsg(res.error || 'Gönderilemedi, lütfen tekrar deneyin.');
      }
    } catch {
      setErrorMsg('Bir bağlantı hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-slate-950 shadow-lg shadow-amber-500/30 shrink-0 font-black">
              <Bug className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  HATA & BUG BİLDİRİMİ
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-black uppercase">
                  DİREKT YAPIMCIYA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Raporunuz doğrudan geliştirici posta kutusuna ({DEVELOPER_EMAIL}) iletilir.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-black text-white">
                Hata Bildiriminiz Başarıyla İletildi!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Raporunuz doğrudan geliştirici <strong className="text-amber-400 font-mono">{DEVELOPER_EMAIL}</strong> posta kutusuna ulaştı. Oyunu daha kusursuz hale getirdiğiniz için teşekkürler! ❤️
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hata Türü / Kategorisi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs truncate">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Hata Açıklaması & Yaşanan Sorun:</span>
                  <span className="text-[10px] text-slate-400 normal-case font-normal">
                    (Nasıl gerçekleştiğini kısaca anlatın)
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Çok oyunculu modda 3. odaya girerken yılan boyutu aniden sıfırlandı veya marketten klonlama aldığımda..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none transition-colors font-sans resize-none leading-relaxed"
                />
              </div>

              {/* Name and optional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gönderen Adı:</span>
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Mustafa Kemal"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>İletişim E-postanız (İsteğe Bağlı):</span>
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="ornek@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Auto attached diagnostics note */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cihaz ve ekran boyutu raporunuza otomatik eklenir</span>
                </span>
                <span className="font-mono text-cyan-300 text-[10px]">
                  Mod: {gameMode === 'MULTIPLAYER' ? '🌐 Çok Oyunculu' : '🎮 Tek Oyunculu'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {onOpenInbox ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInbox();
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>📬 Geliştirici Posta Kutusunu Aç</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer flex-1 sm:flex-none"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4 fill-slate-950" />
                    <span>{isSubmitting ? 'Gönderiliyor...' : 'Geliştiriciye Gönder'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
