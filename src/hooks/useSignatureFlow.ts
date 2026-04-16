import { useState } from 'react';
import { FormData } from '../types/form';
import { initiateSigningFlow } from '../api/signatureApi';
import { SignatureFlowStatus, InitiateSigningResponse } from '../types/signature';

export function useSignatureFlow() {
  const [flowStatus, setFlowStatus] = useState<SignatureFlowStatus>('idle');
  const [signingData, setSigningData] = useState<InitiateSigningResponse | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);

  async function startSigning(formData: FormData) {
    setFlowStatus('generating');
    setFlowError(null);
    try {
      const result = await initiateSigningFlow(formData);
      setSigningData(result);
      setFlowStatus('pending_signature');
    } catch (e) {
      setFlowError(e instanceof Error ? e.message : 'Erro ao iniciar assinatura.');
      setFlowStatus('failed');
    }
  }

  function reset() {
    setFlowStatus('idle');
    setSigningData(null);
    setFlowError(null);
  }

  return { flowStatus, signingData, flowError, startSigning, reset };
}
