import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (userId: string, role: User['role']) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [role, setRole] = useState<User['role']>(user.role);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRole(user.role);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(user.uid, role);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Função do Usuário</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p><strong>Usuário:</strong> {user.name || user.email}</p>
          <div>
            <label htmlFor="role">Função</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value as User['role'])} required className="input-style">
              <option value="user">Usuário</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`label{display:block;margin-bottom:0.5rem;font-weight:500;}.input-style{width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid #D1D5DB;}.btn-primary,.btn-secondary{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}button:disabled{opacity:0.5;}`}</style>
      </div>
    </div>
  );
};

export default EditUserModal;
