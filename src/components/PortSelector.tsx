
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import portsData from '@/assets/data/ports-1000.json';

interface Port {
  name: string;
  country: string;
  code: string;
}

interface PortSelectorProps {
  value: string;
  onChange: (port: Port | null) => void;
  placeholder?: string;
  className?: string;
}

export const PortSelector: React.FC<PortSelectorProps> = ({
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter ports based on search term
  const filteredPorts = portsData.filter(port =>
    port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize selected port from value
  useEffect(() => {
    if (value) {
      const port = portsData.find(p => p.code === value);
      setSelectedPort(port || null);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePortSelect = (port: Port) => {
    setSelectedPort(port);
    onChange(port);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayText = selectedPort 
    ? `${selectedPort.name} (${selectedPort.code})`
    : placeholder || t('form.selectPort');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full justify-between text-left font-normal ${
          !selectedPort ? 'text-muted-foreground' : ''
        } ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 opacity-50 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${
                isRTL ? 'right-3' : 'left-3'
              }`} />
              <Input
                placeholder={t('form.searchPort')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                autoFocus
              />
            </div>
          </div>
          
          <div className="port-dropdown overflow-y-auto max-h-64">
            {filteredPorts.length > 0 ? (
              filteredPorts.map((port) => (
                <button
                  key={port.code}
                  type="button"
                  onClick={() => handlePortSelect(port)}
                  className={`w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/50 last:border-b-0 ${
                    isRTL ? 'text-right' : 'text-left'
                  } ${selectedPort?.code === port.code ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <div className="font-medium">{port.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {port.code} • {port.country}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No ports found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
