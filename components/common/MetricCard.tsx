
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string; // Expecting classes like 'bg-blue-500'
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  // Extract color name to create light backgrounds (e.g., from 'bg-blue-500' extract 'blue')
  const colorMatch = color.match(/bg-([a-z]+)-(\d+)/);
  const baseColor = colorMatch ? colorMatch[1] : 'gray';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${baseColor}-50 dark:bg-${baseColor}-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      
      {/* Optional: Add trend indicator here if data available */}
      {/* <div className="mt-4 flex items-center text-sm">
        <span className="text-green-500 font-medium flex items-center">
           <ArrowUpIcon className="w-3 h-3 mr-1"/> 12%
        </span>
        <span className="text-gray-400 ml-2">vs mês anterior</span>
      </div> */}
    </div>
  );
};

export default MetricCard;
