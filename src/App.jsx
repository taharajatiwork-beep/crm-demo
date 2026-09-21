import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import Contacts from './components/Contacts';
import DealDetail from './components/DealDetail';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDeal, setSelectedDeal] = useState(1);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />;
      case 'pipeline':
        return <PipelineBoard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />;
      case 'contacts':
        return <Contacts setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />;
      case 'deal':
        return <DealDetail dealId={selectedDeal} setActivePage={setActivePage} />;
      default:
        return <Dashboard setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="mr-64 p-6 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
