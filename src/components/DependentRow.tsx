import { ChangeEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Dependent } from '../types/form';
import { formatDate, formatCPF } from '../utils/formatters';

interface DependentRowErrors {
  nome?: string;
  parentesco?: string;
  nascimento?: string;
  cpf?: string;
}

interface DependentRowProps {
  dependent: Dependent;
  index: number;
  errors?: DependentRowErrors;
  onChange: (id: string, field: keyof Dependent, value: string) => void;
  onRemove: (id: string) => void;
}

export default function DependentRow({ dependent, index, errors, onChange, onRemove }: DependentRowProps) {
  function handleChange(field: keyof Dependent, formatter?: (v: string) => string) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = formatter ? formatter(e.target.value) : e.target.value;
      onChange(dependent.id, field, value);
    };
  }

  const fieldClass = (err?: string) =>
    `border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#3dbce7] transition-all ${
      err ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2 border-b border-gray-100 last:border-0">
      <div className="col-span-1 flex items-center justify-center pt-2">
        <span className="text-xs font-bold text-gray-400">{index + 1}</span>
      </div>
      <div className="col-span-3">
        <input
          value={dependent.nome}
          onChange={handleChange('nome')}
          placeholder="Nome completo"
          className={fieldClass(errors?.nome)}
        />
        {errors?.nome && <p className="text-red-500 text-xs mt-0.5">{errors.nome}</p>}
      </div>
      <div className="col-span-3">
        <input
          value={dependent.parentesco}
          onChange={handleChange('parentesco')}
          placeholder="Parentesco"
          className={fieldClass(errors?.parentesco)}
        />
        {errors?.parentesco && <p className="text-red-500 text-xs mt-0.5">{errors.parentesco}</p>}
      </div>
      <div className="col-span-2">
        <input
          value={dependent.nascimento}
          onChange={handleChange('nascimento', formatDate)}
          placeholder="DD/MM/AAAA"
          className={fieldClass(errors?.nascimento)}
        />
        {errors?.nascimento && <p className="text-red-500 text-xs mt-0.5">{errors.nascimento}</p>}
      </div>
      <div className="col-span-2">
        <input
          value={dependent.cpf}
          onChange={handleChange('cpf', formatCPF)}
          placeholder="000.000.000-00"
          className={fieldClass(errors?.cpf)}
        />
        {errors?.cpf && <p className="text-red-500 text-xs mt-0.5">{errors.cpf}</p>}
      </div>
      <div className="col-span-1 flex items-center justify-center pt-1.5">
        <button
          type="button"
          onClick={() => onRemove(dependent.id)}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="Remover dependente"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
