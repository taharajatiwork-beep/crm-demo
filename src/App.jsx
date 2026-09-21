import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import Contacts from './components/Contacts';
import DealDetail from './components/DealDetail';
import { ToastContainer } from './components/Toast';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDeal, setSelectedDeal] = useState(1);
  const [toasts, setToasts] = useState([]);

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
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'pipeline':
        return <PipelineBoard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'contacts':
        return <Contacts setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
      case 'deal':
        return <DealDetail dealId={selectedDeal} setActivePage={setActivePage} showToast={showToast} />;
      default:
        return <Dashboard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="mr-64 p-6 min-h-screen max-md:mr-0 max-md:p-4 max-md:pt-16">
        {renderPage()}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
