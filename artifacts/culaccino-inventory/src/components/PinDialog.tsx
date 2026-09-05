import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertCircle } from 'lucide-react';
import { verifyPin } from '../lib/storage';

interface PinDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinDialog({ open, onSuccess, onCancel }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError('Please enter your PIN.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const valid = await verifyPin(pin);
      if (valid) {
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
        inputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Manager Mode</DialogTitle>
          </div>
          <DialogDescription>
            Enter your manager PIN to access Manager Mode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin-input">PIN</Label>
            <Input
              id="pin-input"
              ref={inputRef}
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              autoComplete="current-password"
              disabled={loading}
            />
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !pin}>
              {loading ? 'Verifying…' : 'Unlock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
