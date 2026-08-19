import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { AppState, saveState } from "../store";
import { initAnalytics, trackEvent } from "../lib/analytics";
import anchorAyah from "../content/anchor-ayah.json";

interface Props {
  onComplete: (state: AppState) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [reminderTime, setReminderTime] = useState("07:00");
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleNext = () => setStep(s => s + 1);

  const finish = async () => {
    let finalReminder = reminderEnabled;
    if (reminderEnabled && Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        const [h, m] = reminderTime.split(':').map(Number);
        await LocalNotifications.schedule({
          notifications: [{
            id: 1,
            title: 'أُسوة',
            body: 'موقفُ اليوم: كيف عاملَ الناسَ ﷺ',
            schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
          }]
        });
      } else {
        finalReminder = false;
      }
    }

    const nextState = await saveState({
      onboardingDone: true,
      analyticsConsent,
      reminderEnabled: finalReminder,
      reminderTime
    });

    initAnalytics(analyticsConsent);
    trackEvent('onboarding_completed');
    onComplete(nextState);
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] flex flex-col p-6 items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full max-w-sm text-center">
            <h1 className="text-3xl font-bold mb-4 text-[var(--color-brand-gold)] font-amiri">أُسوة</h1>
            <p className="text-white/80 mb-12 leading-relaxed">رحلةٌ يومية قصيرة في هدي النبي ﷺ، تحوّل الموقف إلى عملٍ يُقرّبك منه.</p>
            
            <div className="bg-[var(--color-brand-surface)] p-6 rounded-2xl border border-white/5 mb-12">
              {anchorAyah.verified && anchorAyah.text ? (
                <p className="font-amiri text-xl leading-loose text-[var(--color-brand-gold)] mb-4">{anchorAyah.text}</p>
              ) : (
                <p className="font-sans text-lg text-white/60 mb-4 tracking-wide">سورة الأحزاب — الآية ٢١</p>
              )}
            </div>
            
            <button onClick={handleNext} className="w-full bg-[var(--color-brand-accent)] text-white py-4 rounded-xl font-medium active:scale-95 transition-transform">
              ابدأ الرحلة
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold mb-6">الاستمرارُ لا المنافسة</h2>
            <p className="text-white/80 leading-relaxed mb-6">لا نؤمن هنا بأرقام متتالية أو شارات تنافسية. رحلتك مع هذا التطبيق هي محاسبة لطيفة لنفسك، إن غبت يوماً عدت في الذي يليه بلا خسارة رصيد.</p>
            <p className="text-white/60 text-sm mb-12">التأسّي أثرٌ في القلب، لا عدّادٌ على شاشة.</p>
            
            <button onClick={handleNext} className="w-full bg-[var(--color-brand-accent)] text-white py-4 rounded-xl font-medium active:scale-95 transition-transform">
              فهمت، لنكمل
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full max-w-sm text-start">
            <h2 className="text-2xl font-bold mb-8">إعداداتك الأولية</h2>
            
            <div className="mb-8 space-y-6">
              {Capacitor.isNativePlatform() ? (
                <div className="bg-[var(--color-brand-surface)] p-5 rounded-2xl border border-white/5">
                  <label className="flex items-center justify-between mb-4">
                    <span className="font-medium text-lg">التذكير اليومي</span>
                    <input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} className="w-5 h-5 accent-[var(--color-brand-accent)]" />
                  </label>
                  {reminderEnabled && (
                    <div className="flex items-center justify-between mt-4 text-white/80">
                      <span>وقت التذكير:</span>
                      <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="bg-black/20 text-white rounded px-3 py-1 border border-white/10 outline-none focus:border-[var(--color-brand-accent)]" />
                    </div>
                  )}
                  <p className="text-xs text-white/50 mt-4 leading-relaxed">سنطلب إذن النظام للتنبيهات عند المتابعة.</p>
                </div>
              ) : (
                <p className="text-sm text-white/50 text-center">التنبيهات مدعومة في التطبيق فقط.</p>
              )}

              <div className="bg-[var(--color-brand-surface)] p-5 rounded-2xl border border-white/5">
                <label className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-medium text-lg block mb-2">تحسين التطبيق</span>
                    <span className="text-xs text-white/50 leading-relaxed block">نجمع بيانات استخدام مجهولة (بدون أي نصوص أو محتوى شخصي) لنفهم كيف يُستخدم التطبيق ونحسّنه. يمكنك إيقاف هذا لاحقاً من الإعدادات.</span>
                  </div>
                  <input type="checkbox" checked={analyticsConsent} onChange={e => setAnalyticsConsent(e.target.checked)} className="w-5 h-5 mt-1 accent-[var(--color-brand-accent)] shrink-0" />
                </label>
              </div>
            </div>
            
            <button onClick={finish} className="w-full bg-white text-[var(--color-brand-bg)] py-4 rounded-xl font-bold active:scale-95 transition-transform">
              توكّلنا على الله
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
