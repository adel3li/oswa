import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getState, AppState } from './store';
import { initAnalytics, trackEvent } from './lib/analytics';
import { Onboarding } from './screens/Onboarding';
import { MainLayout } from './components/MainLayout';
import { Home } from './screens/Home';
import { Browse } from './screens/Browse';
import { Journal } from './screens/Journal';
import { Settings } from './screens/Settings';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    getState().then(state => {
      setAppState(state);
      initAnalytics(state.analyticsConsent);
      if (state.onboardingDone) {
        trackEvent('app_opened');
      }
    });
  }, []);

  if (!appState) return null;

  if (!appState.onboardingDone) {
    return <Onboarding onComplete={(newState) => setAppState(newState)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home appState={appState} setAppState={setAppState} />} />
          <Route path="browse" element={<Browse />} />
          <Route path="journal" element={<Journal />} />
          <Route path="settings" element={<Settings appState={appState} setAppState={setAppState} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
