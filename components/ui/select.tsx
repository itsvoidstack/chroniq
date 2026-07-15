import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

export const Select: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)!;

  return (
    <Button
      variant="outline"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full justify-between ${className}`}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2" />
    </Button>
  );
};

export const SelectValue: React.FC<{
  placeholder?: string;
}> = ({ placeholder }) => {
  const { value } = useContext(SelectContext)!;
  return <span>{value || placeholder}</span>;
};

export const SelectContent: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)!;

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50">
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const { value: currentValue, onValueChange, setIsOpen } = useContext(SelectContext)!;

  const isSelected = currentValue === value;

  return (
    <button
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className="w-full px-3 py-2 text-left hover:bg-secondary flex items-center justify-between"
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </button>
  );
};
