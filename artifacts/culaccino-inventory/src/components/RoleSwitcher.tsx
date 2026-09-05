import { useState } from 'react';
import { useRole } from '../hooks/useRole';
import { Role } from '../types/inventory';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { PinDialog } from './PinDialog';

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { t } = useLanguage();
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleValueChange = (val: string) => {
    if (val === 'manager') {
      setShowPinDialog(true);
    } else {
      setRole('employee');
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setRole('manager');
  };

  const handlePinCancel = () => {
    setShowPinDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('gap-2 border-border/50', role === 'manager' ? 'text-primary' : 'text-muted-foreground')}
            data-testid="button-role-switcher"
          >
            {role === 'manager' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            <span className="hidden sm:inline-block">
              {role === 'manager' ? t('managerMode') : t('employeeMode')}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuRadioGroup value={role} onValueChange={handleValueChange}>
            <DropdownMenuRadioItem value="manager" data-testid="menu-item-manager">
              <Shield className="h-4 w-4 me-2" />
              {t('manager')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="employee" data-testid="menu-item-employee">
              <User className="h-4 w-4 me-2" />
              {t('employee')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <PinDialog
        open={showPinDialog}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    </>
  );
}
