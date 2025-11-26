import React, { useMemo } from 'react';
import { User } from '../../types';

interface UserListProps {
    users: User[];
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

const roleOrder: User['role'][] = ['admin', 'manager', 'user'];
const roleLabels: Record<User['role'], string> = {
    admin: 'Administradores',
    manager: 'Gerentes',
    user: 'Usuários',
};

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    const groupedUsers = useMemo(() => {
        const groups: Record<User['role'], User[]> = {
            admin: [],
            manager: [],
            user: [],
        };
        users.forEach(user => {
            if (groups[user.role]) {
                groups[user.role].push(user);
            }
        });
        return groups;
    }, [users]);

    return (
        <div className="space-y-8">
            {roleOrder.map(role => {
                const userList = groupedUsers[role];
                if (userList.length === 0) return null;

                return (
                    <div key={role}>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            {roleLabels[role]} <span className="text-base font-normal text-gray-500 dark:text-gray-400">({userList.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userList.map(user => (
                                <div key={user.uid} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col justify-between border border-transparent hover:border-primary-500 transition-all">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        {user.status === 'invited' && (
                                            <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                    {(onEdit || onDelete) && (
                                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            {onEdit && <button onClick={() => onEdit(user)} className="text-sm font-medium text-yellow-600 hover:underline">Editar</button>}
                                            {onDelete && <button onClick={() => onDelete(user)} className="text-sm font-medium text-red-600 hover:underline">Remover</button>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserList;
