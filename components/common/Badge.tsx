
import React from 'react';
import { AssetStatus, ApprovalStatus } from '../../types';

interface BadgeProps {
  status: AssetStatus | ApprovalStatus | string;
  type: 'asset' | 'approval' | 'default';
  title?: string;
}

const assetStatusConfig: Record<string, string> = {
  [AssetStatus.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [AssetStatus.IN_REPAIR]: "bg-orange-100 text-orange-700 border-orange-200",
  [AssetStatus.DECOMMISSIONED]: "bg-slate-100 text-slate-700 border-slate-200",
  [AssetStatus.IDLE]: "bg-blue-100 text-blue-700 border-blue-200",
};

const approvalStatusConfig: Record<string, string> = {
  [ApprovalStatus.APPROVED]: "bg-teal-100 text-teal-700 border-teal-200",
  [ApprovalStatus.AUTO_APPROVED]: "bg-sky-100 text-sky-700 border-sky-200",
  [ApprovalStatus.PENDING]: "bg-amber-100 text-amber-700 border-amber-200",
  [ApprovalStatus.REJECTED]: "bg-rose-100 text-rose-700 border-rose-200",
};

const Badge: React.FC<BadgeProps> = ({ status, type, title }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
  
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200"; // Default

  if (type === 'asset') {
      colorClass = assetStatusConfig[status] || colorClass;
  } else if (type === 'approval') {
      colorClass = approvalStatusConfig[status] || colorClass;
  } else {
      // Generic Handling
      if (['Pago', 'Concluído', 'Entregue', 'Faturado', 'Recebido', 'Ativo'].includes(status)) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      else if (['Pendente', 'Aberto', 'Em Andamento', 'Planejamento'].includes(status)) colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
      else if (['Vencido', 'Cancelado', 'Atrasado', 'Rejeitado'].includes(status)) colorClass = "bg-red-100 text-red-700 border-red-200";
      else if (['Parcial', 'Negociação', 'Proposta'].includes(status)) colorClass = "bg-blue-100 text-blue-700 border-blue-200";
  }

  return (
    <span className={`${baseClasses} ${colorClass}`} title={title}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colorClass.replace('bg-', 'bg-').replace('text-', 'bg-').replace('border-', '').split(' ')[1].replace('text', 'bg').replace('700', '500')}`}></span>
      {status}
    </span>
  );
};

export default Badge;
