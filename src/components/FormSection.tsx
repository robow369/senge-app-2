import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="mb-6">
      <div className="bg-[#3dbce7] text-white text-center py-2 px-4 mb-0">
        <h2 className="font-bold text-sm tracking-widest uppercase">{title}</h2>
      </div>
      <div className="border border-t-0 border-gray-300 p-4 bg-white">
        {children}
      </div>
    </div>
  );
}
