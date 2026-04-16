import { Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { SubmissionStatus } from '../../types/signature';

interface SignatureStatusProps {
  status: SubmissionStatus | null;
  pollingError: string | null;
}

export default function SignatureStatus({ status, pollingError }: SignatureStatusProps) {
  if (pollingError) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <AlertCircle size={16} className="shrink-0" />
        <span>Erro ao verificar status: {pollingError}</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <Loader size={16} className="animate-spin shrink-0" />
        <span>Conectando ao serviço de assinatura...</span>
      </div>
    );
  }

  if (status.status === 'pending_signature' || status.status === 'pending_upload') {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-[#1a237e] bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Clock size={16} className="shrink-0" />
        <span>Aguardando assinatura no documento acima. Após assinar, este painel será atualizado automaticamente.</span>
      </div>
    );
  }

  if (status.status === 'signed') {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Loader size={16} className="animate-spin shrink-0" />
        <span>Documento assinado! Enviando cadastro...</span>
      </div>
    );
  }

  if (status.status === 'submitted') {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <CheckCircle size={16} className="shrink-0" />
        <span>{status.api_response?.message ?? 'Cadastro enviado com sucesso!'}</span>
      </div>
    );
  }

  if (status.status === 'failed') {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <AlertCircle size={16} className="shrink-0" />
        <span>{status.error_message ?? 'Ocorreu um erro ao processar o documento.'}</span>
      </div>
    );
  }

  return null;
}
