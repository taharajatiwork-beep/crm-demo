import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import Contacts from './components/Contacts';
import DealDetail from './components/DealDetail';
import CommandPalette from './components/CommandPalette';
import QuickAdd from './components/QuickAdd';
import { ToastContainer } from './components/Toast';
import PageLoader from './ui/PageLoader';
import { deals as initialDeals, contacts as initialContacts } from './data';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('today');
  const [selectedDeal, setSelectedDeal] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Listen for ⌘K toggle from CommandPalette's global listener
  useEffect(() => {
    const toggle = () => setCmdPaletteOpen((prev) => !prev);
    window.addEventListener('command-palette-toggle', toggle);
    return () => window.removeEventListener('command-palette-toggle', toggle);
  }, []);

  // Cmd/Ctrl+Shift+K → open QuickAdd
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickAddOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Simulate a brief loading state on every page switch
  const navigateTo = useCallback((page) => {
    if (page === activePage) return;
    setPageLoading(true);
    // Brief simulated load (300 ms) then reveal new page
    setTimeout(() => {
      setActivePage(page);
      setPageLoading(false);
    }, 300);
  }, [activePage]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'today':
        return <TodayView setActivePage={navigateTo} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'dashboard':
        return <Dashboard setActivePage={navigateTo} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'pipeline':
        return <PipelineBoard setActivePage={navigateTo} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'contacts':
        return <Contacts setActivePage={navigateTo} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'deal':
        return <DealDetail dealId={selectedDeal} setActivePage={navigateTo} showToast={showToast} />;
      default:
        return <TodayView setActivePage={navigateTo} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar activePage={activePage} setActivePage={navigateTo} />
      <main className="mr-64 p-6 min-h-screen max-md:mr-0 max-md:p-4 max-md:pt-16">
        {pageLoading ? <PageLoader /> : renderPage()}
      </main>
      <ToastContainer toasts={toasts} />

      {/* Floating Quick-Add button */}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-accent hover:bg-accent-dark text-white rounded-full shadow-xl shadow-accent/30 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
        aria-label="ایجاد سریع"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={navigateTo}
        onSelectDeal={setSelectedDeal}
      />
      <QuickAdd
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onDealSubmit={(data) => {
          // In a real app this would call an API; for the demo we just show a toast
          if (showToast) showToast(`معامله «${data.title}» ایجاد شد ✓`, 'success');
        }}
        onContactSubmit={(data) => {
          if (showToast) showToast(`مخاطب «${data.name}» اضافه شد ✓`, 'success');
        }}
        showToast={showToast}
      />
    </div>
  );
}

export default App;
