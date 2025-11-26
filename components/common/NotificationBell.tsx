import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, ExclamationTriangleIcon, ShieldCheckIcon } from './icons';
import { Notification } from '../../utils/notificationUtils';

interface NotificationBellProps {
    notifications: Notification[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const notificationCount = notifications.length;

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={togglePopover}
                className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="View notifications"
            >
                <BellIcon className="h-6 w-6" />
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                    <div className="p-3 font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700">
                        Notificações ({notificationCount})
                    </div>
                    {notificationCount > 0 ? (
                        <ul className="max-h-80 overflow-y-auto divide-y dark:divide-gray-700">
                            {notifications.map(notif => (
                                <li key={notif.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {notif.type === 'garantia' ? (
                                                 <ShieldCheckIcon className="w-5 h-5 text-yellow-500" />
                                            ) : (
                                                 <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Expira em {notif.daysRemaining} dia(s)
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
                            Nenhuma notificação nova.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;