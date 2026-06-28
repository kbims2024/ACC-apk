import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: React.ReactNode; value: string; searchKeywords?: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  renderTrigger?: (selectedOption: any, isOpen: boolean) => React.ReactNode;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Sélectionnez...",
  disabled = false,
  className = "",
  dropdownClassName = "",
  renderTrigger
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={
          renderTrigger 
            ? "" 
            : `w-full h-12 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`
        }
      >
        {renderTrigger ? (
          renderTrigger(selectedOption, isOpen)
        ) : (
          <>
            <span className={selectedOption ? "" : "text-slate-400"}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto ${dropdownClassName}`}
          >
            {options.map((option, idx) => (
              <button
                key={`${option.value}-${idx}`}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left ${value === option.value ? "bg-brand-50/50 dark:bg-slate-700/50" : ""}`}
              >
                <span className={`font-medium ${value === option.value ? "text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"}`}>
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                )}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                Aucune option disponible
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
