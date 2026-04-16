import { useState, useEffect, useRef } from 'react';
import { getSubmissionStatus } from '../api/signatureApi';
import { SubmissionStatus } from '../types/signature';

const TERMINAL_STATES = ['submitted', 'failed'];
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 200;

export function useSubmissionPolling(submissionId: string | null) {
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!submissionId) return;

    pollCountRef.current = 0;

    const poll = async () => {
      try {
        pollCountRef.current += 1;
        const result = await getSubmissionStatus(submissionId);
        setStatus(result);

        if (
          TERMINAL_STATES.includes(result.status) ||
          pollCountRef.current >= MAX_POLLS
        ) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (e) {
        setPollingError(e instanceof Error ? e.message : 'Erro ao verificar status');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [submissionId]);

  return { status, pollingError };
}
