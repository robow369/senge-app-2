import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildRegistrationPdf } from "../_shared/buildRegistrationPdf.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();

    if (!formData?.nome || !formData?.email || !formData?.cpf) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes: nome, email, cpf" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: submission, error: insertError } = await supabase
      .from("registration_submissions")
      .insert({
        form_data: formData,
        signer_name: formData.nome,
        signer_cpf: formData.cpf.replace(/\D/g, ""),
        signer_email: formData.email,
        status: "pending_upload",
      })
      .select()
      .single();

    if (insertError || !submission) {
      throw new Error(`DB insert failed: ${insertError?.message}`);
    }

    const pdfBytes = await buildRegistrationPdf(formData);

    const d4signBase = Deno.env.get("D4SIGN_BASE_URL") ?? "https://sandbox.d4sign.com.br/api/v1";
    const apiToken = Deno.env.get("D4SIGN_API_TOKEN")!;
    const cryptKey = Deno.env.get("D4SIGN_CRYPT_KEY")!;
    const safeUuid = Deno.env.get("D4SIGN_SAFE_UUID")!;

    const formPayload = new FormData();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const filename = `senge-ce-cadastro-${submission.id}.pdf`;
    formPayload.append("file", pdfBlob, filename);
    formPayload.append("uuidFolder", "");

    const uploadRes = await fetch(
      `${d4signBase}/documents/${safeUuid}/upload?tokenAPI=${apiToken}&cryptKey=${cryptKey}`,
      { method: "POST", body: formPayload }
    );

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      throw new Error(`D4Sign upload failed: ${uploadErr}`);
    }

    const uploadData = await uploadRes.json();
    const documentUuid = uploadData?.uuid ?? uploadData?.[0]?.uuid;

    if (!documentUuid) {
      throw new Error(`D4Sign upload returned no document UUID: ${JSON.stringify(uploadData)}`);
    }

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/d4sign-webhook`;

    const createlistRes = await fetch(
      `${d4signBase}/documents/${documentUuid}/createlist?tokenAPI=${apiToken}&cryptKey=${cryptKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signers: [
            {
              email: formData.email,
              act: "1",
              foreign: "0",
              certificadoicpbr: "1",
              assinatura_presencial: "0",
              embed_methodauth: "cpf",
              embed_smsnumber: "",
            },
          ],
        }),
      }
    );

    if (!createlistRes.ok) {
      const listErr = await createlistRes.text();
      throw new Error(`D4Sign createlist failed: ${listErr}`);
    }

    const listData = await createlistRes.json();
    const signerKey = listData?.[0]?.key_signer ?? listData?.message?.[0]?.key_signer;

    const sendRes = await fetch(
      `${d4signBase}/documents/${documentUuid}/sendtosigner?tokenAPI=${apiToken}&cryptKey=${cryptKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Por favor, assine o formulário de filiação/atualização cadastral do SENGE-CE.",
          workflow: "0",
          url_webhook: webhookUrl,
          skip_email: "0",
        }),
      }
    );

    if (!sendRes.ok) {
      const sendErr = await sendRes.text();
      throw new Error(`D4Sign sendtosigner failed: ${sendErr}`);
    }

    let signingLink = `https://sandbox.d4sign.com.br/assinatura/${documentUuid}`;
    if (signerKey) {
      signingLink = `https://sandbox.d4sign.com.br/embed/viewblob/${documentUuid}?signer_key=${signerKey}&tokenAPI=${apiToken}&crypto_key=${cryptKey}`;
    }

    await supabase
      .from("registration_submissions")
      .update({
        d4sign_document_uuid: documentUuid,
        d4sign_safe_uuid: safeUuid,
        signing_link: signingLink,
        status: "pending_signature",
      })
      .eq("id", submission.id);

    return new Response(
      JSON.stringify({
        submissionId: submission.id,
        signingLink,
        documentUuid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
