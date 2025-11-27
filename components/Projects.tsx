import React, { useState } from 'react';
import { Project, Transaction, INCOME_CATEGORIES } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './GlassUI';
import { Plus, Folder, AlertCircle, TrendingUp, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProjectsProps {
  projects: Project[];
  transactions: Transaction[];
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, transactions, onAddProject, onDeleteProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
      name: '',
      budget: 0,
      description: '',
      status: 'active'
  });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.budget) return;
    
    onAddProject({
        id: uuidv4(),
        name: newProject.name,
        budget: Number(newProject.budget),
        description: newProject.description,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0]
    });
    setIsCreating(false);
    setNewProject({ name: '', budget: 0, description: '', status: 'active' });
  };

  const getProjectStats = (pid: string) => {
      const txs = transactions.filter(t => t.projectId === pid && !INCOME_CATEGORIES.includes(t.category));
      const spent = txs.reduce((acc, t) => acc + t.amount, 0);
      return { spent, count: txs.length, txs };
  };

  // --- DETAIL VIEW ---
  if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (!project) return null;
      const { spent, txs } = getProjectStats(project.id);
      const percent = Math.min(100, (spent / project.budget) * 100);

      return (
          <div className="pb-24 animate-in slide-in-from-right duration-300">
              <button onClick={() => setSelectedProject(null)} className="mb-4 text-white/50 hover:text-white flex items-center gap-1 text-sm">
                 ← Back to Projects
              </button>

              <GlassCard className="mb-6 border-blue-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                        <p className="text-white/60 text-sm mt-1">{project.description || 'No description'}</p>
                    </div>
                    <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                        {project.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-white/70">Budget Usage</span>
                          <span className="text-white font-mono">${spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                                style={{ width: `${percent}%` }}
                                className={`h-full rounded-full transition-all duration-1000 ${percent > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}
                            />
                      </div>
                      {percent > 100 && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> Over Budget</p>}
                  </div>
              </GlassCard>

              <h3 className="text-white/80 font-semibold mb-3">Transactions</h3>
              <div className="space-y-3">
                  {txs.length === 0 ? (
                      <div className="text-white/30 text-center py-8 text-sm">No transactions linked to this project yet.</div>
                  ) : (
                      txs.map(t => (
                          <GlassCard key={t.id} className="!p-4 flex justify-between items-center">
                              <div>
                                  <p className="text-white font-medium">{t.merchant}</p>
                                  <p className="text-white/50 text-xs">{t.date} • {t.category}</p>
                              </div>
                              <span className="text-white font-mono">-${t.amount}</span>
                          </GlassCard>
                      ))
                  )}
              </div>

              <div className="mt-8 text-center">
                  <button 
                    onClick={() => { onDeleteProject(project.id); setSelectedProject(null); }}
                    className="text-red-400 text-sm opacity-50 hover:opacity-100 transition-opacity"
                  >
                      Delete Project
                  </button>
              </div>
          </div>
      )
  }

  // --- LIST VIEW ---
  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Projects</h2>
        <button onClick={() => setIsCreating(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-blue-300">
            <Plus size={24} />
        </button>
      </div>

      {isCreating && (
          <GlassCard className="mb-6 border-blue-500/50">
              <form onSubmit={handleCreate} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-semibold">New Project</h3>
                      <button type="button" onClick={() => setIsCreating(false)}><X size={18} className="text-white/50"/></button>
                  </div>
                  <div>
                      <label className="text-xs text-white/50 block mb-1">Project Name</label>
                      <GlassInput autoFocus value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="e.g. Exhibition 2025" />
                  </div>
                  <div>
                      <label className="text-xs text-white/50 block mb-1">Total Budget</label>
                      <GlassInput type="number" value={newProject.budget || ''} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} placeholder="5000" />
                  </div>
                   <div>
                      <label className="text-xs text-white/50 block mb-1">Description (Optional)</label>
                      <GlassInput value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Notes..." />
                  </div>
                  <GlassButton type="submit" className="w-full">Create Project</GlassButton>
              </form>
          </GlassCard>
      )}

      <div className="grid gap-4">
          {projects.map(p => {
              const { spent, count } = getProjectStats(p.id);
              const percent = Math.min(100, (spent / p.budget) * 100);
              
              return (
                  <GlassCard key={p.id} onClick={() => setSelectedProject(p.id)} className="group cursor-pointer hover:border-white/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className="p-3 bg-white/5 rounded-xl text-blue-300 group-hover:bg-blue-500/20 transition-colors">
                                  <Folder size={20} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-white leading-tight">{p.name}</h3>
                                  <p className="text-xs text-white/50">{count} items</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="block font-mono text-white font-semibold">${spent.toLocaleString()}</span>
                              <span className="text-[10px] text-white/40">of ${p.budget.toLocaleString()}</span>
                          </div>
                      </div>
                      
                      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                             style={{ width: `${percent}%` }}
                             className={`absolute top-0 left-0 h-full rounded-full ${percent > 90 ? 'bg-red-500' : 'bg-blue-400'}`}
                          />
                      </div>
                  </GlassCard>
              )
          })}
          {projects.length === 0 && !isCreating && (
              <div className="text-center py-12 text-white/30 border-2 border-dashed border-white/10 rounded-2xl">
                  No projects yet. <br/> Create one to track exhibition costs.
              </div>
          )}
      </div>
    </div>
  );
};

export default Projects;
