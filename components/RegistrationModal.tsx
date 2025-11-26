import React, { useState } from 'react';
import { UserRegistrationData } from '../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (userData: UserRegistrationData) => Promise<void>;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onRegister }) => {
  // FIX: Added 'companyName' to the initial state to match the UserRegistrationData type.
  const initialState: UserRegistrationData = {
    name: '',
    email: '',
    password: '',
    companyName: '',
  };

  const [userData, setUserData] = useState<UserRegistrationData>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Added 'companyName' to the validation check.
    if (!userData.name || !userData.email || !userData.password || !userData.companyName) {
        setError("Por favor, preencha todos os campos.");
        return;
    }
     if (userData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      await onRegister(userData);
      setUserData(initialState); 
      // onClose is called from the parent component upon success
    } catch (err) {
      console.error("Failed to register user:", err);
      setError("Falha ao criar a conta. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    setUserData(initialState);
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Conta Gratuita</h2>
          <button onClick={handleClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
          
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Completo</label>
            <input type="text" name="name" id="name" value={userData.name} onChange={handleChange} required className="input-style" placeholder="Seu Nome" />
          </div>

          {/* FIX: Added form field for companyName. */}
          <div>
            <label htmlFor="companyName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome da Empresa</label>
            <input type="text" name="companyName" id="companyName" value={userData.companyName} onChange={handleChange} required className="input-style" placeholder="Nome da sua empresa" />
          </div>

          <div>
            <label htmlFor="email-register" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input type="email" name="email" id="email-register" value={userData.email} onChange={handleChange} required className="input-style" placeholder="seu@email.com" />
          </div>

          <div>
            <label htmlFor="password-register" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha</label>
            <input type="password" name="password" id="password-register" value={userData.password} onChange={handleChange} required className="input-style" placeholder="••••••••" />
          </div>
          
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t dark:border-gray-600">
            <button type="button" onClick={handleClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 flex items-center">
              {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSaving ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
        <style>{`
          .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; }
          .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
        `}</style>
      </div>
    </div>
  );
};

export default RegistrationModal;
