import { useState, useMemo } from 'react';

type SortDirection = 'ascending' | 'descending';

export const useSort = <T, K extends keyof T>(items: T[], initialKey: K, initialDirection: SortDirection = 'descending') => {
    const [sortConfig, setSortConfig] = useState<{ key: K; direction: SortDirection } | null>({ key: initialKey, direction: initialDirection });

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;
                
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: K) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { sortedItems, requestSort, sortConfig };
};
