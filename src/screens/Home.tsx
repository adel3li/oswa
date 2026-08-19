import { useState } from 'react';
import { AppState, saveState } from '../store';
import { mawaqifMap } from '../content';
import { mawqifPool } from '../content/pool';
import { getTodayIndex, getUtcDayNumber } from '../lib/utils';
import { getTodayFormatted } from '../lib/date';
import { trackEvent } from '../lib/analytics';
import { JourneyFlow } from '../components/JourneyFlow';
import { Check } from 'lucide-react';

interface Props {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

export function Home({ appState, setAppState }: Props) {
  const [showJourney, setShowJourney] = useState(false);
  const dayIdx = getTodayIndex(mawqifPool.length);
  const mawqifId = mawqifPool[dayIdx];
  const mawqif = mawaqifMap[mawqifId];
  const utcDay = getUtcDayNumber();
  const completed = appState.journeyCompleted[utcDay] || false;
  const checks = appState.todayChecklist[utcDay] || [];
  const { gregorian, hijri } = getTodayFormatted();

  const handleStart = () => {
    trackEvent('journey_started', { mawqifId });
    setShowJourney(true);
  };

  const handleComplete = async (finalChecks: boolean[]) => {
    trackEvent('journey_completed', { mawqifId });
    const next = await saveState({
      journeyCompleted: { [utcDay]: true },
      todayChecklist: { [utcDay]: finalChecks }
    });
    setAppState(next);
  };

  if (!mawqif) return null;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8 sm:hidden flex flex-col items-center">
        <p className="text-[11px] text-white/50 tracking-wide font-medium">{hijri} تقريبًا</p>
        <p className="text-sm text-white/70">{gregorian}</p>
      </div>

      {!completed ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-6 w-full max-w-3xl mx-auto">
          <div className="w-full bg-[var(--color-brand-surface)] rounded-[32px] p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            
            <div className="px-4 py-1.5 rounded-full border border-[var(--color-brand-accent)]/40 text-[var(--color-brand-accent)] text-sm mb-8 font-medium">
              {mawqif.axisAr}
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">{mawqif.title}</h1>
            
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
              {mawqif.openingLine}
            </p>
            
            <div className="mt-12 w-full flex flex-col items-center gap-4 relative z-10">
              <button 
                onClick={handleStart} 
                className="bg-[var(--color-brand-accent)] hover:opacity-90 text-white w-full sm:w-72 py-5 rounded-2xl text-lg font-bold shadow-lg shadow-[var(--color-brand-accent)]/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>ابدأ رحلةَ اليوم</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <p className="text-xs opacity-40">رحلةُ تأسٍّ مدتها ٣ دقائق</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
            <div className="bg-[var(--color-brand-surface)] p-6 rounded-2xl flex items-center gap-4 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-gold)" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <div className="text-xs opacity-50">موقف اليوم</div>
                <div className="text-sm font-bold">عاشه الصحبُ قديمًا</div>
              </div>
            </div>
            
            <div className="bg-[var(--color-brand-surface)] p-6 rounded-2xl flex items-center gap-4 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-gold)" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div>
                <div className="text-xs opacity-50">تطبيق عملي</div>
                <div className="text-sm font-bold">تحت قدميك أثر</div>
              </div>
            </div>
            
            <div className="bg-[var(--color-brand-surface)] p-6 rounded-2xl flex items-center gap-4 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-gold)" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div>
                <div className="text-xs opacity-50">تأمل خاص</div>
                <div className="text-sm font-bold">يصلك به ﷺ</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
          <div className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/5">
            <h2 className="font-bold text-xl mb-4">{mawqif.title}</h2>
            <p className="text-white/80 leading-relaxed text-sm">{mawqif.situation.text}</p>
          </div>

          <div className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/5 text-center">
            {mawqif.primarySources[0].matnVerified && mawqif.primarySources[0].matn ? (
              <p className="font-amiri text-xl leading-loose text-[var(--color-brand-gold)] mb-4">{mawqif.primarySources[0].matn}</p>
            ) : (
              <div>
                <p className="text-xs text-white/50 mb-2">يُعرض نصُّ الحديث بعد تحقُّقه من مصدره</p>
                <a href={mawqif.primarySources[0].sourceUrl} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs text-[var(--color-brand-accent)]">
                  {mawqif.primarySources[0].collection} {mawqif.primarySources[0].reference} • {mawqif.primarySources[0].narrator} • {mawqif.primarySources[0].grading}
                </a>
              </div>
            )}
          </div>

          <div className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/5">
            <span className="text-[10px] text-[var(--color-brand-accent)] mb-3 block">الدرس المستفاد</span>
            <p className="text-sm leading-relaxed text-white/90">{mawqif.lesson}</p>
          </div>

          <div className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/5">
            <span className="text-[10px] text-[var(--color-brand-accent)] mb-4 block">تطبيقات اليوم</span>
            <div className="space-y-3">
              {mawqif.applications.map((app, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${checks[i] ? 'bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)] text-white' : 'border-white/20'}`}>
                    {checks[i] && <Check size={10} />}
                  </div>
                  <span className="text-xs leading-relaxed text-white/80">{app}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-xs text-white/40">«كيف عاملهم؟» — الشيخ محمد صالح المنجد</p>
            <button onClick={() => setShowJourney(true)} className="text-sm text-[var(--color-brand-accent)] font-medium active:opacity-70">
              أعِد الرحلة
            </button>
          </div>
        </div>
      )}

      {showJourney && (
        <JourneyFlow 
          mawqif={mawqif} 
          mode="daily" 
          initialChecklist={completed ? checks : undefined}
          onComplete={handleComplete}
          onClose={() => setShowJourney(false)} 
        />
      )}
    </div>
  );
}
