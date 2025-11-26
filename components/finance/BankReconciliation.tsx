
import React, { useState, useMemo } from 'react';
import { BankTransaction, ReconciliationStatus, Invoice, Expense, InvoiceStatus, ExpenseStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ScaleIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ArrowUpIcon, ArrowDownIcon } from '../common/icons';
import { useApp } from '../../hooks/useApp';

// Mock statement data generator
const generateMockStatement = (): BankTransaction[] => {
    const today = new Date();
    return [
        { id: 'tx1', date: today.toISOString().split('T')[0], description: 'PGTO FORNECEDOR DIV', amount: -1250.00, status: ReconciliationStatus.PENDING },
        { id: 'tx2', date: today.toISOString().split('T')[0], description: 'RECEBIMENTO CLIENTE A', amount: 1500.00, status: ReconciliationStatus.PENDING },
        { id: 'tx3', date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], description: 'TARIFAS BANCARIAS', amount: -45.90, status: ReconciliationStatus.PENDING },
        { id: 'tx4', date: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], description: 'TRANSF DOC EXTRA', amount: -500.00, status: ReconciliationStatus.PENDING },
    ];
};

const BankReconciliation: React.FC = () => {
    const { invoices, expenses, updateInvoice, updateExpense } = useApp();
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImport = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setTransactions(generateMockStatement());
            setIsProcessing(false);
        }, 800);
    };

    // CORE LOGIC: Reconciliation Matching Engine
    const processReconciliation = () => {
        const updatedTransactions = transactions.map(tx => {
            if (tx.status === ReconciliationStatus.MATCHED) return tx;

            let matchStatus = ReconciliationStatus.REVIEW; // Default to Review (Rule 2)
            let matchId = undefined;
            let matchType: 'Invoice' | 'Expense' | undefined = undefined;

            if (tx.amount > 0) {
                // Income -> Look for Invoices
                const potentialInvoice = invoices.find(inv => {
                    // Rule 1: Match Amount (tolerance 0.05)
                    const amountMatch = Math.abs(inv.total - tx.amount) < 0.05;
                    // Rule 1: Match Date (simple exact match for MVP, usually tolerance +/- 1 day)
                    // Using issueDate as a proxy if payment date isn't tracked separately in 'PENDING' state
                    const dateMatch = inv.dueDate === tx.date || inv.issueDate === tx.date; 
                    
                    return amountMatch && (dateMatch || inv.clientName.toUpperCase().includes('CLIENTE')); // Fuzzy logic
                });

                if (potentialInvoice) {
                     matchStatus = ReconciliationStatus.MATCHED;
                     matchId = potentialInvoice.id;
                     matchType = 'Invoice';
                }

            } else {
                // Expense -> Look for Expenses (Accounts Payable)
                const absAmount = Math.abs(tx.amount);
                const potentialExpense = expenses.find(exp => {
                     const amountMatch = Math.abs(exp.totalValue - absAmount) < 0.05 || Math.abs(exp.remainingValue - absAmount) < 0.05;
                     const dateMatch = exp.dueDate === tx.date;
                     // Check description text
                     const textMatch = tx.description.includes(exp.description.toUpperCase()) || (exp.supplierId && tx.description.includes('FORNECEDOR'));
                     
                     return amountMatch && (dateMatch || textMatch);
                });

                if (potentialExpense) {
                    matchStatus = ReconciliationStatus.MATCHED;
                    matchId = potentialExpense.id;
                    matchType = 'Expense';
                }
            }
            
            return { ...tx, status: matchStatus, matchId, matchType };
        });

        setTransactions(updatedTransactions);
    };

    const finalizeReconciliation = async (tx: BankTransaction) => {
        if (tx.status !== ReconciliationStatus.MATCHED || !tx.matchId || !tx.matchType) return;

        try {
            if (tx.matchType === 'Invoice') {
                await updateInvoice(tx.matchId, { status: InvoiceStatus.PAID });
            } else if (tx.matchType === 'Expense') {
                const expense = expenses.find(e => e.id === tx.matchId);
                if (expense) {
                    // Fully settle the expense
                    await updateExpense(expense.tenantId, { 
                        ...expense, 
                        status: ExpenseStatus.PAID, 
                        amountPaid: expense.totalValue, 
                        remainingValue: 0, 
                        isReconciled: true 
                    });
                }
            }
            // Remove from list or mark visually done
            setTransactions(prev => prev.filter(t => t.id !== tx.id));
        } catch (err) {
            console.error("Error finalizing reconciliation", err);
            alert("Erro ao conciliar item.");
        }
    };

    const getStatusIcon = (status: ReconciliationStatus) => {
        switch (status) {
            case ReconciliationStatus.MATCHED: return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case ReconciliationStatus.REVIEW: return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
            default: return <ClockIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <ScaleIcon className="w-6 h-6 mr-2 text-primary-600"/> Conciliação Bancária
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Importe extratos (OFX/CSV) e concilie com seus lançamentos.</p>
                    </div>
                    <div className="space-x-2">
                        <button onClick={handleImport} disabled={transactions.length > 0} className="btn-secondary">
                            {isProcessing ? 'Importando...' : 'Importar Extrato (Simulação)'}
                        </button>
                        <button onClick={processReconciliation} disabled={transactions.length === 0} className="btn-primary">
                            Processar Match
                        </button>
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3">Descrição (Banco)</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                    <th className="px-4 py-3">Correspondência Sugerida</th>
                                    <th className="px-4 py-3 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx.id} className={`border-b dark:border-gray-700 ${tx.status === ReconciliationStatus.MATCHED ? 'bg-green-50 dark:bg-green-900/20' : tx.status === ReconciliationStatus.REVIEW ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-800'}`}>
                                        <td className="px-4 py-3 text-center flex justify-center items-center" title={tx.status}>
                                            {getStatusIcon(tx.status)}
                                        </td>
                                        <td className="px-4 py-3">{formatDate(tx.date)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tx.description}</td>
                                        <td className={`px-4 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {tx.matchId ? (
                                                <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600">
                                                    {tx.matchType}: {tx.matchId}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Nenhuma correspondência exata</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {tx.status === ReconciliationStatus.MATCHED && (
                                                <button onClick={() => finalizeReconciliation(tx)} className="text-primary-600 hover:underline font-medium">
                                                    Confirmar
                                                </button>
                                            )}
                                            {tx.status === ReconciliationStatus.REVIEW && (
                                                <button className="text-orange-600 hover:underline font-medium">
                                                    Resolver
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <ScaleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nenhum extrato importado. Clique em "Importar" para começar.</p>
                    </div>
                )}
            </div>
             <style>{`.btn-secondary{padding:0.5rem 1rem;border-radius:0.5rem;background-color:#e5e7eb;color:#374151;font-weight:500;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}.btn-primary{padding:0.5rem 1rem;border-radius:0.5rem;background-color:rgb(var(--color-primary-600));color:white;font-weight:500;}`}</style>
        </div>
    );
};

export default BankReconciliation;
