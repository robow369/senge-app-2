import { Facebook, Instagram, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full">
      <div className="bg-[#1a237e] text-white px-4 py-1.5 flex justify-between items-center text-sm">
        <span className="font-medium tracking-wide">Estatuto</span>
        <div className="flex gap-3">
          <a href="#" aria-label="Facebook" className="hover:text-[#3dbce7] transition-colors">
            <Facebook size={16} />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-[#3dbce7] transition-colors">
            <Instagram size={16} />
          </a>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center">
              <SengeLogo />
            </div>
          </div>
          <div className="text-[#1a237e] leading-tight">
            <div className="text-sm font-semibold">Sindicato dos Engenheiros no</div>
            <div className="text-sm font-semibold">Estado do Ceará</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {['Início', 'Instituição', 'Edital', 'Jurídicos', 'Mídias', 'Contato'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-gray-700 hover:text-[#3dbce7] text-sm font-medium transition-colors"
            >
              {item}
            </a>
          ))}
          <div className="ml-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#3dbce7] w-48"
            />
          </div>
        </nav>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-3 flex flex-col gap-3">
          {['Início', 'Instituição', 'Edital', 'Jurídicos', 'Mídias', 'Contato'].map((item) => (
            <a key={item} href="#" className="text-gray-700 text-sm font-medium">
              {item}
            </a>
          ))}
        </div>
      )}

      <div className="bg-[#3dbce7] px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-white/80 mb-1">
            <span>Home</span>
            <span className="mx-2">›</span>
            <span>Atualização Cadastral</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Atualização Cadastral</h1>
        </div>
      </div>
    </header>
  );
}

function SengeLogo() {
  return (
    <svg viewBox="0 0 80 80" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="32" r="20" fill="none" stroke="#1a237e" strokeWidth="5" />
      <circle cx="40" cy="32" r="10" fill="none" stroke="#3dbce7" strokeWidth="4" />
      <ellipse cx="40" cy="32" rx="20" ry="8" fill="none" stroke="#1a237e" strokeWidth="3" />
      <text x="12" y="68" fontSize="11" fill="#1a237e" fontWeight="bold" fontFamily="Arial">SENGE.CE</text>
    </svg>
  );
}
