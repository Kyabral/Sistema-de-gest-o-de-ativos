import React, { useState } from 'react';
import { Project } from '../../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, 'id' | 'tenantId'>) => Promise<void>;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  const initialState = { name: '', client: '', status: 'Planejamento' as any, progress: 0, startDate: '', endDate: '', budget: 0, manager: '' };
  const [project, setProject] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: ['progress', 'budget'].includes(name) ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(project);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Novo Projeto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="dark:text-gray-300">Nome do Projeto</label><input type="text" name="name" value={project.name} onChange={handleChange} required className="input-style"/></div>
          <div><label className="dark:text-gray-300">Cliente</label><input type="text" name="client" value={project.client} onChange={handleChange} required className="input-style"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="dark:text-gray-300">Início</label><input type="date" name="startDate" value={project.startDate} onChange={handleChange} required className="input-style"/></div>
            <div><label className="dark:text-gray-300">Fim Previsto</label><input type="date" name="endDate" value={project.endDate} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="dark:text-gray-300">Orçamento (R$)</label><input type="number" name="budget" value={project.budget} onChange={handleChange} required className="input-style"/></div>
            <div><label className="dark:text-gray-300">Gerente</label><input type="text" name="manager" value={project.manager} onChange={handleChange} required className="input-style"/></div>
          </div>
           <div><label className="dark:text-gray-300">Status Inicial</label><select name="status" value={project.status} onChange={handleChange} className="input-style"><option>Planejamento</option><option>Em Andamento</option><option>Concluído</option><option>Atrasado</option></select></div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
        <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#333;padding:0.5rem 1rem;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
      </div>
    </div>
  );
};

export default AddProjectModal;
