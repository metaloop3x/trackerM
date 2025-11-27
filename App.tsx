import React, { useState, useEffect } from 'react';
import { Plus, Home, PieChart as PieChartIcon, Settings as SettingsIcon, Lock, Folder, LayoutGrid } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import Scanner from './components/Scanner';
import AddTransaction from './components/AddTransaction';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Insights from './components/Insights';
import Settings from './components/Settings';
import { Category, Transaction, ViewState, ScanResult, Budget, Project } from './types';

// Initial dummy data
const DEFAULT_BUDGETS: Budget[] = [
    { category: Category.FOOD, limit: 600 },
    { category: Category.ART_MATERIALS, limit: 300 },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [view, setView] = useState<ViewState>('auth');
  
  // --- STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('glassbooks_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('glassbooks_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('glassbooks_projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Flow State
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanImage, setScanImage] = useState<string | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('glassbooks_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('glassbooks_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('glassbooks_projects', JSON.stringify(projects)); }, [projects]);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) { setIsAuthenticated(true); setView('dashboard'); } 
    else { alert("PIN must be at least 4 digits"); }
  };

  const handleScanComplete = (result: ScanResult, image: string) => {
    setScanResult(result);
    setScanImage(image);
    setView('list'); 
  };

  const handleSaveTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    setScanResult(null);
    setScanImage(null);
    setView('dashboard');
  };

  const handleUpdateBudget = (category: Category, limit: number) => {
      setBudgets(prev => {
          const exists = prev.find(b => b.category === category);
          if (exists) {
              return prev.map(b => b.category === category ? { ...b, limit } : b);
          }
          return [...prev, { category, limit }];
      });
  };

  const handleClearData = () => {
      setTransactions([]);
      setProjects([]);
      setBudgets(DEFAULT_BUDGETS);
      localStorage.clear();
      setView('dashboard');
  };

  // --- RENDER HELPERS ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
         <GlassCard className="w-full max-w-sm text-center py-12">
            <div className="mb-6 flex justify-center">
               <div className="p-4 bg-white/10 rounded-full text-white/80"><Lock size={40} /></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">GlassBooks AI</h1>
            <p className="text-white/50 mb-8">Personal Secure Finance Tracker</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <GlassInput type="password" placeholder="Enter PIN" className="text-center text-xl tracking-widest" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
              <GlassButton type="submit" className="w-full">Unlock</GlassButton>
            </form>
         </GlassCard>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen w-full bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden font-sans">
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-md mx-auto min-h-screen relative flex flex-col">
        {/* Header */}
        <header className="px-6 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-black/5">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            {view === 'dashboard' && 'Dashboard'}
            {view === 'projects' && 'Projects'}
            {view === 'insights' && 'Analytics'}
            {view === 'settings' && 'Settings'}
            {view === 'scan' && 'New Entry'}
            {view === 'list' && 'Edit Entry'}
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 border border-white/20 shadow-lg" />
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {view === 'dashboard' && <Dashboard transactions={transactions} projects={projects} onNavigate={setView} />}
          
          {view === 'projects' && <Projects 
                projects={projects} 
                transactions={transactions} 
                onAddProject={(p) => setProjects(prev => [...prev, p])}
                onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))}
          />}

          {view === 'insights' && <Insights transactions={transactions} />}
          
          {view === 'settings' && <Settings budgets={budgets} onUpdateBudget={handleUpdateBudget} onClearData={handleClearData} />}
          
          {view === 'scan' && <Scanner onScanComplete={handleScanComplete} onCancel={() => setView('dashboard')} />}
          
          {(scanResult || view === 'list') && (
             <AddTransaction 
               initialData={scanResult} 
               imagePreview={scanImage}
               projects={projects}
               onSave={handleSaveTransaction} 
               onCancel={() => { setScanResult(null); setScanImage(null); setView('dashboard'); }} 
             />
          )}
        </div>

        {/* Navigation Bar */}
        {!scanResult && view !== 'scan' && view !== 'list' && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-3 shadow-2xl flex justify-between items-center">
              
              <NavButton icon={<Home size={22} />} label="Home" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
              <NavButton icon={<Folder size={22} />} label="Projects" active={view === 'projects'} onClick={() => setView('projects')} />
              
              <button 
                onClick={() => setView('scan')}
                className="mx-2 bg-gradient-to-tr from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] transform hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={24} />
              </button>

              <NavButton icon={<PieChartIcon size={22} />} label="Insights" active={view === 'insights'} onClick={() => setView('insights')} />
              <NavButton icon={<SettingsIcon size={22} />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
              
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}

const NavButton = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 ${active ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/70'}`}
    >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);
