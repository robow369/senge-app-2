export type SignatureFlowStatus =
  | 'idle'
  | 'generating'
  | 'pending_signature'
  | 'failed';

export interface InitiateSigningResponse {
  submissionId: string;
  signingLink: string;
  documentUuid: string;
}

export interface SubmissionStatus {
  status: 'pending_upload' | 'pending_signature' | 'signed' | 'submitted' | 'failed';
  api_response: { success: boolean; message: string; data?: { id: string; updatedAt: string } } | null;
  error_message: string | null;
}
