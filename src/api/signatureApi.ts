import { supabase } from '../lib/supabaseClient';
import { FormData } from '../types/form';
import { InitiateSigningResponse, SubmissionStatus } from '../types/signature';

export async function initiateSigningFlow(formData: FormData): Promise<InitiateSigningResponse> {
  const { data, error } = await supabase.functions.invoke('initiate-signing', {
    body: { formData },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as InitiateSigningResponse;
}

export async function getSubmissionStatus(submissionId: string): Promise<SubmissionStatus> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/get-submission-status?id=${submissionId}`,
    { headers: { apikey: anonKey } }
  );

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json() as Promise<SubmissionStatus>;
}
