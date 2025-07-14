
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// Fuzzy matching utility function
const fuzzyMatch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with gets high score
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains gets medium score
  if (textLower.includes(queryLower)) return 80;
  
  // Fuzzy matching for typos
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }
  
  // Bonus for matching most characters
  if (queryIndex === queryLower.length) {
    score += 20;
  }
  
  return score;
};

// Highlight matching substrings
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);
  
  if (index === -1) return text;
  
  return (
    <>
      {text.substring(0, index)}
      <span className="font-bold bg-accent/30 px-0.5 rounded">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  );
};

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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term updates
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Filter and sort ports with fuzzy matching
  const filteredPorts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return []; // Show no ports when search is empty
    }
    
    const query = debouncedSearchTerm.trim();
    const scored = portsData.map(port => {
      const nameScore = fuzzyMatch(query, port.name);
      const codeScore = fuzzyMatch(query, port.code);
      const countryScore = fuzzyMatch(query, port.country);
      
      const maxScore = Math.max(nameScore, codeScore, countryScore);
      
      return { port, score: maxScore };
    }).filter(item => item.score > 10) // Only show matches with reasonable score
      .sort((a, b) => b.score - a.score) // Sort by best match
      .slice(0, 10) // Limit to top 10 results
      .map(item => item.port);
    
    return scored;
  }, [debouncedSearchTerm]);

  // Reset highlighted index when filtered ports change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredPorts]);

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPorts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPorts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPorts[highlightedIndex]) {
          handlePortSelect(filteredPorts[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  }, [isOpen, filteredPorts, highlightedIndex]);

  const handlePortSelect = useCallback((port: Port) => {
    setSelectedPort(port);
    onChange(port);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  }, [onChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const displayText = selectedPort 
    ? `${selectedPort.name} (${selectedPort.code})`
    : placeholder || t('form.selectPort');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
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
                ref={searchInputRef}
                placeholder={t('form.searchPort')}
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                autoFocus
              />
            </div>
          </div>
          
          <div className="port-dropdown overflow-y-auto max-h-64">
            {filteredPorts.length > 0 ? (
              filteredPorts.map((port, index) => (
                <button
                  key={`${port.code}-${port.name}`} // Use unique key to fix duplicate key warning
                  type="button"
                  onClick={() => handlePortSelect(port)}
                  className={`w-full px-4 py-2 text-sm transition-colors border-b border-border/50 last:border-b-0 ${
                    isRTL ? 'text-right' : 'text-left'
                  } ${
                    index === highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                  } ${selectedPort?.code === port.code ? 'bg-primary/10' : ''}`}
                >
                  <div className="font-medium">
                    {highlightMatch(port.name, debouncedSearchTerm)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {highlightMatch(port.code, debouncedSearchTerm)} • {highlightMatch(port.country, debouncedSearchTerm)}
                  </div>
                </button>
              ))
            ) : debouncedSearchTerm.trim() ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="text-sm font-medium">No ports found</div>
                <div className="text-xs mt-1">Try searching by port name, code, or country</div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="text-sm">Start typing to search ports...</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
