import { Preferences } from '@capacitor/preferences';

const STATE_KEY = 'uswa.state.v1';

export interface AppState {
  onboardingDone: boolean;
  analyticsConsent: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
  fontSize: 'small' | 'medium' | 'large';
  todayChecklist: Record<number, boolean[]>; // UTC day -> array of booleans matching applications length
  journeyCompleted: Record<number, boolean>; // UTC day -> completed
}

const defaultState: AppState = {
  onboardingDone: false,
  analyticsConsent: false,
  reminderEnabled: false,
  reminderTime: '07:00',
  fontSize: 'medium',
  todayChecklist: {},
  journeyCompleted: {},
};

export async function getState(): Promise<AppState> {
  const { value } = await Preferences.get({ key: STATE_KEY });
  if (!value) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(value) };
  } catch {
    return defaultState;
  }
}

export async function saveState(state: Partial<AppState>): Promise<AppState> {
  const current = await getState();
  const next = { ...current, ...state };
  await Preferences.set({ key: STATE_KEY, value: JSON.stringify(next) });
  return next;
}
