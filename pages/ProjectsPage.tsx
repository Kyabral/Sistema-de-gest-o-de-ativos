
import React, { useState } from 'react';
import { PlusIcon, ClockIcon } from '../components/common/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../hooks/useApp';
import AddProjectModal from '../components/projects/AddProjectModal';

const ProjectsPage: React.FC = () => {
  const { projects, addProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Concluído': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Em Andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Planejamento': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'Atrasado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão de Projetos</h1>
                <p className="text-gray-500 dark:text-gray-400">Acompanhe cronogramas, orçamentos e entregas.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center"><PlusIcon className="w-5 h-5 mr-2" /> Novo Projeto</button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
               <p className="text-sm text-gray-500 dark:text-gray-400">Projetos Ativos</p>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.filter(p => p.status === 'Em Andamento').length}</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
               <p className="text-sm text-gray-500 dark:text-gray-400">Concluídos</p>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.filter(p => p.status === 'Concluído').length}</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500">
               <p className="text-sm text-gray-500 dark:text-gray-400">Atrasados</p>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.filter(p => p.status === 'Atrasado').length}</p>
           </div>
       </div>

       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
           <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cronograma de Projetos</h3>
           <div className="space-y-6">
               {projects.length === 0 ? <p className="text-center text-gray-500">Nenhum projeto cadastrado.</p> : projects.map(project => (
                   <div key={project.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                       <div className="flex flex-col md:flex-row justify-between mb-2">
                           <div>
                               <h4 className="font-bold text-gray-900 dark:text-white text-lg">{project.name}</h4>
                               <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: {project.client} | Gerente: {project.manager}</p>
                           </div>
                           <div className="text-right mt-2 md:mt-0">
                               <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>{project.status}</span>
                               <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                           </div>
                       </div>
                       
                       <div className="relative pt-1">
                           <div className="flex mb-2 items-center justify-between">
                               <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-300">Progresso</span></div>
                               <div className="text-right"><span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">{project.progress}%</span></div>
                           </div>
                           <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-gray-700">
                               <div style={{ width: `${project.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
                           </div>
                       </div>
                       
                       <div className="flex justify-between items-center text-sm">
                           <div className="flex space-x-4">
                                <span className="flex items-center text-gray-600 dark:text-gray-400"><ClockIcon className="w-4 h-4 mr-1"/> {Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} dias restantes</span>
                                <span className="flex items-center text-gray-600 dark:text-gray-400">Orçamento: {formatCurrency(project.budget)}</span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
       <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addProject} />
       <style>{`.btn-primary{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:rgb(var(--color-primary-600));color:white;transition:background-color .2s}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}`}</style>
    </div>
  );
};

export default ProjectsPage;
