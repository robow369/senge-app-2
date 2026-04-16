import { useState, ChangeEvent } from 'react';
import { PlusCircle, CheckCircle, AlertCircle, Loader, PenLine } from 'lucide-react';
import { FormData, FormErrors, Dependent } from '../types/form';
import { formatCPF, formatRG, formatCEP, formatPhone, formatDate } from '../utils/formatters';
import { validateCPF, validateRG, validateCEP, validateEmail, validatePhone, validateDate, validateYear, validateRequired } from '../utils/validators';
import FormSection from './FormSection';
import FormField from './FormField';
import DependentRow from './DependentRow';
import SignatureModal from './signature/SignatureModal';
import { useSignatureFlow } from '../hooks/useSignatureFlow';

const ESTADO_CIVIL_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
  { value: 'separado', label: 'Separado(a)' },
];

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }));

const initialForm: FormData = {
  nome: '', nomeMae: '', dataNascimento: '', estadoCivil: '', nacionalidade: '', naturalidade: '',
  cpf: '', rg: '', residencia: '', bairro: '', cep: '', cidade: '', estado: '', telefonesContato: '',
  celularWhatsapp: '', email: '', cursoGraduacao: '', outrasTitulacoes: '', instituicao: '',
  anoColacaoGrau: '', carteiraConfeaRnp: '', dataEmissao: '', empresaOndeTrabalha: '', dataAdmissao: '',
  cargo: '', telefoneEmpresa: '', enderecoEmpresa: '', dependentes: [],
};

function newDependent(): Dependent {
  return { id: crypto.randomUUID(), nome: '', parentesco: '', nascimento: '', cpf: '' };
}

function validateForm(form: FormData): { errors: FormErrors; valid: boolean } {
  const errors: FormErrors = {};
  let valid = true;

  const req = (val: string, key: keyof FormErrors, msg = 'Campo obrigatório') => {
    if (!validateRequired(val)) {
      (errors as Record<string, string>)[key as string] = msg;
      valid = false;
    }
  };

  req(form.nome, 'nome');
  req(form.nomeMae, 'nomeMae');

  if (!validateRequired(form.dataNascimento)) {
    errors.dataNascimento = 'Campo obrigatório';
    valid = false;
  } else if (!validateDate(form.dataNascimento)) {
    errors.dataNascimento = 'Data inválida (DD/MM/AAAA)';
    valid = false;
  }

  req(form.estadoCivil, 'estadoCivil');
  req(form.nacionalidade, 'nacionalidade');
  req(form.naturalidade, 'naturalidade');

  if (!validateRequired(form.cpf)) {
    errors.cpf = 'Campo obrigatório';
    valid = false;
  } else if (!validateCPF(form.cpf)) {
    errors.cpf = 'CPF inválido';
    valid = false;
  }

  if (!validateRequired(form.rg)) {
    errors.rg = 'Campo obrigatório';
    valid = false;
  } else if (!validateRG(form.rg)) {
    errors.rg = 'RG inválido';
    valid = false;
  }

  req(form.residencia, 'residencia');
  req(form.bairro, 'bairro');

  if (!validateRequired(form.cep)) {
    errors.cep = 'Campo obrigatório';
    valid = false;
  } else if (!validateCEP(form.cep)) {
    errors.cep = 'CEP inválido (8 dígitos)';
    valid = false;
  }

  req(form.cidade, 'cidade');
  req(form.estado, 'estado');

  if (!validateRequired(form.telefonesContato)) {
    errors.telefonesContato = 'Campo obrigatório';
    valid = false;
  } else if (!validatePhone(form.telefonesContato)) {
    errors.telefonesContato = 'Telefone inválido';
    valid = false;
  }

  if (!validateRequired(form.celularWhatsapp)) {
    errors.celularWhatsapp = 'Campo obrigatório';
    valid = false;
  } else if (!validatePhone(form.celularWhatsapp)) {
    errors.celularWhatsapp = 'Número inválido';
    valid = false;
  }

  if (!validateRequired(form.email)) {
    errors.email = 'Campo obrigatório';
    valid = false;
  } else if (!validateEmail(form.email)) {
    errors.email = 'E-mail inválido';
    valid = false;
  }

  req(form.cursoGraduacao, 'cursoGraduacao');
  req(form.outrasTitulacoes, 'outrasTitulacoes');
  req(form.instituicao, 'instituicao');

  if (!validateRequired(form.anoColacaoGrau)) {
    errors.anoColacaoGrau = 'Campo obrigatório';
    valid = false;
  } else if (!validateYear(form.anoColacaoGrau)) {
    errors.anoColacaoGrau = 'Ano inválido';
    valid = false;
  }

  req(form.carteiraConfeaRnp, 'carteiraConfeaRnp');

  if (!validateRequired(form.dataEmissao)) {
    errors.dataEmissao = 'Campo obrigatório';
    valid = false;
  } else if (!validateDate(form.dataEmissao)) {
    errors.dataEmissao = 'Data inválida (DD/MM/AAAA)';
    valid = false;
  }

  req(form.empresaOndeTrabalha, 'empresaOndeTrabalha');

  if (!validateRequired(form.dataAdmissao)) {
    errors.dataAdmissao = 'Campo obrigatório';
    valid = false;
  } else if (!validateDate(form.dataAdmissao)) {
    errors.dataAdmissao = 'Data inválida (DD/MM/AAAA)';
    valid = false;
  }

  req(form.cargo, 'cargo');

  if (!validateRequired(form.telefoneEmpresa)) {
    errors.telefoneEmpresa = 'Campo obrigatório';
    valid = false;
  } else if (!validatePhone(form.telefoneEmpresa)) {
    errors.telefoneEmpresa = 'Telefone inválido';
    valid = false;
  }

  req(form.enderecoEmpresa, 'enderecoEmpresa');

  if (form.dependentes.length > 0) {
    const depErrors: FormErrors['dependentes'] = form.dependentes.map((dep) => {
      const e: { nome?: string; parentesco?: string; nascimento?: string; cpf?: string } = {};
      let hasErr = false;
      if (!validateRequired(dep.nome)) { e.nome = 'Obrigatório'; hasErr = true; valid = false; }
      if (!validateRequired(dep.parentesco)) { e.parentesco = 'Obrigatório'; hasErr = true; valid = false; }
      if (!validateRequired(dep.nascimento)) {
        e.nascimento = 'Obrigatório'; hasErr = true; valid = false;
      } else if (!validateDate(dep.nascimento)) {
        e.nascimento = 'Data inválida'; hasErr = true; valid = false;
      }
      if (!validateRequired(dep.cpf)) {
        e.cpf = 'Obrigatório'; hasErr = true; valid = false;
      } else if (!validateCPF(dep.cpf)) {
        e.cpf = 'CPF inválido'; hasErr = true; valid = false;
      }
      return hasErr ? e : {};
    });
    if (depErrors.some((e) => Object.keys(e).length > 0)) {
      errors.dependentes = depErrors;
    }
  }

  return { errors, valid };
}

export default function RegistrationForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const { flowStatus, signingData, flowError, startSigning, reset } = useSignatureFlow();

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cpf') formatted = formatCPF(value);
    else if (name === 'rg') formatted = formatRG(value);
    else if (name === 'cep') formatted = formatCEP(value);
    else if (name === 'telefonesContato' || name === 'celularWhatsapp' || name === 'telefoneEmpresa') formatted = formatPhone(value);
    else if (name === 'dataNascimento' || name === 'dataEmissao' || name === 'dataAdmissao') formatted = formatDate(value);

    setForm((prev) => ({ ...prev, [name]: formatted }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleDependentChange(id: string, field: keyof Dependent, value: string) {
    setForm((prev) => ({
      ...prev,
      dependentes: prev.dependentes.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  }

  function handleAddDependent() {
    if (form.dependentes.length >= 5) return;
    setForm((prev) => ({ ...prev, dependentes: [...prev.dependentes, newDependent()] }));
  }

  function handleRemoveDependent(id: string) {
    setForm((prev) => ({ ...prev, dependentes: prev.dependentes.filter((d) => d.id !== id) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitResult(null);

    const { errors: validationErrors, valid } = validateForm(form);
    setErrors(validationErrors);

    if (!valid) {
      const firstError = document.querySelector('[class*="border-red"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    await startSigning(form);
  }

  const field = (
    label: string,
    id: keyof FormData,
    opts?: {
      type?: string;
      placeholder?: string;
      className?: string;
      as?: 'input' | 'select';
      options?: { value: string; label: string }[];
    }
  ) => (
    <FormField
      label={label}
      id={id as string}
      value={form[id] as string}
      onChange={handleChange}
      error={errors[id as keyof FormErrors] as string | undefined}
      {...opts}
    />
  );

  const isGenerating = flowStatus === 'generating';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {signingData && flowStatus === 'pending_signature' && (
        <SignatureModal
          submissionId={signingData.submissionId}
          signingLink={signingData.signingLink}
          onClose={reset}
          onComplete={(success, message) => {
            reset();
            setSubmitResult({ success, message });
            if (success) window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {submitResult && (
        <div
          className={`mb-6 flex items-start gap-3 p-4 rounded-lg border ${
            submitResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {submitResult.success ? <CheckCircle size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          <div>
            <p className="font-semibold">{submitResult.success ? 'Sucesso!' : 'Erro'}</p>
            <p className="text-sm mt-0.5">{submitResult.message}</p>
          </div>
        </div>
      )}

      {flowError && flowStatus === 'failed' && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Erro ao iniciar assinatura</p>
            <p className="text-sm mt-0.5">{flowError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="Dados Pessoais">
          <div className="grid grid-cols-1 gap-4">
            {field('Nome', 'nome', { placeholder: 'Nome completo' })}
            {field('Nome da Mãe', 'nomeMae', { placeholder: 'Nome completo da mãe' })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Data de Nascimento', 'dataNascimento', { placeholder: 'DD/MM/AAAA' })}
              {field('Estado Civil', 'estadoCivil', { as: 'select', options: ESTADO_CIVIL_OPTIONS })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Nacionalidade', 'nacionalidade', { placeholder: 'Ex: Brasileira' })}
              {field('Naturalidade', 'naturalidade', { placeholder: 'Cidade/UF de nascimento' })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('CPF', 'cpf', { placeholder: '000.000.000-00' })}
              {field('RG', 'rg', { placeholder: '00.000.000-0' })}
            </div>
          </div>
        </FormSection>

        <FormSection title="Endereço">
          <div className="grid grid-cols-1 gap-4">
            {field('Residência', 'residencia', { placeholder: 'Rua, número, complemento' })}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {field('Bairro', 'bairro', { placeholder: 'Bairro' })}
              {field('CEP', 'cep', { placeholder: '00000-000' })}
              {field('Cidade', 'cidade', { placeholder: 'Cidade' })}
              {field('Estado', 'estado', { as: 'select', options: ESTADOS_BR })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Telefones de Contato', 'telefonesContato', { placeholder: '(00) 0000-0000' })}
              {field('Celular (WhatsApp)', 'celularWhatsapp', { placeholder: '(00) 00000-0000' })}
            </div>
            {field('E-mail', 'email', { type: 'email', placeholder: 'seu@email.com.br' })}
          </div>
        </FormSection>

        <FormSection title="Dados Profissionais">
          <div className="grid grid-cols-1 gap-4">
            {field('Curso de Graduação', 'cursoGraduacao', { placeholder: 'Ex: Engenharia Civil' })}
            {field('Outras Titulações', 'outrasTitulacoes', { placeholder: 'Ex: Especialização, Mestrado...' })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Instituição', 'instituicao', { placeholder: 'Nome da instituição' })}
              {field('Ano da Colação de Grau', 'anoColacaoGrau', { placeholder: 'AAAA' })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Carteira Confea-RNP nº', 'carteiraConfeaRnp', { placeholder: 'Número da carteira' })}
              {field('Data de Emissão', 'dataEmissao', { placeholder: 'DD/MM/AAAA' })}
            </div>
          </div>
        </FormSection>

        <FormSection title="Atividades Profissionais">
          <div className="grid grid-cols-1 gap-4">
            {field('Empresa onde trabalha', 'empresaOndeTrabalha', { placeholder: 'Nome da empresa' })}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field('Data de Admissão', 'dataAdmissao', { placeholder: 'DD/MM/AAAA' })}
              {field('Cargo', 'cargo', { placeholder: 'Cargo atual' })}
              {field('Telefone', 'telefoneEmpresa', { placeholder: '(00) 0000-0000' })}
            </div>
            {field('Endereço', 'enderecoEmpresa', { placeholder: 'Endereço completo da empresa' })}
          </div>
        </FormSection>

        <FormSection title="Dependentes para Unimed">
          <div>
            <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b border-gray-200">
              <div className="col-span-1" />
              <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Nome</div>
              <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Parentesco</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Nasc.</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wide">CPF</div>
              <div className="col-span-1" />
            </div>

            {form.dependentes.length === 0 && (
              <p className="text-sm text-gray-400 italic py-3 text-center">Nenhum dependente adicionado.</p>
            )}

            {form.dependentes.map((dep, idx) => (
              <DependentRow
                key={dep.id}
                dependent={dep}
                index={idx}
                errors={errors.dependentes?.[idx]}
                onChange={handleDependentChange}
                onRemove={handleRemoveDependent}
              />
            ))}

            {form.dependentes.length < 5 && (
              <button
                type="button"
                onClick={handleAddDependent}
                className="mt-3 flex items-center gap-2 text-[#3dbce7] hover:text-[#1a99c8] text-sm font-medium transition-colors"
              >
                <PlusCircle size={16} />
                Adicionar dependente
              </button>
            )}
          </div>
        </FormSection>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-xs text-gray-600 space-y-1.5">
          <p className="font-bold text-gray-700 mb-1">Observação:</p>
          <p>1) Para profissional: anexar cópia da carteira do CREA/CAU ou diploma comprovante de endereço;</p>
          <p>2) A inadimplência com as contribuições sociais acarretará perda(s) dos(s) serviço(s)/benefícios(s)</p>
          <p className="mt-2 italic">
            Fico ciente que a utilização dos serviços/benefícios oferecidos pelo Senge-CE requer que eu esteja adimplente com minhas contribuições sociais
          </p>
        </div>

        <div className="bg-[#3dbce7]/10 border border-[#3dbce7]/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <PenLine size={18} className="text-[#1a237e] shrink-0 mt-0.5" />
          <p className="text-xs text-[#1a237e]">
            Ao clicar em <strong>Assinar e Enviar</strong>, um documento PDF será gerado com seus dados e enviado para assinatura digital via{' '}
            <strong>certificado ICP-Brasil</strong>. Você poderá assinar com certificado em nuvem (BirdID, SafeID, VIDaaS, entre outros)
            ou com cartão/token físico — sem necessidade de gerenciar chaves criptográficas.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isGenerating}
            className="bg-[#1a237e] hover:bg-[#283593] disabled:bg-gray-400 text-white font-bold py-3 px-12 rounded-lg text-sm tracking-widest uppercase transition-all duration-200 flex items-center gap-3 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader size={18} className="animate-spin" />
                Gerando documento...
              </>
            ) : (
              <>
                <PenLine size={18} />
                Assinar e Enviar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
