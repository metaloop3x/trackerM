import React, { useMemo } from 'react';
import { Transaction, Project, INCOME_CATEGORIES, Category } from '../types';
import { GlassCard } from './GlassUI';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, Calendar } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  projects: Project[];
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, projects, onNavigate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // --- Monthly Overview Calculations ---
  const monthlyStats = useMemo(() => {
    const monthlyTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTx
      .filter(t => INCOME_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTx
      .filter(t => !INCOME_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    // Top 3 Expense Categories
    const catMap: Record<string, number> = {};
    monthlyTx.filter(t => !INCOME_CATEGORIES.includes(t.category)).forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { income, expense, topCategories };
  }, [transactions, currentMonth, currentYear]);

  // --- Today Snapshot Calculations ---
  const todayStats = useMemo(() => {
    const todayTx = transactions.filter(t => t.date.split('T')[0] === todayStr);
    const expense = todayTx
      .filter(t => !INCOME_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
    return { expense, count: todayTx.length };
  }, [transactions, todayStr]);

  // --- Active Projects Summary ---
  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status === 'active').map(p => {
      const spent = transactions
        .filter(t => t.projectId === p.id && !INCOME_CATEGORIES.includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...p, spent };
    });
  }, [projects, transactions]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* A. Monthly Overview */}
      <section>
        <h2 className="text-white/80 text-sm font-semibold mb-3 px-1 uppercase tracking-wider">This Month</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <GlassCard className="!p-4 bg-green-500/10 border-green-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-green-400/20 rounded-lg text-green-400">
                <ArrowDownRight size={20} />
              </div>
              <span className="text-xs text-green-300 font-mono">+Income</span>
            </div>
            <p className="text-xl font-bold text-white">${monthlyStats.income.toLocaleString()}</p>
          </GlassCard>

          <GlassCard className="!p-4 bg-red-500/10 border-red-500/20">
             <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-red-400/20 rounded-lg text-red-400">
                <ArrowUpRight size={20} />
              </div>
              <span className="text-xs text-red-300 font-mono">-Expense</span>
            </div>
            <p className="text-xl font-bold text-white">${monthlyStats.expense.toLocaleString()}</p>
          </GlassCard>
        </div>

        {/* Net & Top Categories */}
        <GlassCard className="!p-5">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-white/60 text-sm">Net Flow</span>
                <span className={`text-lg font-bold ${monthlyStats.income - monthlyStats.expense >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>
                    ${(monthlyStats.income - monthlyStats.expense).toLocaleString()}
                </span>
            </div>
            <div>
                <span className="text-xs text-white/40 mb-2 block">TOP SPENDING</span>
                <div className="space-y-3">
                    {monthlyStats.topCategories.map(([cat, amount]) => (
                        <div key={cat} className="flex justify-between items-center text-sm">
                            <span className="text-white/80">{cat}</span>
                            <span className="text-white font-mono">${amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {monthlyStats.topCategories.length === 0 && <span className="text-white/30 text-xs">No expenses yet</span>}
                </div>
            </div>
        </GlassCard>
      </section>

      {/* B. Today Snapshot */}
      <section>
        <h2 className="text-white/80 text-sm font-semibold mb-3 px-1 uppercase tracking-wider">Today Snapshot</h2>
        <GlassCard className="flex items-center justify-between !p-5">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-300">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-white/50 text-xs">Today's Spending</p>
                    <p className="text-2xl font-bold text-white">${todayStats.expense.toLocaleString()}</p>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-white/40 text-xs">{todayStats.count} txns</p>
            </div>
        </GlassCard>
      </section>

      {/* C. Project Activity */}
      <section>
        <div className="flex justify-between items-end mb-3 px-1">
             <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Active Projects</h2>
             <button onClick={() => onNavigate('projects')} className="text-blue-300 text-xs hover:text-white transition-colors">View All</button>
        </div>
        
        <div className="space-y-3">
            {activeProjects.slice(0, 3).map(p => {
                const percent = Math.min(100, (p.spent / p.budget) * 100);
                return (
                    <GlassCard key={p.id} className="!p-4" onClick={() => onNavigate('projects')}>
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-white">{p.name}</span>
                            <span className="text-xs text-white/60">${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${percent}%` }}
                                className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : 'bg-blue-400'}`}
                            />
                        </div>
                    </GlassCard>
                )
            })}
            {activeProjects.length === 0 && (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-white/30 text-sm">
                    No active projects
                </div>
            )}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
