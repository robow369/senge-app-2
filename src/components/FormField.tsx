import { ChangeEvent } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  as?: 'input' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
}

export default function FormField({
  label,
  id,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  className = '',
  as = 'input',
  options = [],
  required = true,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {as === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3dbce7] focus:border-transparent transition-all ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3dbce7] focus:border-transparent transition-all ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}
