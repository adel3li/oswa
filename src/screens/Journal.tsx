import { useEffect, useState } from 'react';
import { getJournal, deleteJournalEntry, JournalEntry } from '../store/journal';
import { mawaqifMap } from '../content';
import { Trash2 } from 'lucide-react';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getJournal();
    setEntries(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التأمل؟')) {
      await deleteJournalEntry(id);
      load();
    }
  };

  const grouped = entries.reduce((acc, entry) => {
    const d = new Date(entry.dateISO);
    const month = d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  if (entries.length === 0) {
    return (
      <div className="p-6 sm:p-10 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">سجلّ التأسّي</h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm">مساحتك الخاصة للتأمل في رحلتك اليومية. ما تكتبه هنا يُحفظ في جهازك فقط.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-8">سجلّ التأسّي</h1>
      
      <div className="space-y-10">
        {Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month}>
            <h2 className="text-sm font-bold text-[var(--color-brand-accent)] mb-4">{month}</h2>
            <div className="space-y-4">
              {monthEntries.map(entry => {
                const mawqif = mawaqifMap[entry.mawqifId];
                return (
                  <div key={entry.id} className="bg-[var(--color-brand-surface)] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-base text-white/90 mb-1">{mawqif?.title || 'موقف غير معروف'}</h3>
                        <p className="text-xs text-white/40">{new Date(entry.dateISO).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="text-white/20 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-base leading-loose text-white/80 whitespace-pre-wrap">{entry.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
