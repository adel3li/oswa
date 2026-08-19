import { Preferences } from '@capacitor/preferences';

const JOURNAL_KEY = 'uswa.journal.v1';

export interface JournalEntry {
  id: string;
  dateISO: string;
  mawqifId: string;
  text: string;
  createdAt: number;
}

export async function getJournal(): Promise<JournalEntry[]> {
  const { value } = await Preferences.get({ key: JOURNAL_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<void> {
  const entries = await getJournal();
  const newEntry: JournalEntry = {
    ...entry,
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now()
  };
  entries.unshift(newEntry);
  await Preferences.set({ key: JOURNAL_KEY, value: JSON.stringify(entries) });
}

export async function deleteJournalEntry(id: string): Promise<void> {
  let entries = await getJournal();
  entries = entries.filter(e => e.id !== id);
  await Preferences.set({ key: JOURNAL_KEY, value: JSON.stringify(entries) });
}
