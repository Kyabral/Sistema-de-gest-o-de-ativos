
import React, { useMemo, useState } from 'react';
import { Invoice, Contract, InvoiceStatus, ContractStatus, Employee, Expense, ExpenseStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine, ComposedChart, Line } from 'recharts';
import MetricCard from '../common/MetricCard';
import { CurrencyDollarIcon, DocumentTextIcon, BanknotesIcon, BuildingOfficeIcon } from '../common/icons';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../hooks/useApp';

interface FinancialDashboardProps {
  invoices: Invoice[];
  contracts: Contract[];
  employees: Employee[];
  assets?: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

// Mock Bank Accounts for Rule 2.1.3 (Multi-account consideration)
const MOCK_ACCOUNTS = [
    { id: 'all', name: 'Consolidado (Todas)', balance: 0 }, // Balance calculated dynamically
    { id: 'acc1', name: 'Banco Inter', balance: 45200.50 },
    { id: 'acc2', name: 'Itaú Empresas', balance: 12800.00 },
    { id: 'acc3', name: 'Caixa Econômica', balance: 3500.00 },
];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ invoices, contracts, employees }) => {
  const { expenses } = useApp();
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Calculate total balance based on mock accounts
  const totalCurrentBalance = MOCK_ACCOUNTS.slice(1).reduce((sum, acc) => sum + acc.balance, 0);

  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = invoices
      .filter(inv => new Date(inv.issueDate).getMonth() === currentMonth && new Date(inv.issueDate).getFullYear() === currentYear && inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.total, 0);

    const accountsReceivable = invoices
      .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + inv.total, 0);

    const contractCosts = contracts
      .filter(c => c.status === ContractStatus.ACTIVE)
      .reduce((sum, c) => sum + c.monthlyValue, 0);
    
    const payrollCosts = employees
        .filter(e => e.status === 'Ativo')
        .reduce((sum, e) => sum + e.salary, 0);

    const fixedCosts = contractCosts + payrollCosts;
    const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;

    return { monthlyRevenue, accountsReceivable, fixedCosts, activeContracts };
  }, [invoices, contracts, employees]);

  // RULE 2.1.3: Cash Flow Analysis (Realized vs Projected)
  const cashFlowAnalysis = useMemo(() => {
      const data = [];
      const today = new Date();
      today.setHours(0,0,0,0);
      
      let runningBalance = selectedAccount === 'all' 
        ? totalCurrentBalance 
        : MOCK_ACCOUNTS.find(a => a.id === selectedAccount)?.balance || 0;

      // Simulate simulation factor for filtering by account (since data doesn't strictly have accountId)
      const accountFactor = selectedAccount === 'all' ? 1 : 0.4; 

      // Range: -15 days (Past/Realized) to +30 days (Future/Projected)
      for (let i = -15; i <= 30; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);
          const dateStr = targetDate.toISOString().split('T')[0];
          const isFuture = i > 0;
          const isToday = i === 0;

          let dailyIn = 0;
          let dailyOut = 0;

          if (isFuture) {
              // PROJECTED (Pending)
              dailyIn = invoices
                .filter(inv => inv.status === InvoiceStatus.PENDING && inv.dueDate === dateStr)
                .reduce((sum, inv) => sum + inv.total, 0) * accountFactor;

              dailyOut = expenses
                .filter(exp => (exp.status === ExpenseStatus.OPEN || exp.status === ExpenseStatus.PARTIAL) && exp.dueDate === dateStr)
                .reduce((sum, exp) => sum + exp.remainingValue, 0) * accountFactor;
              
              // Add daily pro-rated fixed costs (Contracts + Payroll) to projection
              const dailyFixed = (metrics.fixedCosts / 30) * accountFactor;
              dailyOut += dailyFixed;

          } else {
              // REALIZED (Paid)
              // Note: Using issueDate/dueDate as proxy for payment date in this mock if payment date is missing
              dailyIn = invoices
                .filter(inv => inv.status === InvoiceStatus.PAID && inv.dueDate === dateStr)
                .reduce((sum, inv) => sum + inv.total, 0) * accountFactor;

              dailyOut = expenses
                 .filter(exp => exp.status === ExpenseStatus.PAID && exp.dueDate === dateStr) // Ideally calculate from paymentHistory
                 .reduce((sum, exp) => sum + exp.totalValue, 0) * accountFactor;
          }

          if (isFuture) {
              runningBalance += (dailyIn - dailyOut);
          }

          data.push({
              date: dateStr,
              displayDate: targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              type: isFuture ? 'Projetado' : 'Realizado',
              Entradas: dailyIn,
              Saídas: dailyOut * -1, // Negative for visual chart
              SaldoAcumulado: isFuture ? runningBalance : null, // Only show line for future projection
              isToday
          });
      }
      return data;
  }, [invoices, expenses, metrics.fixedCosts, selectedAccount, totalCurrentBalance]);


  const chartData = useMemo(() => {
    const data: { name: string; Faturamento: number; Custos: number }[] = [];
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { month: d.getMonth(), year: d.getFullYear(), name: d.toLocaleString('default', { month: 'short' }) };
    }).reverse();

    const currentPayroll = employees.filter(e => e.status === 'Ativo').reduce((sum, e) => sum + e.salary, 0);

    months.forEach(m => {
      const revenue = invoices
        .filter(inv => new Date(inv.issueDate).getMonth() === m.month && new Date(inv.issueDate).getFullYear() === m.year && inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const contractCosts = contracts
        .filter(c => c.status === ContractStatus.ACTIVE && new Date(c.startDate) <= new Date(m.year, m.month, 1))
        .reduce((sum, c) => sum + c.monthlyValue, 0);
      
      const totalCosts = contractCosts + currentPayroll;

      data.push({ name: m.name, Faturamento: revenue, Custos: totalCosts });
    });
    return data;
  }, [invoices, contracts, employees]);

  const expenseByCategoryData = useMemo(() => {
    const categoryCosts = contracts
      .filter(c => c.status === ContractStatus.ACTIVE)
      .reduce((acc, contract) => {
        acc[contract.category] = (acc[contract.category] || 0) + contract.monthlyValue;
        return acc;
      }, {} as Record<string, number>);
    
    const payroll = employees.filter(e => e.status === 'Ativo').reduce((sum, e) => sum + e.salary, 0);
    if (payroll > 0) {
        categoryCosts['Folha de Pagamento'] = payroll;
    }
    
    return Object.entries(categoryCosts).map(([name, value]) => ({ name, value }));
  }, [contracts, employees]);

  return (
    <div className="space-y-6">
      
      {/* Bank Account Selector (Rule 2.1.3) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual Consolidado</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCurrentBalance)}</p>
              </div>
          </div>
          
          <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar Conta:</label>
              <select 
                  value={selectedAccount} 
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                  {MOCK_ACCOUNTS.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
              </select>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Faturamento (Mês Atual)" value={formatCurrency(metrics.monthlyRevenue)} icon={<CurrencyDollarIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
        <MetricCard title="Custos Fixos (Contratos + RH)" value={formatCurrency(metrics.fixedCosts)} icon={<DocumentTextIcon className="w-8 h-8 text-white"/>} color="bg-red-500" />
        <MetricCard title="A Receber (Pendente)" value={formatCurrency(metrics.accountsReceivable)} icon={<CurrencyDollarIcon className="w-8 h-8 text-white"/>} color="bg-yellow-500" />
        <MetricCard title="Contratos Ativos" value={String(metrics.activeContracts)} icon={<DocumentTextIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
      </div>

      {/* Rule 2.1.3: Realized vs Projected Cash Flow Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-[450px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center">
                <BanknotesIcon className="w-6 h-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fluxo de Caixa: Realizado vs. Projetado</h3>
             </div>
             <div className="flex space-x-4 text-xs">
                 <span className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-1 rounded-sm opacity-50"></span> Realizado</span>
                 <span className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></span> Projetado</span>
             </div>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={cashFlowAnalysis} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" />
              <YAxis yAxisId="left" tickFormatter={(value) => `R$${value/1000}k`}/>
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(Math.abs(value)), name]} 
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend />
              
              <ReferenceLine x={cashFlowAnalysis.find(d => d.isToday)?.displayDate} stroke="red" strokeDasharray="3 3" label="HOJE" yAxisId="left" />
              
              <Bar yAxisId="left" dataKey="Entradas" fill="#22c55e" stackId="a" barSize={20} fillOpacity={0.8} />
              <Bar yAxisId="left" dataKey="Saídas" fill="#ef4444" stackId="a" barSize={20} fillOpacity={0.8} />
              
              <Line yAxisId="right" type="monotone" dataKey="SaldoAcumulado" stroke="#3b82f6" strokeWidth={3} dot={false} name="Saldo Projetado" />
            </ComposedChart>
          </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico: Faturamento vs. Custos</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="Faturamento" fill="#16a34a" />
              <Bar dataKey="Custos" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                {expenseByCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
