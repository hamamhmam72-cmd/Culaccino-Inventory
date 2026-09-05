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

const withdrawSchema = z.object({
  employeeName: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.coerce.number().min(0.01, 'Must be greater than 0'),
  note: z.string().optional(),
});

export function WithdrawModal({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { withdrawItem } = useInventory();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { employeeName: '', quantity: 1, note: '' },
  });

  useEffect(() => {
    if (open) {
      const savedName = localStorage.getItem('culaccino_last_employee') || '';
      form.setValue('employeeName', savedName);
      form.setValue('quantity', 1);
      form.setValue('note', '');
      form.clearErrors();
    }
  }, [open, form]);

  const onSubmit = (values: z.infer<typeof withdrawSchema>) => {
    if (!item) return;
    if (values.quantity > item.quantity) {
      form.setError('quantity', { message: `Cannot withdraw more than ${item.quantity}` });
      return;
    }
    localStorage.setItem('culaccino_last_employee', values.employeeName);
    withdrawItem(item.id, values.quantity, values.employeeName, values.note);
    toast({
      title: t('withdrawalConfirmed'),
      description: t('withdrawalConfirmedDesc', { qty: values.quantity, unit: item.unit, name: item.name }),
    });
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('withdrawTitle')}</DialogTitle>
          <DialogDescription>
            {t('withdrawDesc', { name: item.name, qty: item.quantity, unit: item.unit })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('yourName')} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder={t('yourNamePlaceholder')} {...field} data-testid="input-employee-name" />
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
                  <FormLabel>{t('quantityLabel', { unit: item.unit })} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" max={item.quantity} {...field} data-testid="input-withdraw-quantity" />
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
                    <Textarea placeholder={t('notePlaceholder')} {...field} className="resize-none" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
              <Button type="submit" data-testid="button-confirm-withdraw">{t('confirmWithdrawal')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
