import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <RegistrationForm />
      </main>
      <footer className="bg-[#1a237e] text-white text-center py-4 mt-8 text-xs tracking-wide">
        <p>Sindicato dos Engenheiros no Estado do Ceará — SENGE-CE</p>
        <p className="text-white/60 mt-1">Rua: Alegre, 01 Praia de Iracema, CEP: 60.060-280 – Fortaleza-CE</p>
      </footer>
    </div>
  );
}
