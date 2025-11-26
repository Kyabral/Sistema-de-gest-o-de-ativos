
import React, { useState } from 'react';
import { Employee } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id' | 'tenantId'>) => Promise<void>;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave }) => {
  const initialState = { name: '', role: '', department: '', email: '', admissionDate: '', salary: 0, status: 'Ativo' as any };
  const [employee, setEmployee] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`;
    await onSave({ ...employee, avatarUrl });
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Novo Colaborador</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label-style">Nome Completo</label><input type="text" name="name" value={employee.name} onChange={handleChange} required className="input-style"/></div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="label-style">Cargo</label><input type="text" name="role" value={employee.role} onChange={handleChange} required className="input-style"/></div>
              <div><label className="label-style">Departamento</label><input type="text" name="department" value={employee.department} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div><label className="label-style">E-mail Corporativo</label><input type="email" name="email" value={employee.email} onChange={handleChange} required className="input-style"/></div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="label-style">Data de Admissão</label><input type="date" name="admissionDate" value={employee.admissionDate} onChange={handleChange} required className="input-style"/></div>
              <div><label className="label-style">Salário Base (R$)</label><input type="number" name="salary" value={employee.salary} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
        <style>{`
            .label-style { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; color: #111827; }
            .dark .label-style { color: #D1D5DB; }
            .input-style { width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: #fff; color: #111827; }
            .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
            .btn-primary { background-color: rgb(var(--color-primary-600)); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; }
            .btn-secondary { background-color: #e5e7eb; color: #1f2937; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; }
            .dark .btn-secondary { background-color: #4b5563; color: #e5e7eb; }
        `}</style>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
