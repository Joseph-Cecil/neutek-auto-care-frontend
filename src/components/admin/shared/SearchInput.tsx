'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn }     from '@/lib/utils/cn';
import { APP_CONSTANTS } from '@/config/constants';

interface SearchInputProps {
  onSearch:   (value: string) => void;
  placeholder?: string;
  className?:   string;
  defaultValue?: string;
}

export function SearchInput({
  onSearch, placeholder = 'Search...', className, defaultValue = '',
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <button type="button" onClick={handleClear}
          className="absolute right-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}