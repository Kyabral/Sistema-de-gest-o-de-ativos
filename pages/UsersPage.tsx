import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { User } from '../types';
import { PlusIcon } from '../components/common/icons';
import UserList from '../components/users/UserList';
import InviteUserModal from '../components/users/InviteUserModal';
import EditUserModal from '../components/users/EditUserModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

const UsersPage: React.FC = () => {
    const { users, isLoading, error, inviteUser, updateUserRole, deleteUser } = useApp();
    const { user: currentUser } = useAuth();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser.uid);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const canManageUsers = currentUser?.role === 'admin';

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Organograma e Usuários</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie os membros e as permissões da sua equipe.</p>
                </div>
                {canManageUsers && (
                    <button onClick={() => setIsInviteModalOpen(true)} className="btn btn-primary mt-4 md:mt-0">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Convidar Usuário
                    </button>
                )}
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <UserList 
                    users={users} 
                    onEdit={canManageUsers ? handleOpenEdit : undefined} 
                    onDelete={canManageUsers ? handleOpenDelete : undefined} 
                />
            )}

            {canManageUsers && (
                <>
                    <InviteUserModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        onSave={inviteUser}
                    />
                    {selectedUser && (
                        <EditUserModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            user={selectedUser}
                            onSave={updateUserRole}
                        />
                    )}
                    {selectedUser && (
                        <ConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            title="Remover Usuário"
                            message={`Tem certeza que deseja remover ${selectedUser.name || selectedUser.email} da equipe?`}
                        />
                    )}
                </>
            )}

            <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover {background-color:rgb(var(--color-primary-700))}`}</style>
        </div>
    );
};

export default UsersPage;
