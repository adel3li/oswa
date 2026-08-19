import { useState } from 'react';
import { mawaqifMap } from '../content';
import { Mawqif, AxisId } from '../types/content';
import { JourneyFlow } from '../components/JourneyFlow';
import { trackEvent } from '../lib/analytics';

const axes: { id: AxisId, title: string }[] = [
  { id: 'spouses_family', title: 'مع أزواجه وأهل بيته' },
  { id: 'companions', title: 'مع أصحابه' },
  { id: 'children', title: 'مع الصغار وأحفاده' },
  { id: 'servants', title: 'مع خدمه ومن عمل معه' },
  { id: 'neighbors_guests', title: 'مع جيرانه وضيوفه' },
  { id: 'those_who_erred', title: 'مع العصاة والمخطئين' },
  { id: 'afflicted_weak', title: 'مع الضعفاء' },
  { id: 'elders_public', title: 'مع كبار السن' },
  { id: 'adversaries', title: 'مع المخالفين' }
];

export function Browse() {
  const [selectedAxis, setSelectedAxis] = useState<AxisId | null>(null);
  const [selectedMawqif, setSelectedMawqif] = useState<Mawqif | null>(null);

  const mawaqifList = Object.values(mawaqifMap);
  const counts = axes.reduce((acc, axis) => {
    acc[axis.id] = mawaqifList.filter(m => m.axis === axis.id).length;
    return acc;
  }, {} as Record<AxisId, number>);

  if (selectedMawqif) {
    return (
      <JourneyFlow 
        mawqif={selectedMawqif} 
        mode="browse" 
        onClose={() => setSelectedMawqif(null)} 
      />
    );
  }

  if (selectedAxis) {
    const items = mawaqifList.filter(m => m.axis === selectedAxis);
    const axisTitle = axes.find(a => a.id === selectedAxis)?.title;

    return (
      <div className="p-6 sm:p-10">
        <button onClick={() => setSelectedAxis(null)} className="text-sm text-white/50 mb-6 flex items-center gap-1 active:opacity-70 hover:text-white transition-colors">
          العودة للمحاور
        </button>
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-brand-accent)]">{axisTitle}</h1>
        <div className="space-y-4">
          {items.map(m => (
            <button key={m.id} onClick={() => {
              trackEvent('mawqif_viewed', { mawqifId: m.id });
              setSelectedMawqif(m);
            }} className="w-full text-start bg-[var(--color-brand-surface)] p-6 rounded-2xl border border-white/10 active:scale-95 hover:border-[var(--color-brand-accent)]/50 transition-all block">
              <h3 className="font-bold text-lg mb-2">{m.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{m.openingLine}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-8">المحاور</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {axes.map(axis => {
          const count = counts[axis.id];
          const isEmpty = count === 0;
          return (
            <button 
              key={axis.id}
              disabled={isEmpty}
              onClick={() => !isEmpty && setSelectedAxis(axis.id)}
              className={`text-start p-6 rounded-2xl border flex flex-col justify-between aspect-square transition-transform ${isEmpty ? 'bg-white/5 border-white/5 opacity-50' : 'bg-[var(--color-brand-surface)] border-white/10 active:scale-95 hover:border-[var(--color-brand-accent)]/50 transition-colors'}`}
            >
              <h3 className="font-bold text-base leading-relaxed text-white/90">{axis.title}</h3>
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${isEmpty ? 'bg-white/10 text-white/50' : 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]'}`}>
                {isEmpty ? 'قريبًا' : `${count} مواقف`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
