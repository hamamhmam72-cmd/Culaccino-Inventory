import { useState, useMemo } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useRole } from '../hooks/useRole';
import { useLanguage } from '../contexts/LanguageContext';
import { InventoryItem } from '../types/inventory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, AlertCircle, Edit, Trash2, PackageMinus, PackagePlus, Coffee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddItemModal } from '../components/AddItemModal';
import { EditItemModal } from '../components/EditItemModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { RestockModal } from '../components/RestockModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const ALL_CATEGORIES = ['All', 'Coffee Beans', 'Dairy & Milk', 'Syrups', 'Cups & Packaging', 'Cleaning Supplies', 'Other'] as const;

export default function InventoryPage() {
  const { items, deleteItem } = useInventory();
  const { role } = useRole();
  const { toast } = useToast();
  const { t, getCategoryLabel } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [withdrawingItem, setWithdrawingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const aLow = a.quantity <= a.minStock;
      const bLow = b.quantity <= b.minStock;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [items, search, selectedCategory]);

  const confirmDelete = () => {
    if (deletingItem) {
      deleteItem(deletingItem.id, 'Admin');
      toast({
        title: t('itemDeleted'),
        description: t('itemDeletedDesc', { name: deletingItem.name }),
        variant: 'destructive',
      });
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('inventoryTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('inventorySubtitle')}</p>
        </div>
        {role === 'manager' && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto shadow-sm transition-transform active:scale-95"
            data-testid="button-add-item"
          >
            <Plus className="h-4 w-4 me-2" />
            {t('addNewItem')}
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchItems')}
            className="ps-9 bg-card shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-items"
          />
        </div>
      </div>

      <ScrollArea className="w-full pb-4 -mb-4">
        <div className="flex items-center gap-2 pb-1">
          {ALL_CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={cn(
                'rounded-full px-4 h-8 text-xs shrink-0 transition-all',
                selectedCategory === cat ? 'shadow-sm' : 'bg-card hover:bg-muted'
              )}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`filter-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {getCategoryLabel(cat)}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
      </ScrollArea>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
        <AnimatePresence>
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-dashed border-border/60"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">{t('noItemsFound')}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {search
                  ? t('noItemsSearch', { q: search })
                  : t('emptyInventory')}
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const isLowStock = item.quantity <= item.minStock;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/20 flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted border-none font-medium">
                        {getCategoryLabel(item.category)}
                      </Badge>
                      {isLowStock && (
                        <Badge variant="destructive" className="flex items-center gap-1 shadow-sm">
                          <AlertCircle className="h-3 w-3" />
                          {t('lowStock')}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-lg leading-tight mb-1 text-card-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>

                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground font-medium mb-1">{t('currentStock')}</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn('text-3xl font-black tracking-tight', isLowStock ? 'text-destructive' : 'text-foreground')}>
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground font-medium">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 border-t border-border p-3 flex gap-2 justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full shadow-sm hover:shadow active:scale-95 transition-all"
                      onClick={() => setWithdrawingItem(item)}
                      data-testid={`button-withdraw-${item.id}`}
                    >
                      <PackageMinus className="h-4 w-4 me-2" />
                      {t('withdraw')}
                    </Button>

                    {role === 'manager' && (
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 shadow-sm active:scale-95 transition-transform"
                          onClick={() => setRestockingItem(item)}
                          data-testid={`button-restock-${item.id}`}
                        >
                          <PackagePlus className="h-4 w-4 me-2" />
                          {t('restockBtn')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingItem(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingItem(item)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AddItemModal open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditItemModal item={editingItem} open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)} />
      <WithdrawModal item={withdrawingItem} open={!!withdrawingItem} onOpenChange={(o) => !o && setWithdrawingItem(null)} />
      <RestockModal item={restockingItem} open={!!restockingItem} onOpenChange={(o) => !o && setRestockingItem(null)} />

      <AlertDialog open={!!deletingItem} onOpenChange={(o) => !o && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDesc', { name: deletingItem?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteItem')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
