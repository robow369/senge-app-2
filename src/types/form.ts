export interface Dependent {
  id: string;
  nome: string;
  parentesco: string;
  nascimento: string;
  cpf: string;
}

export interface FormData {
  nome: string;
  nomeMae: string;
  dataNascimento: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  cpf: string;
  rg: string;
  residencia: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  telefonesContato: string;
  celularWhatsapp: string;
  email: string;
  cursoGraduacao: string;
  outrasTitulacoes: string;
  instituicao: string;
  anoColacaoGrau: string;
  carteiraConfeaRnp: string;
  dataEmissao: string;
  empresaOndeTrabalha: string;
  dataAdmissao: string;
  cargo: string;
  telefoneEmpresa: string;
  enderecoEmpresa: string;
  dependentes: Dependent[];
}

export interface FormErrors {
  nome?: string;
  nomeMae?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  cpf?: string;
  rg?: string;
  residencia?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefonesContato?: string;
  celularWhatsapp?: string;
  email?: string;
  cursoGraduacao?: string;
  outrasTitulacoes?: string;
  instituicao?: string;
  anoColacaoGrau?: string;
  carteiraConfeaRnp?: string;
  dataEmissao?: string;
  empresaOndeTrabalha?: string;
  dataAdmissao?: string;
  cargo?: string;
  telefoneEmpresa?: string;
  enderecoEmpresa?: string;
  dependentes?: Array<{
    nome?: string;
    parentesco?: string;
    nascimento?: string;
    cpf?: string;
  }>;
}
