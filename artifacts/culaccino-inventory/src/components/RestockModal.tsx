import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InventoryItem } from '../types/inventory';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

const restockSchema = z.object({
  managerName: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.coerce.number().min(0.01, 'Must be greater than 0'),
  note: z.string().optional(),
});

export function RestockModal({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { restockItem } = useInventory();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof restockSchema>>({
    resolver: zodResolver(restockSchema),
    defaultValues: { managerName: 'Admin', quantity: 1, note: '' },
  });

  useEffect(() => {
    if (open) {
      form.setValue('quantity', 1);
      form.setValue('note', '');
      form.clearErrors();
    }
  }, [open, form]);

  const onSubmit = (values: z.infer<typeof restockSchema>) => {
    if (!item) return;
    restockItem(item.id, values.quantity, values.managerName, values.note);
    toast({
      title: t('restockSuccessful'),
      description: t('restockSuccessfulDesc', { qty: values.quantity, unit: item.unit, name: item.name }),
    });
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('restockTitle')}</DialogTitle>
          <DialogDescription>{t('restockDesc', { name: item.name })}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('authorizedBy')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quantityToAdd', { unit: item.unit })} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" {...field} data-testid="input-restock-quantity" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('noteOptional')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('restockNotePlaceholder')} {...field} className="resize-none" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
              <Button type="submit" data-testid="button-confirm-restock">{t('addStock')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
