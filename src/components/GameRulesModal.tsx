import React, { useState } from 'react';
import {
  ShieldAlert,
  Bug,
  HeartHandshake,
  CheckCircle,
  X,
  Send,
  AlertTriangle,
  Sparkles,
  Gamepad2,
  Check,
} from 'lucide-react';

import { bugReportsService } from '../services/bugReports';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndStart?: () => void;
  isStartingGame?: boolean;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndStart,
  isStartingGame = false,
}) => {
  const [bugText, setBugText] = useState('');
  const [isBugSent, setIsBugSent] = useState(false);
  const [showBugInput, setShowBugInput] = useState(false);

  if (!isOpen) return null;

  const handleSendBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugText.trim()) return;

    await bugReportsService.submitReport({
      senderName: 'Kural Ekranı Oyuncusu',
      category: 'Kural Ekranından Bildirilen Bug',
      description: bugText.trim(),
    });

    setIsBugSent(true);
    setBugText('');
    setTimeout(() => {
      setIsBugSent(false);
      setShowBugInput(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 text-white shadow-lg shadow-red-500/40 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  SİBER ARENA OYUN KURALLARI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-mono font-black uppercase tracking-wider shadow-sm">
                  ZORUNLU
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Oyuna başlamadan önce adil ve eğlenceli bir ortam için lütfen kuralları okuyunuz.
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

        {/* Modal Body: Rules Cards */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {/* KURAL 1: HACK & HİLE YASAKTIR (3 UYARI HAKKI) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/70 via-slate-950 to-slate-900 border-2 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center font-black text-xs font-mono">
                  1
                </span>
                <h4 className="text-sm font-black text-red-400 tracking-tight flex items-center gap-1.5">
                  <span>Hacklemek ve Hile Yapmak Yasaktır!</span>
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-black animate-pulse">
                ⚠️ 3 UYARI HAKKINIZ VARDIR
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-9">
              Oyun içerisinde harici bot, script, hız hilesi veya oyun dosyalarını manipüle etmek kesinlikle yasaktır.{' '}
              <strong className="text-red-400 font-bold">
                Toplam 3 uyarı hakkınız vardır, ihlalin devamında hesabınız ve cihazınız direkt banlanırsınız!
              </strong>
            </p>
          </div>

          {/* KURAL 2: BUG BULDUYSANIZ İLETİNİZ */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center font-black text-xs font-mono">
                  2
                </span>
                <h4 className="text-sm font-black text-amber-300 tracking-tight flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-amber-400" />
                  <span>Bug Bulduysanız İletiniz!</span>
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowBugInput(!showBugInput)}
                className="px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold transition-colors cursor-pointer"
              >
                {showBugInput ? 'Kapat' : '✍️ Bug Bildir'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-9">
              Arenada, markette veya çok oyunculu modda karşılaştığınız herhangi bir hata, grafik kayması veya açığı kendi lehinize kullanmayıp lütfen geliştiriciye iletiniz.
            </p>

            {/* Inline Bug Report Input */}
            {showBugInput && (
              <form onSubmit={handleSendBug} className="mt-1 pl-9 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bugText}
                    onChange={(e) => setBugText(e.target.value)}
                    placeholder="Karşılaştığınız bug veya hatayı buraya yazın..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!bugText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gönder</span>
                  </button>
                </div>
              </form>
            )}

            {isBugSent && (
              <div className="pl-9 text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Bug bildiriminiz başarıyla iletildi, teşekkür ederiz!</span>
              </div>
            )}
          </div>

          {/* KURAL 3: SAYGILI KONUŞUNUZ (4 UYARI HAKKI) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-950 to-slate-900 border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center font-black text-xs font-mono">
                  3
                </span>
                <h4 className="text-sm font-black text-cyan-300 tracking-tight flex items-center gap-1.5">
                  <span>Saygılı Konuşunuz!</span>
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-black">
                💬 4 UYARI HAKKINIZ VARDIR
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-9">
              Oyun içi sohbette ve lobi odalarında diğer oyunculara karşı küfür, hakaret, argo ve kırıcı sözler kullanmak yasaktır.{' '}
              <strong className="text-cyan-300 font-bold">
                Saygısız davranışlarda bulunanlar için toplam 4 uyarı hakkı vardır.
              </strong>{' '}
              Uyarı limitini aşan kullanıcılar sohbetten ve odalardan uzaklaştırılır.
            </p>
          </div>

          {/* TEŞEKKÜR & İYİ OYUNLAR DİLEĞİ */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-500/40 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-emerald-300">
                İyi oyunlar dilerim, oyunu oynadığınız için teşekkürler! ❤️
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Keyifli, rekabetçi ve adil bir siber yılan mücadelesi dileriz.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 text-center sm:text-left">
            Kurallara uyarak tüm topluluk için keyifli bir arena sağlayın.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer flex-1 sm:flex-none"
            >
              Vazgeç
            </button>

            {isStartingGame && onAcceptAndStart && (
              <button
                type="button"
                onClick={onAcceptAndStart}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <CheckCircle className="w-4 h-4 fill-slate-950 text-emerald-400" />
                <span>Kuralları Kabul Ediyorum & Başla</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
