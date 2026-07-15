import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ defaultValue, value: controlledValue, onValueChange, className, children }) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    else setUncontrolledValue(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return <div className={`flex gap-2 p-1 bg-secondary rounded-md ${className}`}>{children}</div>;
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const { value: currentValue, onValueChange } = useContext(TabsContext)!;
  const isActive = currentValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const { value: currentValue } = useContext(TabsContext)!;

  if (currentValue !== value) return null;

  return <div className={className}>{children}</div>;
};
