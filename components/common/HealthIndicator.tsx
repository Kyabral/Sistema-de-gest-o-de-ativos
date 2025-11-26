import React from 'react';

const HealthIndicator = ({ score }: { score: number | undefined }) => {
    if (score === undefined) return <span>N/A</span>;
    const getColor = () => {
        if (score > 70) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center justify-center" title={`Saúde: ${score}%`}>
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${getColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">{score}%</span>
        </div>
    );
};

export default HealthIndicator;
