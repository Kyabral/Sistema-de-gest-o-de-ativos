import React, { useState } from 'react';
import { User } from '../../types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: { name: string; email: string; role: User['role'] }) => Promise<void>;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('user');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ name, email, role });
      setSuccessMsg(`Convite registrado para ${email}.`);
      
      // UX Delay to read message
      setTimeout(() => {
          handleClose();
      }, 2500);
      
    } catch (err: any) {
      console.error(err);
      setError("Falha ao registrar convite.");
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('user');
    setError(null);
    setSuccessMsg(null);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Convidar Novo Usuário</h2>
        
        {!successMsg ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-100 p-3 rounded text-red-700 text-sm">{error}</div>}
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Nota de Demonstração:</strong> O sistema registrará o convite no banco de dados. 
                      Como este é um ambiente de demonstração, o e-mail real não será disparado. 
                      O usuário poderá acessar o sistema criando uma conta com este e-mail.
                  </p>
              </div>

              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="input-style"/>
              </div>
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style"/>
              </div>
              <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                  <select id="role" value={role} onChange={e => setRole(e.target.value as User['role'])} required className="input-style">
                      <option value="user">Usuário (Visualizar)</option>
                      <option value="manager">Gerente (Editar/Aprovar)</option>
                      <option value="admin">Administrador (Acesso Total)</option>
                  </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Processando...' : 'Gerar Convite'}</button>
              </div>
            </form>
        ) : (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Convite Registrado!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{successMsg}</p>
                <p className="text-xs text-gray-400 mt-4">Fechando janelas...</p>
            </div>
        )}

        <style>{`
            .input-style{width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid #D1D5DB; background-color: #fff; color: #1f2937;}
            .dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}
            .btn-primary{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:rgb(var(--color-primary-600));color:white;}
            .btn-secondary{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:#e5e7eb;color:#1f2937;}
            .dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}
            button:disabled{opacity:0.5;}
        `}</style>
      </div>
    </div>
  );
};

export default InviteUserModal;