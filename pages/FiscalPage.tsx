
import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorIcon, BanknotesIcon, DocumentTextIcon } from '../components/common/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../hooks/useApp';
import { InvoiceStatus, BrandingSettings, Invoice } from '../types';
import { useBranding } from '../hooks/useBranding';

const FiscalPage: React.FC = () => {
  const { invoices } = useApp();
  const { branding } = useBranding();
  
  // Tax Calculation State (Rule 5.1)
  const [baseValue, setBaseValue] = useState<number>(0);
  const [taxProfile, setTaxProfile] = useState('simples'); // simples, lucro_presumido, lucro_real
  const [taxes, setTaxes] = useState({
      icms: 0,
      pis: 0,
      cofins: 0,
      ipi: 0,
      iss: 0,
      total: 0
  });

  // Calculate total revenue from paid invoices for the last 30 days to suggest base value
  useEffect(() => {
    const totalRevenue = invoices
        .filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.total, 0);
    
    if (totalRevenue > 0 && baseValue === 0) {
        setBaseValue(totalRevenue);
    }
  }, [invoices]);

  // Automated Tax Engine Logic
  useEffect(() => {
      let icmsRate = 0, pisRate = 0, cofinsRate = 0, ipiRate = 0, issRate = 0;

      if (taxProfile === 'simples') {
          // Simplified single rate (example ~6-10% depending on range)
          const dasRate = 0.06; 
          const totalTax = baseValue * dasRate;
          setTaxes({ icms: 0, pis: 0, cofins: 0, ipi: 0, iss: 0, total: totalTax });
          return;
      }

      if (taxProfile === 'lucro_presumido') {
          pisRate = 0.0065;
          cofinsRate = 0.03;
          issRate = 0.05; // Service
      } else if (taxProfile === 'lucro_real') {
          pisRate = 0.0165;
          cofinsRate = 0.076;
          icmsRate = 0.18; // Standard SP
          ipiRate = 0.05; // Industrial
      }

      const valPis = baseValue * pisRate;
      const valCofins = baseValue * cofinsRate;
      const valIcms = baseValue * icmsRate;
      const valIpi = baseValue * ipiRate;
      const valIss = baseValue * issRate;

      setTaxes({
          icms: valIcms,
          pis: valPis,
          cofins: valCofins,
          ipi: valIpi,
          iss: valIss,
          total: valIcms + valPis + valCofins + valIpi + valIss
      });

  }, [baseValue, taxProfile]);

  const handleExportSped = () => {
      if (invoices.length === 0) {
          alert("Sem dados para exportar.");
          return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `RELATÓRIO FISCAL (SIMULAÇÃO SPED) - ${branding.companyName}\n`;
      csvContent += "Numero,Data Emissao,Cliente,Valor Total,Status,Impostos Estimados (Simples)\n";

      invoices.forEach(inv => {
          const taxEstimate = inv.total * 0.06; // Simulating 6% tax
          const row = [
              inv.invoiceNumber,
              inv.issueDate.split('T')[0],
              `"${inv.clientName}"`, // Quote to handle commas
              inv.total.toFixed(2),
              inv.status,
              taxEstimate.toFixed(2)
          ].join(",");
          csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "sped_fiscal_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão Fiscal & Tributária</h1>
                <p className="text-gray-500 dark:text-gray-400">Apuração automática de impostos e emissão de documentos fiscais.</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={handleExportSped} className="btn-secondary">Exportar SPED (CSV)</button>
            </div>
       </div>

       {/* Automated Tax Calculator Engine (Rule 5.1) */}
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-primary-600">
           <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
               <CalculatorIcon className="w-5 h-5 mr-2"/> Motor de Cálculo de Impostos (Simulador)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faturamento Base (R$)</label>
                   <input 
                        type="number" 
                        value={baseValue} 
                        onChange={(e) => setBaseValue(Number(e.target.value))} 
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   />
                   <p className="text-xs text-gray-500 mt-1">Sugerido com base nas faturas pagas.</p>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regime Tributário</label>
                   <select 
                        value={taxProfile} 
                        onChange={(e) => setTaxProfile(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   >
                       <option value="simples">Simples Nacional</option>
                       <option value="lucro_presumido">Lucro Presumido (Serviços)</option>
                       <option value="lucro_real">Lucro Real (Indústria/Comércio)</option>
                   </select>
               </div>
               <div className="flex flex-col justify-end">
                   <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-right">
                       <p className="text-sm text-gray-500 dark:text-gray-400">Total de Impostos Estimado</p>
                       <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(taxes.total)}</p>
                   </div>
               </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {taxProfile !== 'simples' ? (
                    <>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">ICMS: <strong>{formatCurrency(taxes.icms)}</strong></div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">PIS: <strong>{formatCurrency(taxes.pis)}</strong></div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">COFINS: <strong>{formatCurrency(taxes.cofins)}</strong></div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">IPI: <strong>{formatCurrency(taxes.ipi)}</strong></div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">ISS: <strong>{formatCurrency(taxes.iss)}</strong></div>
                    </>
                ) : (
                    <div className="col-span-5 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-800 dark:text-blue-200">
                        Cálculo unificado via DAS (Documento de Arrecadação do Simples Nacional).
                    </div>
                )}
           </div>
       </div>

       {/* Fiscal Documents Table */}
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
           <h3 className="text-lg font-semibold mb-4 dark:text-white">Notas Fiscais Recentes (NFe / NFSe)</h3>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                       <tr>
                           <th className="px-6 py-3">Número</th>
                           <th className="px-6 py-3">Tipo</th>
                           <th className="px-6 py-3">Destinatário</th>
                           <th className="px-6 py-3">Emissão</th>
                           <th className="px-6 py-3 text-right">Valor</th>
                           <th className="px-6 py-3 text-center">Status</th>
                           <th className="px-6 py-3 text-center">Ações</th>
                       </tr>
                   </thead>
                   <tbody>
                       {invoices.map(inv => (
                           <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                               <td className="px-6 py-4 font-mono">#{String(inv.invoiceNumber).padStart(6, '0')}</td>
                               <td className="px-6 py-4">NFe (Saída)</td>
                               <td className="px-6 py-4">{inv.clientName}</td>
                               <td className="px-6 py-4">{formatDate(inv.issueDate)}</td>
                               <td className="px-6 py-4 text-right">{formatCurrency(inv.total)}</td>
                               <td className="px-6 py-4 text-center">
                                   <span className={`text-xs px-2 py-1 rounded-full ${inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                       {inv.status === InvoiceStatus.PAID ? 'Autorizada' : 'Processando'}
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-center text-primary-600 cursor-pointer hover:underline">XML/PDF</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
                {invoices.length === 0 && <p className="text-center text-gray-500 p-4">Nenhuma nota fiscal emitida.</p>}
           </div>
       </div>
       <style>{`.btn-primary{padding:0.5rem 1rem;border-radius:0.5rem;background-color:rgb(var(--color-primary-600));color:white;font-weight:500;}.btn-secondary{padding:0.5rem 1rem;border-radius:0.5rem;background-color:#e5e7eb;color:#374151;font-weight:500;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
    </div>
  );
};

export default FiscalPage;
