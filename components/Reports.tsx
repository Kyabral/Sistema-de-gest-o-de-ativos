import React from 'react';
import { DocumentChartBarIcon } from './icons';

const Reports: React.FC = () => {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatórios e Business Intelligence</h1>
                <p className="text-gray-500 dark:text-gray-400">Visualize seus dados e extraia insights poderosos com dashboards dinâmicos.</p>
            </div>

            <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Módulo de BI em Desenvolvimento</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Dashboards customizáveis e relatórios financeiros consolidados estarão disponíveis aqui em breve.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
