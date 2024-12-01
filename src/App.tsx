import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CreateSurvey } from './pages/CreateSurvey';
import SurveyForm from './components/SurveyForm';
import Home from './pages/Home';
import { ThemeProvider } from './components/theme-provider';
import { Header } from './components/Header';

function AppContent() {
  const location = useLocation();
  const showHeader = !location.pathname.startsWith('/survey/');

  return (
    <div className="relative min-h-screen bg-background font-sans antialiased">
      <div className="relative flex min-h-screen flex-col">
        {showHeader && <Header />}
        <main className="flex-1">
          <div className="container mx-auto py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateSurvey />} />
              <Route path="/survey/:id" element={<SurveyForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AppContent />
        <Toaster position="top-center" richColors />
      </Router>
    </ThemeProvider>
  );
}

export default App;