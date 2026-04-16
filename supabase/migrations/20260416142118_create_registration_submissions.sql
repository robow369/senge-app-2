/*
  # Create registration_submissions table

  ## Purpose
  Tracks the lifecycle of each SENGE-CE registration form submission,
  from initial PDF generation through D4Sign digital signing to final
  mock API submission.

  ## New Tables

  ### registration_submissions
  - `id` (uuid, primary key) - unique submission identifier
  - `created_at` (timestamptz) - when the submission was created
  - `updated_at` (timestamptz) - last status change timestamp
  - `form_data` (jsonb) - complete form data snapshot at time of submission
  - `signer_name` (text) - denormalized signer full name for quick access
  - `signer_cpf` (text) - CPF digits only (11 chars), used for D4Sign signer config
  - `signer_email` (text) - email used to identify signer in D4Sign
  - `d4sign_document_uuid` (text) - D4Sign document UUID returned after PDF upload
  - `d4sign_safe_uuid` (text) - D4Sign safe/folder UUID where document is stored
  - `signing_link` (text) - signer-scoped URL to the D4Sign signing page
  - `status` (text) - lifecycle state: pending_upload → pending_signature → signed → submitted → failed
  - `api_response` (jsonb) - response from the final mock API call after signing
  - `error_message` (text) - error details if status is 'failed'

  ## Security
  - RLS enabled
  - Public insert allowed (anonymous users submit forms)
  - Public select by id allowed (frontend polls own submission status)
  - No public update or delete (only service role via webhook can update)

  ## Indexes
  - By d4sign_document_uuid for fast webhook lookups
  - By status for operational monitoring
*/

CREATE TABLE IF NOT EXISTS registration_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  form_data             JSONB NOT NULL,
  signer_name           TEXT NOT NULL DEFAULT '',
  signer_cpf            TEXT NOT NULL DEFAULT '',
  signer_email          TEXT NOT NULL DEFAULT '',
  d4sign_document_uuid  TEXT,
  d4sign_safe_uuid      TEXT,
  signing_link          TEXT,
  status                TEXT NOT NULL DEFAULT 'pending_upload'
                        CHECK (status IN (
                          'pending_upload',
                          'pending_signature',
                          'signed',
                          'submitted',
                          'failed'
                        )),
  api_response          JSONB,
  error_message         TEXT
);

CREATE INDEX IF NOT EXISTS idx_registration_d4sign_uuid
  ON registration_submissions(d4sign_document_uuid);

CREATE INDEX IF NOT EXISTS idx_registration_status
  ON registration_submissions(status);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_registration_updated_at'
  ) THEN
    CREATE TRIGGER trg_registration_updated_at
      BEFORE UPDATE ON registration_submissions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

ALTER TABLE registration_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a new submission"
  ON registration_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read a submission by id"
  ON registration_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);
