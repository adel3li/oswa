import { AppState, saveState } from '../store';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { initAnalytics, trackEvent } from '../lib/analytics';
import posthog from 'posthog-js';

interface Props {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

export function Settings({ appState, setAppState }: Props) {
  const isNative = Capacitor.isNativePlatform();

  const handleReminderToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    let finalEnabled = enabled;

    if (enabled && isNative) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        const [h, m] = appState.reminderTime.split(':').map(Number);
        await LocalNotifications.schedule({
          notifications: [{
            id: 1,
            title: 'أُسوة',
            body: 'موقفُ اليوم: كيف عاملَ الناسَ ﷺ',
            schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
          }]
        });
      } else {
        finalEnabled = false;
      }
    } else if (!enabled && isNative) {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    }

    const next = await saveState({ reminderEnabled: finalEnabled });
    setAppState(next);
    trackEvent('reminder_set', { enabled: finalEnabled });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (isNative && appState.reminderEnabled) {
      const [h, m] = time.split(':').map(Number);
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      await LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: 'أُسوة',
          body: 'موقفُ اليوم: كيف عاملَ الناسَ ﷺ',
          schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
        }]
      });
    }
    const next = await saveState({ reminderTime: time });
    setAppState(next);
  };

  const handleConsentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const consent = e.target.checked;
    const next = await saveState({ analyticsConsent: consent });
    setAppState(next);
    if (!consent) {
      posthog.opt_out_capturing();
    } else {
      initAnalytics(true);
    }
  };

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>
      
      <div className="space-y-6">
        <section className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/10">
          <h2 className="text-[11px] text-[var(--color-brand-accent)] mb-6 font-bold tracking-wider">التنبيهات</h2>
          {isNative ? (
            <div>
              <label className="flex items-center justify-between mb-4">
                <span className="text-base font-medium">التذكير اليومي</span>
                <input type="checkbox" checked={appState.reminderEnabled} onChange={handleReminderToggle} className="w-5 h-5 accent-[var(--color-brand-accent)]" />
              </label>
              {appState.reminderEnabled && (
                <div className="flex items-center justify-between text-white/80 border-t border-white/5 pt-4 mt-4">
                  <span className="text-sm">وقت التذكير:</span>
                  <input type="time" value={appState.reminderTime} onChange={handleTimeChange} className="bg-black/20 text-white rounded-lg px-4 py-2 border border-white/10 outline-none focus:border-[var(--color-brand-accent)] text-sm transition-colors" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/50">التنبيهات مدعومة في التطبيق فقط.</p>
          )}
        </section>

        <section className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/10">
          <h2 className="text-[11px] text-[var(--color-brand-accent)] mb-6 font-bold tracking-wider">الخصوصية والتحليل</h2>
          <label className="flex items-start justify-between gap-6 cursor-pointer">
            <div className="flex-1">
              <span className="text-base font-medium block mb-2">المشاركة المجهولة</span>
              <span className="text-xs text-white/40 leading-relaxed block">نجمع أحداثاً مجهولة (بدون أي نصوص) لتحسين التطبيق.</span>
            </div>
            <input type="checkbox" checked={appState.analyticsConsent} onChange={handleConsentToggle} className="w-5 h-5 mt-1 accent-[var(--color-brand-accent)] shrink-0" />
          </label>
        </section>

        <section className="bg-[var(--color-brand-surface)] p-6 rounded-3xl border border-white/10">
          <h2 className="text-[11px] text-[var(--color-brand-accent)] mb-6 font-bold tracking-wider">المصادر والمنهج</h2>
          <div className="space-y-4 text-sm text-white/60 leading-relaxed">
            <p><span className="text-white/80 font-bold">المرجع الهيكلي:</span> استُمدت محاور التطبيق من كتاب «كيف عاملهم؟» للشيخ محمد صالح المنجد جزاه الله خيراً.</p>
            <p><span className="text-white/80 font-bold">المنهج:</span> الصياغات الوصفية هي محاولات تقريبية كُتبت بعناية وتخضع للمراجعة. النصوص الشريفة (قرآن وحديث) تُجلب بعد التحقق الحرفي من المصادر المعتمدة.</p>
          </div>
        </section>

        <section className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-accent)] flex items-center justify-center font-bold text-2xl mx-auto mb-4">أ</div>
          <p className="text-base font-bold text-white/80 mb-1">أُسوة</p>
          <p className="text-xs text-white/40 font-medium tracking-wide">من منظومة الحمد</p>
        </section>
      </div>
    </div>
  );
}
