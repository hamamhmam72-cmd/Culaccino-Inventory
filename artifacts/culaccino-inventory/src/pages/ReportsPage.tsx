import { useState, useMemo } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useTransactions } from '../hooks/useTransactions';
import { useRole } from '../hooks/useRole';
import { useLanguage } from '../contexts/LanguageContext';
import { Redirect } from 'wouter';
import { format, isAfter, isBefore, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download, TrendingDown, TrendingUp, AlertTriangle, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#D97736', '#3E2C22', '#7D7065', '#CF5353', '#8C7D70', '#C2B5A3'];
const formatCurrency = (value: number | null | undefined) =>
  value == null ? '—' : `$${value.toFixed(2)}`;

export default function ReportsPage() {
  const { items } = useInventory();
  const { transactions } = useTransactions();
  const { role } = useRole();
  const { t, getCategoryLabel } = useLanguage();
  const [timeRange, setTimeRange] = useState('7');

  const {
    filteredTxs,
    lowStockCount,
    totalStock,
    withdrawalsTotal,
    restocksTotal,
    grandTotalInventory,
    activityData,
    categoryData,
  } = useMemo(() => {
    const days = parseInt(timeRange);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const filtered = transactions.filter(tx => {
      const d = new Date(tx.timestamp);
      return isAfter(d, startDate) && isBefore(d, endDate);
    });

    const lowStock = items.filter(i => i.quantity <= i.minStock).length;
    const total = items.length;

    let wTotal = 0;
    let rTotal = 0;
    filtered.forEach(tx => {
      if (tx.type === 'withdrawal') wTotal += Math.abs(tx.delta);
      if (tx.type === 'restock') rTotal += tx.delta;
    });

    const actMap = new Map<string, { date: string; withdrawals: number; restocks: number }>();
    for (let i = days; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), 'MMM dd');
      actMap.set(dateStr, { date: dateStr, withdrawals: 0, restocks: 0 });
    }
    filtered.forEach(tx => {
      const dateStr = format(new Date(tx.timestamp), 'MMM dd');
      if (actMap.has(dateStr)) {
        const current = actMap.get(dateStr)!;
        if (tx.type === 'withdrawal') current.withdrawals += Math.abs(tx.delta);
        if (tx.type === 'restock') current.restocks += tx.delta;
      }
    });

    const catMap = new Map<string, number>();
    items.forEach(item => {
      catMap.set(item.category, (catMap.get(item.category) || 0) + 1);
    });
    const catData = Array.from(catMap.entries()).map(([name, value]) => ({
      name: getCategoryLabel(name),
      value,
    }));

    const grandTotal = items.reduce(
      (total, item) => total + (item.totalValue ?? (item.cost == null ? 0 : item.cost * item.quantity)),
      0,
    );

    return {
      filteredTxs: filtered,
      lowStockCount: lowStock,
      totalStock: total,
      withdrawalsTotal: wTotal,
      restocksTotal: rTotal,
      grandTotalInventory: grandTotal,
      activityData: Array.from(actMap.values()),
      categoryData: catData,
    };
  }, [items, transactions, timeRange, getCategoryLabel]);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const headers = ['Date', 'Item', 'Type', 'Quantity Before', 'Quantity After', 'Delta', 'Performed By', 'Note'];
    const csvContent = [
      headers.join(','),
      ...filteredTxs.map(tx => [
        format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        `"${tx.itemName}"`,
        tx.type,
        tx.quantityBefore,
        tx.quantityAfter,
        tx.delta,
        `"${tx.performedBy}"`,
        `"${tx.note || ''}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `culaccino-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (role !== 'manager') return <Redirect to="/" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('reportsTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('reportsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('last7Days')}</SelectItem>
              <SelectItem value="14">{t('last14Days')}</SelectItem>
              <SelectItem value="30">{t('last30Days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExportCSV} title={t('exportCSV')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint} title={t('printReport')}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Print header — visible only when printing */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">{t('printHeader')}</h1>
        <p className="text-gray-600">{t('generatedOn', { date: format(new Date(), 'MMMM d, yyyy HH:mm') })}</p>
        <p className="text-gray-600">{t('timeRange', { n: timeRange })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-sm font-medium">{t('totalCatalogItems')}</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('itemsTracked')}</p>
          </CardContent>
        </Card>

        <Card className={cn('shadow-sm overflow-hidden border-border transition-colors', lowStockCount > 0 ? 'border-destructive/50' : '')}>
          <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/50', lowStockCount > 0 ? 'bg-destructive/10' : 'bg-muted/20')}>
            <CardTitle className="text-sm font-medium">{t('lowStockAlerts')}</CardTitle>
            <AlertTriangle className={cn('h-4 w-4', lowStockCount > 0 ? 'text-destructive' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent className="pt-4">
            <div className={cn('text-3xl font-bold', lowStockCount > 0 ? 'text-destructive' : '')}>{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('itemsRequiringRestock')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-emerald-500/10 border-b border-border/50">
            <CardTitle className="text-sm font-medium">{t('totalRestocked')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-emerald-600">{restocksTotal.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('unitsAdded')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-500/10 border-b border-border/50">
            <CardTitle className="text-sm font-medium">{t('totalWithdrawn')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-amber-600">{withdrawalsTotal.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('unitsConsumed')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border print:break-inside-avoid">
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('inventoryValuation')}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{t('inventoryValuationSubtitle')}</p>
            </div>
            <div className="rounded-lg bg-primary/10 px-4 py-3 text-left sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('grandTotalInventory')}
              </p>
              <p className="text-2xl font-bold text-primary" aria-label={`${t('grandTotalInventory')}: ${formatCurrency(grandTotalInventory)}`}>
                {formatCurrency(grandTotalInventory)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">{t('inventoryValuation')}</caption>
              <thead className="border-y border-border/70 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">{t('item')}</th>
                  <th scope="col" className="px-6 py-3 font-medium">{t('category')}</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">{t('currentStock')}</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">{t('unitPrice')}</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">{t('itemTotalValue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <th scope="row" className="px-6 py-3 text-left font-medium text-foreground">{item.name}</th>
                    <td className="px-6 py-3 text-muted-foreground">{getCategoryLabel(item.category)}</td>
                    <td className="px-6 py-3 text-right text-foreground">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-3 text-right text-muted-foreground">{formatCurrency(item.cost)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(item.totalValue ?? (item.cost == null ? null : item.cost * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-muted/30">
                <tr>
                  <th scope="row" colSpan={4} className="px-6 py-4 text-right font-semibold">{t('grandTotalInventory')}</th>
                  <td className="px-6 py-4 text-right text-lg font-bold text-primary">{formatCurrency(grandTotalInventory)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-8">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>{t('movementActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="withdrawals" name={t('withdrawals')} fill="#D97736" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="restocks" name={t('restocks')} fill="#3E2C22" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border print:break-inside-avoid">
          <CardHeader>
            <CardTitle>{t('catalogDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
