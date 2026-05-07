'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface Rule { label: string; test: (p: string) => boolean; }

const RULES: Rule[] = [
  { label: 'At least 8 characters',             test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',              test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',              test: (p) => /[a-z]/.test(p) },
  { label: 'One number',                        test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (@\$!%*?&)', test: (p) => /[@\$!%*?&]/.test(p) },
];

const STRENGTH_CONFIG = [
  { label: '',       color: 'bg-muted' },
  { label: 'Weak',   color: 'bg-red-500' },
  { label: 'Fair',   color: 'bg-amber-500' },
  { label: 'Good',   color: 'bg-blue-500' },
  { label: 'Strong', color: 'bg-green-500' },
];

function getStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return 0;
  if (passed === 2) return 1;
  if (passed === 3) return 2;
  if (passed === 4) return 3;
  return 4;
}

export function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => getStrength(password), [password]);
  const config   = STRENGTH_CONFIG[strength];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            level <= strength ? config.color : 'bg-muted',
          )} />
        ))}
      </div>
      {config.label && (
        <p className={cn('text-xs font-medium',
          strength === 1 && 'text-red-500',
          strength === 2 && 'text-amber-500',
          strength === 3 && 'text-blue-500',
          strength === 4 && 'text-green-500',
        )}>
          {config.label} password
        </p>
      )}
      <ul className="space-y-1">
        {RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              <span className={cn(
                'flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold',
                passed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground',
              )}>
                {passed ? '✓' : '·'}
              </span>
              <span className={cn(passed ? 'text-foreground' : 'text-muted-foreground')}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}