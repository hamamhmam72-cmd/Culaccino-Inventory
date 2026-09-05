import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useRole } from '../hooks/useRole';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { TransactionType } from '../types/inventory';
import { Redirect } from 'wouter';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<TransactionType, { bg: string; text: string }> = {
  restock:    { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' },
  withdrawal: { bg: 'bg-amber-500/15',   text: 'text-amber-700 dark:text-amber-400' },
  adjustment: { bg: 'bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-400' },
  addition:   { bg: 'bg-purple-500/15',  text: 'text-purple-700 dark:text-purple-400' },
  deletion:   { bg: 'bg-rose-500/15',    text: 'text-rose-700 dark:text-rose-400' },
};

export default function AuditLogPage() {
  const { transactions } = useTransactions();
  const { role } = useRole();
  const { t, getTypeLabel } = useLanguage();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  if (role !== 'manager') return <Redirect to="/" />;

  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch =
        tx.itemName.toLowerCase().includes(search.toLowerCase()) ||
        tx.performedBy.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const paginatedTxs = filteredTxs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('auditLogTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('auditLogSubtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchByItemOrEmployee')}
            className="ps-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={t('allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              <SelectItem value="restock">{t('restock')}</SelectItem>
              <SelectItem value="withdrawal">{t('withdrawal')}</SelectItem>
              <SelectItem value="adjustment">{t('adjustment')}</SelectItem>
              <SelectItem value="addition">{t('addition')}</SelectItem>
              <SelectItem value="deletion">{t('deletion')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-start">{t('dateTime')}</th>
                <th className="px-4 py-3 text-start">{t('item')}</th>
                <th className="px-4 py-3 text-start">{t('type')}</th>
                <th className="px-4 py-3 text-end">{t('change')}</th>
                <th className="px-4 py-3 text-start">{t('performedBy')}</th>
                <th className="px-4 py-3 max-w-[200px] text-start">{t('note')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <History className="h-8 w-8 mb-3 opacity-20" />
                      <p>{t('noTransactions')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{tx.itemName}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn('border-0 font-semibold', TYPE_COLORS[tx.type].bg, TYPE_COLORS[tx.type].text)}
                      >
                        {getTypeLabel(tx.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end whitespace-nowrap">
                      {tx.type === 'addition' || tx.type === 'deletion' ? (
                        <span className="font-mono text-muted-foreground">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2 font-mono text-xs">
                          <span className="text-muted-foreground">{tx.quantityBefore}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                          <span className="font-semibold">{tx.quantityAfter}</span>
                          <span className={cn('ms-2 font-bold', tx.delta > 0 ? 'text-emerald-600' : tx.delta < 0 ? 'text-amber-600' : 'text-muted-foreground')}>
                            ({tx.delta > 0 ? '+' : ''}{tx.delta})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{tx.performedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]" title={tx.note}>
                      {tx.note || <span className="opacity-40">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              {t('showing', {
                from: (page - 1) * itemsPerPage + 1,
                to: Math.min(page * itemsPerPage, filteredTxs.length),
                total: filteredTxs.length,
              })}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm rounded border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors bg-card"
              >
                {t('previous')}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm rounded border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors bg-card"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
