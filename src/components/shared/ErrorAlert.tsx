import { AlertCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils/cn';

interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
  variant?: 'default' | 'destructive';
}

export function ErrorAlert({ title = 'Error', message, className, variant = 'destructive' }: ErrorAlertProps) {
  return (
    <Alert variant={variant} className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function FormRootError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <XCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}