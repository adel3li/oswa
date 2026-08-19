import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import type { Mawqif } from '../types/content';
import { cn } from '../lib/utils';
import { addJournalEntry } from '../store/journal';

interface Props {
  mawqif: Mawqif;
  mode: 'daily' | 'browse';
  initialChecklist?: boolean[];
  onComplete?: (checklist: boolean[]) => void;
  onClose: () => void;
}

export function JourneyFlow({ mawqif, mode, initialChecklist, onComplete, onClose }: Props) {
  const [step, setStep] = useState(0);
  const totalSteps = mode === 'daily' ? 8 : 5;
  const [checks, setChecks] = useState<boolean[]>(
    initialChecklist || Array(mawqif.applications.length).fill(false)
  );
  const [journalText, setJournalText] = useState("");
  const [showSharh, setShowSharh] = useState(false);

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else finish();
  };

  const finish = async () => {
    if (mode === 'daily' && onComplete) {
      if (journalText.trim().length > 0) {
        await addJournalEntry({
          dateISO: new Date().toISOString(),
          mawqifId: mawqif.id,
          text: journalText.trim()
        });
      }
      onComplete(checks);
    }
    onClose();
  };

  const toggleCheck = async (idx: number) => {
    const next = [...checks];
    next[idx] = !next[idx];
    setChecks(next);
    if (Capacitor.isNativePlatform() && next[idx]) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const currentStepView = () => {
    switch(step) {
      case 0:
        return (
          <div className="flex flex-col h-full justify-center text-center px-6">
            <h2 className="text-2xl font-bold mb-8 text-[var(--color-brand-accent)] leading-relaxed">{mawqif.openingLine}</h2>
            <p className="text-lg leading-loose text-white/90">{mawqif.situation.text}</p>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col h-full justify-center px-6">
            <div className="space-y-12">
              {mawqif.primarySources.map((src, i) => (
                <div key={i} className="text-center">
                  {src.matnVerified && src.matn ? (
                    <p className="font-amiri text-2xl leading-loose text-[var(--color-brand-gold)] mb-4">{src.matn}</p>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block mb-4 max-w-sm">
                      <p className="text-[11px] text-white/50 mb-2">النص قيد التحقق</p>
                      <a href={src.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--color-brand-accent)] block mb-1">
                        {src.collection} {src.reference}
                      </a>
                      <p className="text-xs text-white/60">{src.narrator} • {src.grading}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col h-full justify-center text-center px-8">
            <p className="text-xl leading-relaxed text-white/90">{mawqif.muhasabah}</p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col h-full justify-center text-center px-6">
            <span className="text-sm text-[var(--color-brand-accent)] mb-4 tracking-widest uppercase opacity-70 block">لولا هذا الهدي</span>
            <p className="text-lg leading-loose text-white/90">{mawqif.contrast}</p>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col h-full justify-center text-start px-6">
            <span className="text-sm text-[var(--color-brand-accent)] mb-6 block">الدرس المستفاد</span>
            <p className="text-lg leading-loose text-white/90 mb-8">{mawqif.lesson}</p>
            {mawqif.sharhNote && (
              <div className="mt-auto">
                <button onClick={() => setShowSharh(!showSharh)} className="text-sm text-white/50 flex items-center gap-2 pb-2">
                  من كلام الشراح
                </button>
                <AnimatePresence>
                  {showSharh && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-[var(--color-brand-surface)] p-4 rounded-xl border border-white/5 mt-2">
                        <p className="text-sm leading-relaxed text-white/80 mb-2">{mawqif.sharhNote.text}</p>
                        <p className="text-[10px] text-white/40">{mawqif.sharhNote.source}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col h-full justify-center px-6">
            <span className="text-sm text-[var(--color-brand-accent)] mb-8 block text-center">تطبيقُ اليوم</span>
            <div className="space-y-4">
              {mawqif.applications.map((app, i) => (
                <button key={i} onClick={() => toggleCheck(i)} className={cn("w-full text-start p-5 rounded-2xl border transition-colors flex gap-4 items-start", checks[i] ? "bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]/30" : "bg-[var(--color-brand-surface)] border-white/5")}>
                  <div className={cn("mt-1 w-5 h-5 rounded flex items-center justify-center shrink-0 border", checks[i] ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)] text-white" : "border-white/20")}>
                    {checks[i] && <Check size={14} />}
                  </div>
                  <span className="text-sm leading-relaxed text-white/90">{app}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col h-full pt-20 px-6">
            <span className="text-sm text-[var(--color-brand-accent)] mb-6 block">تأمّلك</span>
            <p className="text-lg leading-relaxed text-white/90 mb-8">{mawqif.reflectionQuestion}</p>
            <textarea 
              className="flex-1 w-full bg-transparent border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 resize-none outline-none focus:border-[var(--color-brand-accent)] transition-colors mb-20"
              placeholder="ماذا لمس قلبك في هذا الموقف؟ وأين ستقتدي به اليوم؟"
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
            />
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col h-full justify-center text-center px-6">
            <p className="text-xl leading-loose text-white/90 mb-12">{mawqif.closingReflection}</p>
            <button onClick={finish} className="w-full bg-[var(--color-brand-accent)] text-white py-5 rounded-2xl font-bold active:scale-95 transition-transform flex flex-col items-center gap-1">
              <span className="text-lg">صلِّ على النبي ﷺ</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-brand-bg)] flex flex-col">
      <div className="flex justify-between p-6">
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i <= step ? "w-6 bg-[var(--color-brand-accent)]" : "w-2 bg-white/20")} />
          ))}
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 -mr-2">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {currentStepView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < totalSteps - 1 && (
        <div className="p-6 pb-safe">
          <button 
            onClick={handleNext}
            className={cn("w-full py-5 rounded-2xl font-medium active:scale-95 transition-transform", step === 2 ? "bg-white text-[var(--color-brand-bg)] animate-pulse" : "bg-[var(--color-brand-surface)] text-white border border-white/5")}
          >
            {step === 2 ? "أكمل" : "التالي"}
          </button>
        </div>
      )}
    </div>
  );
}
