import { useState } from 'react';
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
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { verifyPin, setPin } from '../lib/storage';
import { useToast } from '@/hooks/use-toast';

interface PinSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function PinSettings({ open, onClose }: PinSettingsProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPin || !newPin || !confirmPin) {
      setError('All fields are required.');
      return;
    }
    if (newPin.length < 4) {
      setError('New PIN must be at least 4 characters.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const valid = await verifyPin(currentPin);
      if (!valid) {
        setError('Current PIN is incorrect.');
        setCurrentPin('');
        return;
      }
      await setPin(newPin);
      toast({
        title: 'PIN updated',
        description: 'Your manager PIN has been changed successfully.',
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <DialogTitle>Change Manager PIN</DialogTitle>
          </div>
          <DialogDescription>
            Update the PIN required to enter Manager Mode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input
              id="current-pin"
              type="password"
              inputMode="numeric"
              placeholder="Enter current PIN"
              value={currentPin}
              onChange={(e) => { setCurrentPin(e.target.value); setError(''); }}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              placeholder="At least 4 characters"
              value={newPin}
              onChange={(e) => { setNewPin(e.target.value); setError(''); }}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              placeholder="Repeat new PIN"
              value={confirmPin}
              onChange={(e) => { setConfirmPin(e.target.value); setError(''); }}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !currentPin || !newPin || !confirmPin}>
              {loading ? 'Saving…' : 'Save PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
