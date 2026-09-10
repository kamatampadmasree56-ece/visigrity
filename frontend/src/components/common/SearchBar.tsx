import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value, onChange, placeholder = 'Search...', className = ''
}) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full bg-[#050B14] border border-[#38BDF8]/20 hover:border-[#38BDF8]/40
        rounded-lg pl-9 pr-4 py-2 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50
        focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 focus:border-[#38BDF8]/50
        transition-colors duration-200
      "
    />
  </div>
);
