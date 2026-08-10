import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import { Header } from './components/Header';

const Home = lazy(() => import('./pages/Home'));
const SurveyForm = lazy(() => import('./components/SurveyForm'));
const CreateSurvey = lazy(() =>
  import('./pages/CreateSurvey').then((module) => ({ default: module.CreateSurvey })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground" role="status">
      Loading…
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const showHeader = !location.pathname.startsWith('/survey/');

  return (
    <div className="relative min-h-screen bg-background font-sans antialiased">
      <div className="relative flex min-h-screen flex-col">
        {showHeader && <Header />}
        <main className="flex-1">
          <div className="container mx-auto py-6">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateSurvey />} />
                <Route path="/survey/:id" element={<SurveyForm />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;