
import React, { useState } from 'react';
import { PlusIcon } from '../components/common/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../hooks/useApp';
import AddEmployeeModal from '../components/hr/AddEmployeeModal';

const HRPage: React.FC = () => {
  const { employees, addEmployee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Recursos Humanos</h1>
                <p className="text-gray-600 dark:text-gray-400">Gestão de colaboradores, folha e férias.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center"><PlusIcon className="w-5 h-5 mr-2" /> Novo Colaborador</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.length === 0 ? <p className="text-gray-600 dark:text-gray-400 col-span-3 text-center">Nenhum colaborador cadastrado.</p> : employees.map(emp => (
                <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-start space-x-4 border border-gray-200 dark:border-gray-700">
                    <img src={emp.avatarUrl || 'https://ui-avatars.com/api/?background=random'} alt={emp.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{emp.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${emp.status === 'Ativo' ? 'bg-green-100 text-green-800' : emp.status === 'Férias' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {emp.status}
                            </span>
                        </div>
                        <p className="text-sm text-primary-700 dark:text-primary-400 font-bold mt-1">{emp.role}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{emp.department}</p>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Admissão</p>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{formatDate(emp.admissionDate)}</p>
                            </div>
                             <div>
                                <p className="text-gray-600 dark:text-gray-400">Salário</p>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{formatCurrency(emp.salary)}</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="text-xs text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 font-medium border border-gray-300 dark:border-gray-600 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Perfil</button>
                            <button className="text-xs text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 font-medium border border-gray-300 dark:border-gray-600 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Holerite</button>
                        </div>
                    </div>
                </div>
            ))}
       </div>
       <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addEmployee} />
       <style>{`.btn-primary{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:rgb(var(--color-primary-600));color:white;transition:background-color .2s}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}`}</style>
    </div>
  );
};

export default HRPage;
