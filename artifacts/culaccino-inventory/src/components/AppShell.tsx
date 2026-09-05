import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Coffee, Package, History, BarChart3, Sun, Moon, Languages, Settings } from 'lucide-react';
import { useRole } from '../hooks/useRole';
import { RoleSwitcher } from './RoleSwitcher';
import { PinSettings } from './PinSettings';
import { useTheme } from 'next-themes';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { role } = useRole();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const [showPinSettings, setShowPinSettings] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <Coffee className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">{t('culaccino')}</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground flex items-center gap-2',
                  location === '/' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                )}
              >
                <Package className="h-4 w-4" />
                <span className="hidden md:inline-block">{t('inventory')}</span>
              </Link>

              {role === 'manager' && (
                <>
                  <Link
                    href="/audit"
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground flex items-center gap-2',
                      location === '/audit' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden md:inline-block">{t('auditLog')}</span>
                  </Link>
                  <Link
                    href="/reports"
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground flex items-center gap-2',
                      location === '/reports' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden md:inline-block">{t('reports')}</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-muted-foreground hover:text-foreground gap-1.5 font-semibold text-sm px-2.5"
              data-testid="button-lang-toggle"
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Languages className="h-4 w-4" />
              <span>{t('langToggle')}</span>
            </Button>

            {/* Manager Settings (PIN change) */}
            {role === 'manager' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPinSettings(true)}
                className="text-muted-foreground hover:text-foreground"
                title="Manager Settings"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Manager Settings</span>
              </Button>
            )}

            {/* Dark/light mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground relative"
              data-testid="button-theme-toggle"
              title={t('toggleTheme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('toggleTheme')}</span>
            </Button>

            <RoleSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>

      <PinSettings open={showPinSettings} onClose={() => setShowPinSettings(false)} />
    </div>
  );
}
