import { useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import SigningWidget from './SigningWidget';
import SignatureStatus from './SignatureStatus';
import { useSubmissionPolling } from '../../hooks/useSubmissionPolling';

interface SignatureModalProps {
  submissionId: string;
  signingLink: string;
  onClose: () => void;
  onComplete: (success: boolean, message: string) => void;
}

export default function SignatureModal({
  submissionId,
  signingLink,
  onClose,
  onComplete,
}: SignatureModalProps) {
  const { status, pollingError } = useSubmissionPolling(submissionId);

  useEffect(() => {
    if (!status) return;
    if (status.status === 'submitted') {
      const msg = status.api_response?.message ?? 'Cadastro enviado com sucesso!';
      const timer = setTimeout(() => onComplete(true, msg), 1200);
      return () => clearTimeout(timer);
    }
    if (status.status === 'failed') {
      const msg = status.error_message ?? 'Erro ao processar o documento.';
      const timer = setTimeout(() => onComplete(false, msg), 1200);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  const isTerminal = status?.status === 'submitted' || status?.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#1a237e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Assinatura Digital</h2>
              <p className="text-white/70 text-xs">ICP-Brasil — Certificado Digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors rounded-full p-1"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-3 bg-[#3dbce7]/10 border-b border-[#3dbce7]/20">
          <p className="text-xs text-[#1a237e] font-medium">
            Assine o documento abaixo utilizando seu certificado ICP-Brasil.
            Você pode usar seu certificado em nuvem (BirdID, SafeID, VIDaaS, etc.) ou cartão/token físico.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isTerminal && <SigningWidget signingLink={signingLink} />}
          <SignatureStatus status={status} pollingError={pollingError} />
        </div>
      </div>
    </div>
  );
}
