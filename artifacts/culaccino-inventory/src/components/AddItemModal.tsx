import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ItemCategory } from '../types/inventory';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

const addItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['Coffee Beans', 'Dairy & Milk', 'Syrups', 'Cups & Packaging', 'Cleaning Supplies', 'Other']),
  quantity: z.coerce.number().min(0, 'Must be >= 0'),
  unit: z.string().min(1, 'Unit is required'),
  minStock: z.coerce.number().min(0, 'Must be >= 0'),
  cost: z.coerce.number().min(0).optional(),
});

const CATEGORIES: ItemCategory[] = ['Coffee Beans', 'Dairy & Milk', 'Syrups', 'Cups & Packaging', 'Cleaning Supplies', 'Other'];

export function AddItemModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addItem } = useInventory();
  const { toast } = useToast();
  const { t, getCategoryLabel } = useLanguage();

  const form = useForm<z.infer<typeof addItemSchema>>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { name: '', category: 'Coffee Beans', quantity: 0, unit: '', minStock: 5, cost: 0 },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = (values: z.infer<typeof addItemSchema>) => {
    addItem({ ...values, addedBy: 'Admin' }, 'Admin');
    toast({ title: t('itemCreated'), description: t('itemCreatedDesc', { name: values.name }) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addItemTitle')}</DialogTitle>
          <DialogDescription>{t('addItemDesc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t('itemName')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder={t('itemNamePlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>{t('category')} <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>{t('unit')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder={t('unitPlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>{t('initialQuantity')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="minStock" render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>{t('lowStockAlertAt')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="cost" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t('costPerUnit')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('createItem')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
