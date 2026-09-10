import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-[#050B14] border rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50
              focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 focus:border-[#38BDF8]/50
              transition-colors duration-200
              ${error ? 'border-[#EF4444]/50' : 'border-[#38BDF8]/20 hover:border-[#38BDF8]/40'}
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-[#050B14] border rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC]
            focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 focus:border-[#38BDF8]/50
            transition-colors duration-200
            ${error ? 'border-[#EF4444]/50' : 'border-[#38BDF8]/20 hover:border-[#38BDF8]/40'}
            ${className}
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0B1624]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full bg-[#050B14] border rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50
            focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 focus:border-[#38BDF8]/50
            transition-colors duration-200 resize-none
            ${error ? 'border-[#EF4444]/50' : 'border-[#38BDF8]/20 hover:border-[#38BDF8]/40'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
